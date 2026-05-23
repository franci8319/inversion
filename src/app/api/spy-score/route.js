// Cache en memoria para no quemar las 25 llamadas/día de Alpha Vantage
let cache = null
let cacheTime = 0
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutos

const AV_KEY = () => process.env.ALPHA_VANTAGE_API_KEY
const AV_BASE = 'https://www.alphavantage.co/query'

async function fetchAV(params) {
  const url = new URL(AV_BASE)
  url.searchParams.set('apikey', AV_KEY())
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  return res.json()
}

function calcScore({ price, sma200, changePercent, volume, avgVolume20d, dayHigh, dayLow }) {
  const scores = {
    above_sma200:    { points: 0, max: 2, label: 'SPY > SMA200',              value: null },
    positive_change: { points: 0, max: 2, label: 'Cambio ≥ +0.3%',            value: null },
    high_volume:     { points: 0, max: 1, label: 'Volumen > 120% media 20d',   value: null },
    upper_range:     { points: 0, max: 1, label: 'Precio en tercio superior',  value: null },
  }

  // +2: precio por encima de SMA200
  scores.above_sma200.value = `${price.toFixed(2)} vs SMA200 ${sma200.toFixed(2)}`
  if (price > sma200) scores.above_sma200.points = 2

  // +2: cambio diario ≥ 0.3%
  scores.positive_change.value = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`
  if (changePercent >= 0.3) scores.positive_change.points = 2

  // +1: volumen > 120% de la media de 20 días
  const volRatio = avgVolume20d > 0 ? (volume / avgVolume20d) * 100 : 0
  scores.high_volume.value = `${volRatio.toFixed(0)}% de la media`
  if (volRatio > 120) scores.high_volume.points = 1

  // +1: precio en el tercio superior del rango del día
  const range = dayHigh - dayLow
  const posInRange = range > 0 ? ((price - dayLow) / range) * 100 : 50
  scores.upper_range.value = `${posInRange.toFixed(0)}% del rango`
  if (posInRange >= 67) scores.upper_range.points = 1

  const total = Object.values(scores).reduce((s, x) => s + x.points, 0)
  const maxTotal = Object.values(scores).reduce((s, x) => s + x.max, 0)

  let signal, color
  if (total >= 5)      { signal = 'MUY ALCISTA';  color = 'green'  }
  else if (total >= 3) { signal = 'NEUTRAL';       color = 'yellow' }
  else                 { signal = 'PRECAUCIÓN';    color = 'red'    }

  return { total, maxTotal, signal, color, breakdown: scores }
}

export async function GET() {
  if (!AV_KEY()) {
    return Response.json({ error: 'ALPHA_VANTAGE_API_KEY no configurada' }, { status: 503 })
  }

  // Devuelve cache si es reciente
  if (cache && Date.now() - cacheTime < CACHE_TTL_MS) {
    return Response.json({ ...cache, cached: true })
  }

  try {
    // Llamada 1: datos diarios (SMA200 + media volumen 20d + cambio diario)
    const daily = await fetchAV({ function: 'TIME_SERIES_DAILY', symbol: 'SPY', outputsize: 'full' })
    const timeSeries = daily['Time Series (Daily)']
    if (!timeSeries) throw new Error('Sin datos diarios de Alpha Vantage')

    const days = Object.entries(timeSeries)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .slice(0, 200)

    const todayData  = days[0][1]
    const closeToday = parseFloat(todayData['4. close'])
    const openToday  = parseFloat(todayData['1. open'])
    const highToday  = parseFloat(todayData['2. high'])
    const lowToday   = parseFloat(todayData['3. low'])
    const volToday   = parseInt(todayData['5. volume'])
    const changePercent = ((closeToday - openToday) / openToday) * 100

    // SMA200: media de los últimos 200 cierres
    const closes200 = days.slice(0, 200).map(([, d]) => parseFloat(d['4. close']))
    const sma200 = closes200.reduce((s, v) => s + v, 0) / closes200.length

    // Media volumen 20 días (excluye hoy)
    const vols20 = days.slice(1, 21).map(([, d]) => parseInt(d['5. volume']))
    const avgVolume20d = vols20.reduce((s, v) => s + v, 0) / vols20.length

    // Llamada 2: intraday 5min para precio más reciente del día
    const intraday = await fetchAV({
      function: 'TIME_SERIES_INTRADAY',
      symbol: 'SPY',
      interval: '5min',
      outputsize: 'compact'
    })
    const intraSeires = intraday['Time Series (5min)']
    let currentPrice = closeToday
    let intradayHigh = highToday
    let intradayLow  = lowToday

    if (intraSeires) {
      const latestBar = Object.values(intraSeires)[0]
      currentPrice = parseFloat(latestBar['4. close'])
      // Calcular high/low del día completo desde intraday
      const todayStr = Object.keys(intraSeires)[0].split(' ')[0]
      const todayBars = Object.entries(intraSeires).filter(([t]) => t.startsWith(todayStr))
      intradayHigh = Math.max(...todayBars.map(([, b]) => parseFloat(b['2. high'])))
      intradayLow  = Math.min(...todayBars.map(([, b]) => parseFloat(b['3. low'])))
    }

    const score = calcScore({
      price: currentPrice,
      sma200,
      changePercent,
      volume: volToday,
      avgVolume20d,
      dayHigh: intradayHigh,
      dayLow: intradayLow
    })

    const result = {
      symbol: 'SPY',
      price: currentPrice,
      changePercent,
      sma200: parseFloat(sma200.toFixed(2)),
      volume: volToday,
      avgVolume20d: Math.round(avgVolume20d),
      score,
      timestamp: new Date().toISOString(),
      cached: false
    }

    cache = result
    cacheTime = Date.now()

    return Response.json(result)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

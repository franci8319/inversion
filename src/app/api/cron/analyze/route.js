import { getChannelVideos, getVideoTranscript } from "@/lib/youtube"
import { analyzeTranscript } from "@/lib/gemini"
import { saveAnalysis, isVideoAnalyzed, getStoredVideos } from "@/lib/storage"
import { CHANNELS_TO_MONITOR, MAX_VIDEOS_PER_CHANNEL } from "@/lib/constants"
import { generateId, buildVideoUrl } from "@/lib/utils"
import { sendDailyReport } from "@/lib/email"

export const maxDuration = 300

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const GEMINI_DELAY_MS = 15000

const AV_BASE = "https://www.alphavantage.co/query"

async function getSpyScore() {
  const key = process.env.ALPHA_VANTAGE_API_KEY
  if (!key) return null

  try {
    const [dailyRes, intradayRes] = await Promise.all([
      fetch(`${AV_BASE}?function=TIME_SERIES_DAILY&symbol=SPY&outputsize=full&apikey=${key}`),
      fetch(`${AV_BASE}?function=TIME_SERIES_INTRADAY&symbol=SPY&interval=5min&outputsize=compact&apikey=${key}`)
    ])
    const daily    = await dailyRes.json()
    const intraday = await intradayRes.json()

    const timeSeries = daily["Time Series (Daily)"]
    if (!timeSeries) return null

    const days = Object.entries(timeSeries)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .slice(0, 200)

    const todayData    = days[0][1]
    const openToday    = parseFloat(todayData["1. open"])
    const highToday    = parseFloat(todayData["2. high"])
    const lowToday     = parseFloat(todayData["3. low"])
    const closeToday   = parseFloat(todayData["4. close"])
    const volToday     = parseInt(todayData["5. volume"])
    const changePercent = ((closeToday - openToday) / openToday) * 100

    const closes200  = days.slice(0, 200).map(([, d]) => parseFloat(d["4. close"]))
    const sma200     = closes200.reduce((s, v) => s + v, 0) / closes200.length
    const vols20     = days.slice(1, 21).map(([, d]) => parseInt(d["5. volume"]))
    const avgVol20d  = vols20.reduce((s, v) => s + v, 0) / vols20.length

    let price = closeToday, dayHigh = highToday, dayLow = lowToday
    const intraSeries = intraday["Time Series (5min)"]
    if (intraSeries) {
      const latestBar  = Object.values(intraSeries)[0]
      price            = parseFloat(latestBar["4. close"])
      const todayStr   = Object.keys(intraSeries)[0].split(" ")[0]
      const todayBars  = Object.entries(intraSeries).filter(([t]) => t.startsWith(todayStr))
      dayHigh = Math.max(...todayBars.map(([, b]) => parseFloat(b["2. high"])))
      dayLow  = Math.min(...todayBars.map(([, b]) => parseFloat(b["3. low"])))
    }

    // Scoring Sistema Cava
    const breakdown = {
      above_sma200:    { points: 0, max: 2, label: "SPY > SMA200",             value: `${price.toFixed(2)} vs ${sma200.toFixed(2)}` },
      positive_change: { points: 0, max: 2, label: "Cambio ≥ +0.3%",           value: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%` },
      high_volume:     { points: 0, max: 1, label: "Volumen > 120% media 20d",  value: `${avgVol20d > 0 ? ((volToday / avgVol20d) * 100).toFixed(0) : "?"}%` },
      upper_range:     { points: 0, max: 1, label: "Precio en tercio superior", value: "" },
    }

    if (price > sma200) breakdown.above_sma200.points = 2
    if (changePercent >= 0.3) breakdown.positive_change.points = 2
    const volRatio = avgVol20d > 0 ? (volToday / avgVol20d) * 100 : 0
    if (volRatio > 120) breakdown.high_volume.points = 1
    const range = dayHigh - dayLow
    const posInRange = range > 0 ? ((price - dayLow) / range) * 100 : 50
    breakdown.upper_range.value = `${posInRange.toFixed(0)}% del rango`
    if (posInRange >= 67) breakdown.upper_range.points = 1

    const total    = Object.values(breakdown).reduce((s, x) => s + x.points, 0)
    const maxTotal = Object.values(breakdown).reduce((s, x) => s + x.max, 0)
    const signal   = total >= 5 ? "MUY ALCISTA" : total >= 3 ? "NEUTRAL" : "PRECAUCIÓN"
    const color    = total >= 5 ? "green" : total >= 3 ? "yellow" : "red"

    return { symbol: "SPY", price, changePercent, sma200: parseFloat(sma200.toFixed(2)), volume: volToday, avgVolume20d: Math.round(avgVol20d), score: { total, maxTotal, signal, color, breakdown }, timestamp: new Date().toISOString() }
  } catch (err) {
    console.error("[CRON] SPY score error:", err.message)
    return null
  }
}

export async function GET(request) {
  const isDev = process.env.NODE_ENV === "development"

  if (!isDev) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }
  }

  const results = { analyzed: [], skipped: [], errors: [] }

  // 1. Analizar videos nuevos
  for (const channel of CHANNELS_TO_MONITOR) {
    console.log(`[CRON] Canal: ${channel.name}`)
    let videos
    try {
      videos = await getChannelVideos(channel.channelId, MAX_VIDEOS_PER_CHANNEL)
    } catch (err) {
      results.errors.push({ channel: channel.name, error: err.message })
      continue
    }

    for (const video of videos) {
      if (await isVideoAnalyzed(video.id)) { results.skipped.push(video.id); continue }

      console.log(`[CRON] Analizando: ${video.title}`)
      const transcript = await getVideoTranscript(video.id)
      if (!transcript) { results.errors.push({ videoId: video.id, error: "Sin transcripción" }); continue }

      try {
        await sleep(GEMINI_DELAY_MS)
        const analysis = await analyzeTranscript(transcript, video.title)
        const saved = { id: generateId(), youtube_id: video.id, title: video.title, channel: channel.name, url: buildVideoUrl(video.id), thumbnail: video.thumbnail, published_date: video.publishedAt, transcript, analysis, timestamp_analyzed: new Date().toISOString() }
        await saveAnalysis(saved)
        results.analyzed.push(saved)
      } catch (err) {
        results.errors.push({ videoId: video.id, title: video.title, error: err.message })
      }
    }
  }

  // 2. Scoring SPY a las 21:10h (cierre institucional)
  console.log("[CRON] Calculando scoring SPY...")
  const spyScore = await getSpyScore()

  // 3. Enviar email resumen
  if (process.env.RESEND_API_KEY) {
    try {
      const allVideos = await getStoredVideos()
      await sendDailyReport({
        spyScore,
        newVideos: results.analyzed,
        totalVideos: allVideos.length
      })
      console.log("[CRON] Email enviado a", process.env.NOTIFY_EMAIL)
    } catch (err) {
      console.error("[CRON] Error email:", err.message)
    }
  }

  return Response.json({
    success: true,
    message: `${results.analyzed.length} videos analizados · SPY ${spyScore?.score?.total ?? "?"}/${spyScore?.score?.maxTotal ?? 6} pts · Email enviado`,
    spyScore,
    ...results
  })
}

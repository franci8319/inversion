import { formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function timeAgo(dateString) {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: es })
  } catch {
    return dateString
  }
}

export function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  } catch {
    return dateString
  }
}

export function buildVideoUrl(youtubeId) {
  return `https://youtube.com/watch?v=${youtubeId}`
}

export function generateId() {
  return `video_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function computeSummary(videos) {
  const counts = { ALCISTA: 0, BAJISTA: 0, NEUTRAL: 0, COMPRA: 0, VENTA: 0, ESPERA: 0, ACCUMULATE: 0 }
  let totalSentiment = 0
  let sentimentCount = 0

  for (const v of videos) {
    const a = v.analysis || {}
    if (a.tendencia && counts[a.tendencia] !== undefined) counts[a.tendencia]++
    if (a.recomendacion && counts[a.recomendacion] !== undefined) counts[a.recomendacion]++
    if (a.sentiment_score) { totalSentiment += a.sentiment_score; sentimentCount++ }
  }

  return {
    ...counts,
    total: videos.length,
    avg_sentiment: sentimentCount > 0 ? (totalSentiment / sentimentCount).toFixed(1) : null
  }
}

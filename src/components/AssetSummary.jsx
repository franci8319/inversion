"use client"

import { TREND_COLORS, RECOMMENDATION_COLORS } from "@/lib/constants"

export default function AssetSummary({ asset, analyses }) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-2">{asset}</h3>
        <p className="text-gray-500 text-sm">Sin análisis disponibles</p>
      </div>
    )
  }

  const sorted = [...analyses].sort(
    (a, b) => new Date(b.published_date) - new Date(a.published_date)
  )
  const latest = sorted[0]?.analysis || {}

  const avgSentiment = (
    analyses.reduce((sum, a) => sum + (a.analysis?.sentiment_score || 0), 0) /
    analyses.length
  ).toFixed(1)

  const trend = TREND_COLORS[latest.tendencia] || TREND_COLORS.NEUTRAL
  const recColor = RECOMMENDATION_COLORS[latest.recomendacion] || "text-gray-400"

  const trendEmoji = { ALCISTA: "📈", BAJISTA: "📉", NEUTRAL: "➡️" }[latest.tendencia] || "—"

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{asset}</h3>
        <span className="text-xs text-gray-500">{analyses.length} análisis</span>
      </div>

      <div className="mb-3">
        <p className="text-gray-400 text-xs mb-1">Tendencia actual</p>
        <p className={`text-2xl font-bold ${trend.text}`}>
          {trendEmoji} {latest.tendencia || "—"}
        </p>
      </div>

      {latest.recomendacion && (
        <div className="mb-3">
          <p className="text-gray-400 text-xs mb-1">Recomendación</p>
          <p className={`font-semibold text-base ${recColor.split(" ")[0]}`}>
            {latest.recomendacion}
          </p>
        </div>
      )}

      <div>
        <p className="text-gray-400 text-xs mb-2">Sentimiento promedio</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(avgSentiment / 10) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-white">{avgSentiment}</span>
        </div>
      </div>

      {latest.tesis_principal && (
        <p className="text-gray-400 text-xs mt-3 line-clamp-2">{latest.tesis_principal}</p>
      )}
    </div>
  )
}

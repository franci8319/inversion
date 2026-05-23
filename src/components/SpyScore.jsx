"use client"

import { useState, useEffect } from "react"

const COLOR = {
  green:  { bg: "bg-green-900/40",  border: "border-green-500",  text: "text-green-300",  dot: "bg-green-400"  },
  yellow: { bg: "bg-yellow-900/40", border: "border-yellow-500", text: "text-yellow-300", dot: "bg-yellow-400" },
  red:    { bg: "bg-red-900/40",    border: "border-red-500",    text: "text-red-300",    dot: "bg-red-400"    },
}

export default function SpyScore() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/spy-score")
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-40 mb-3" />
      <div className="h-10 bg-gray-700 rounded w-24 mb-3" />
      <div className="h-3 bg-gray-700 rounded w-full" />
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-5">
      <p className="text-xs text-gray-400 mb-1">Scoring SPY · 21:10h</p>
      <p className="text-red-400 text-sm">{error}</p>
      {error.includes('API_KEY') && (
        <p className="text-gray-500 text-xs mt-1">Añade ALPHA_VANTAGE_API_KEY a .env.local</p>
      )}
      <button onClick={load} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Reintentar</button>
    </div>
  )

  const { score, price, changePercent, sma200, volume, avgVolume20d, cached, timestamp } = data
  const c = COLOR[score.color] || COLOR.yellow

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400">Scoring SPY · 21:10h</p>
          <p className="text-2xl font-bold text-white">
            ${price.toFixed(2)}
            <span className={`text-sm ml-2 ${changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
              {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
            </span>
          </p>
        </div>
        {/* Score total */}
        <div className="text-center">
          <div className={`text-4xl font-black ${c.text}`}>{score.total}</div>
          <div className="text-xs text-gray-500">/ {score.maxTotal} pts</div>
        </div>
      </div>

      {/* Señal */}
      <div className={`flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg ${c.bg} border ${c.border}`}>
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-sm font-bold ${c.text}`}>{score.signal}</span>
      </div>

      {/* Desglose de puntos */}
      <div className="space-y-2">
        {Object.entries(score.breakdown).map(([key, item]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold w-4 text-center ${item.points > 0 ? "text-green-400" : "text-gray-600"}`}>
                {item.points > 0 ? `+${item.points}` : "·"}
              </span>
              <span className="text-xs text-gray-300">{item.label}</span>
            </div>
            <span className="text-xs text-gray-500">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {cached ? "Caché" : "En vivo"} · {new Date(timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}h
        </span>
        <button onClick={load} className="text-xs text-blue-400 hover:text-blue-300">
          Actualizar
        </button>
      </div>
    </div>
  )
}

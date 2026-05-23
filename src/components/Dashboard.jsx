"use client"

import { useState, useMemo } from "react"
import VideoCard from "./VideoCard"
import AssetSummary from "./AssetSummary"
import { SkeletonCard } from "./LoadingState"
import { ASSETS } from "@/lib/constants"
import { timeAgo } from "@/lib/utils"

const ASSET_LIST = [ASSETS.BITCOIN, ASSETS.SP500, ASSETS.GOLD, ASSETS.MULTIPLE]

export default function Dashboard({ analyses = [], loading, summary, metadata, onRefresh }) {
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [sortBy, setSortBy] = useState("date")

  const assetGrouped = useMemo(() => {
    const groups = Object.fromEntries(ASSET_LIST.map((a) => [a, []]))
    analyses.forEach((v) => {
      const asset = v.analysis?.activo || ASSETS.MULTIPLE
      if (groups[asset]) groups[asset].push(v)
      else groups[ASSETS.MULTIPLE].push(v)
    })
    return groups
  }, [analyses])

  const displayedVideos = useMemo(() => {
    const list = selectedAsset ? (assetGrouped[selectedAsset] || []) : analyses
    return [...list].sort((a, b) => {
      if (sortBy === "sentiment") {
        return (b.analysis?.sentiment_score || 0) - (a.analysis?.sentiment_score || 0)
      }
      return new Date(b.published_date) - new Date(a.published_date)
    })
  }, [analyses, assetGrouped, selectedAsset, sortBy])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Análisis Financiero Automático</h1>
            <p className="text-gray-400 text-sm">José Luis Cava · Bitcoin · S&P 500 · Oro</p>
          </div>
          <button
            onClick={onRefresh}
            className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard label="Total" value={summary?.total ?? analyses.length} />
          <StatCard label="ALCISTA" value={summary?.ALCISTA ?? 0} color="green" />
          <StatCard label="BAJISTA" value={summary?.BAJISTA ?? 0} color="red" />
          <StatCard label="COMPRA" value={summary?.COMPRA ?? 0} color="blue" />
          <StatCard label="ESPERA" value={summary?.ESPERA ?? 0} color="yellow" />
          <StatCard
            label="Últimas 24h"
            value={analyses.filter((a) => Date.now() - new Date(a.published_date) < 86400000).length}
          />
        </div>

        {/* Resumen por activo */}
        {!selectedAsset && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[ASSETS.BITCOIN, ASSETS.SP500, ASSETS.GOLD].map((asset) => (
              <AssetSummary key={asset} asset={asset} analyses={assetGrouped[asset]} />
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedAsset(null)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                !selectedAsset ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Todos ({analyses.length})
            </button>
            {ASSET_LIST.map((asset) => (
              <button
                key={asset}
                onClick={() => setSelectedAsset(selectedAsset === asset ? null : asset)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedAsset === asset
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {asset} ({assetGrouped[asset]?.length ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* Ordenar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {selectedAsset ? selectedAsset : "Todos los videos"}
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white text-sm px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="date">Más reciente</option>
            <option value="sentiment">Sentimiento</option>
          </select>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayedVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedVideos.map((video) => (
              <VideoCard key={video.id || video.youtube_id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">No hay análisis disponibles</p>
            <p className="text-gray-600 text-sm">
              Ejecuta el análisis manual desde <code className="bg-gray-800 px-1 rounded">/api/cron/analyze</code>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-700 text-center text-gray-500 text-xs">
          {metadata?.last_update
            ? `Última actualización: ${timeAgo(metadata.last_update)}`
            : "Sin datos aún"}
          {" · "}Próxima actualización automática cada 6h
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color = "default" }) {
  const colors = {
    default: "bg-gray-700/50 text-white",
    green: "bg-green-900/40 text-green-200",
    red: "bg-red-900/40 text-red-200",
    blue: "bg-blue-900/40 text-blue-200",
    yellow: "bg-yellow-900/40 text-yellow-200"
  }
  return (
    <div className={`rounded-lg p-4 ${colors[color]}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

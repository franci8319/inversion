"use client"

import { TREND_COLORS, RECOMMENDATION_COLORS } from "@/lib/constants"
import { formatDate } from "@/lib/utils"

function Badge({ color, children }) {
  const colors = {
    green: "bg-green-900/50 text-green-300 border-green-700/50",
    blue: "bg-blue-900/50 text-blue-300 border-blue-700/50",
    yellow: "bg-yellow-900/50 text-yellow-300 border-yellow-700/50",
    red: "bg-red-900/50 text-red-300 border-red-700/50"
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${colors[color]}`}>
      {children}
    </span>
  )
}

export default function VideoCard({ video }) {
  const analysis = video.analysis || {}
  const trend = TREND_COLORS[analysis.tendencia] || TREND_COLORS.NEUTRAL
  const recColor = RECOMMENDATION_COLORS[analysis.recomendacion] || "text-gray-400 bg-gray-700/30"

  return (
    <div className={`rounded-lg p-6 border-l-4 ${trend.border} ${trend.bg} bg-gray-800`}>
      {/* Header */}
      <div className="mb-4">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-bold text-white hover:text-blue-400 transition line-clamp-2"
        >
          {video.title}
        </a>
        <p className="text-xs text-gray-400 mt-1">
          {video.channel} · {formatDate(video.published_date)}
        </p>
      </div>

      {/* Activo + Recomendación */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded-full font-semibold">
          {analysis.activo || "—"}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${recColor}`}>
          {analysis.recomendacion || "—"}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full font-bold ${trend.text} bg-transparent border border-current`}>
          {analysis.tendencia || "—"}
        </span>
      </div>

      {/* Tesis */}
      {analysis.tesis_principal && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{analysis.tesis_principal}</p>
      )}

      {/* Confianza + Sentimiento */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-xs text-gray-500">Confianza</p>
          <p className="text-sm font-semibold">
            {analysis.confianza === "ALTA" && <span className="text-green-400">● ALTA</span>}
            {analysis.confianza === "MEDIA" && <span className="text-yellow-400">● MEDIA</span>}
            {analysis.confianza === "BAJA" && <span className="text-red-400">● BAJA</span>}
            {!analysis.confianza && <span className="text-gray-500">—</span>}
          </p>
        </div>
        {analysis.sentiment_score != null && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Sentimiento</p>
            <p className="font-bold text-lg text-white">
              {Number(analysis.sentiment_score).toFixed(1)}
              <span className="text-xs text-gray-400">/10</span>
            </p>
          </div>
        )}
      </div>

      {/* Niveles técnicos */}
      {analysis.niveles_tecnicos && (
        <div className="bg-gray-900/60 rounded p-3 mb-4 text-xs">
          <p className="text-gray-400 font-semibold mb-2">Niveles Técnicos</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500">Soporte</p>
              <p className="text-green-400">{analysis.niveles_tecnicos.soportes?.[0] || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">Resistencia</p>
              <p className="text-red-400">{analysis.niveles_tecnicos.resistencias?.[0] || "N/A"}</p>
            </div>
          </div>
          {analysis.niveles_tecnicos.zona_operacion && (
            <p className="text-gray-300 mt-2">{analysis.niveles_tecnicos.zona_operacion}</p>
          )}
        </div>
      )}

      {/* Acción */}
      {analysis.accion_especifica && (
        <div className="bg-blue-900/30 border border-blue-700/50 rounded p-3 text-xs text-blue-200 mb-4">
          <p className="font-semibold mb-1">Acción</p>
          <p>{analysis.accion_especifica}</p>
        </div>
      )}

      {/* Riesgos */}
      {analysis.riesgos?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-semibold mb-1">Riesgos</p>
          <ul className="text-xs text-gray-400 space-y-1">
            {analysis.riesgos.slice(0, 2).map((r, i) => (
              <li key={i}>· {r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Señales Sistema Cava */}
      {analysis.senales_sistema_cava && (
        <div className="bg-gray-900/60 rounded p-3 mb-4">
          <p className="text-xs text-gray-400 font-semibold mb-2">Señales Sistema Cava</p>
          <div className="flex flex-wrap gap-1">
            {analysis.senales_sistema_cava.manos_debiles_liquidadas && (
              <Badge color="green">Manos débiles liquidadas</Badge>
            )}
            {analysis.senales_sistema_cava.limpieza_tecnica && (
              <Badge color="green">Limpieza técnica</Badge>
            )}
            {analysis.senales_sistema_cava.acumulacion_institucional && (
              <Badge color="blue">Acumulación institucional</Badge>
            )}
            {analysis.senales_sistema_cava.rebaja_cava && (
              <Badge color="yellow">Rebaja de Cava</Badge>
            )}
            {analysis.senales_sistema_cava.efectivo_como_arma && (
              <Badge color="yellow">Efectivo como arma</Badge>
            )}
            {analysis.senales_sistema_cava.sentimiento_extremo === "euforia" && (
              <Badge color="red">Sentimiento: Euforia</Badge>
            )}
            {analysis.senales_sistema_cava.sentimiento_extremo === "pánico" && (
              <Badge color="green">Sentimiento: Pánico</Badge>
            )}
          </div>
          {analysis.senales_sistema_cava.notas && (
            <p className="text-xs text-gray-400 mt-2">{analysis.senales_sistema_cava.notas}</p>
          )}
        </div>
      )}

      {/* Frase clave */}
      {analysis.frase_clave && (
        <blockquote className="border-l-2 border-gray-600 pl-3 text-xs text-gray-400 italic mb-4 line-clamp-2">
          "{analysis.frase_clave}"
        </blockquote>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-gray-700">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
        >
          Ver en YouTube →
        </a>
      </div>
    </div>
  )
}

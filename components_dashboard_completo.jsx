// src/components/Dashboard.jsx
"use client";

import { useState, useMemo } from "react";
import VideoCard from "./VideoCard";
import AssetSummary from "./AssetSummary";
import TrendIndicator from "./TrendIndicator";

export default function Dashboard({ analyses, loading }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [sortBy, setSortBy] = useState("date"); // 'date' o 'sentiment'

  // Agrupar análisis por activo
  const assetGrouped = useMemo(() => {
    const grouped = {
      "Bitcoin": [],
      "S&P 500": [],
      "Oro": [],
      "Múltiples": []
    };

    analyses.forEach((analysis) => {
      const asset = analysis.analysis?.activo || "Múltiples";
      if (grouped[asset]) {
        grouped[asset].push(analysis);
      }
    });

    return grouped;
  }, [analyses]);

  // Contar señales por tipo
  const signals = useMemo(() => {
    const counts = {
      ALCISTA: 0,
      BAJISTA: 0,
      NEUTRAL: 0,
      ESPERA: 0,
      COMPRA: 0,
      VENTA: 0
    };

    analyses.forEach((a) => {
      if (a.analysis?.recomendacion) {
        counts[a.analysis.recomendacion]++;
      }
    });

    return counts;
  }, [analyses]);

  // Ordenar análisis
  const sortedAnalyses = useMemo(() => {
    let filtered = analyses;

    if (selectedAsset) {
      filtered = assetGrouped[selectedAsset] || [];
    }

    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.published_date) - new Date(a.published_date)
        );
      } else if (sortBy === "sentiment") {
        const scoreA = a.analysis?.sentiment_score || 0;
        const scoreB = b.analysis?.sentiment_score || 0;
        return scoreB - scoreA;
      }
      return 0;
    });
  }, [analyses, selectedAsset, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando análisis financieros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Análisis Financiero Automático
          </h1>
          <p className="text-gray-400">
            José Luis Cava - Bitcoin, S&P 500, Oro
          </p>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total Análisis" value={analyses.length} />
          <StatCard label="ALCISTA" value={signals.ALCISTA} color="green" />
          <StatCard label="BAJISTA" value={signals.BAJISTA} color="red" />
          <StatCard label="COMPRA" value={signals.COMPRA} color="blue" />
          <StatCard label="ESPERA" value={signals.ESPERA} color="yellow" />
          <StatCard label="Últimas 24h" value={
            analyses.filter(a => 
              (new Date() - new Date(a.published_date)) < 24 * 60 * 60 * 1000
            ).length
          } />
        </div>

        {/* ASSET SELECTOR */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Filtrar por Activo</h2>
          <div className="flex flex-wrap gap-3">
            {Object.keys(assetGrouped).map((asset) => (
              <button
                key={asset}
                onClick={() => setSelectedAsset(selectedAsset === asset ? null : asset)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedAsset === asset
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
              >
                {asset} ({assetGrouped[asset].length})
              </button>
            ))}
          </div>
        </div>

        {/* ASSET SUMMARIES */}
        {!selectedAsset && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AssetSummary 
              asset="Bitcoin" 
              analyses={assetGrouped["Bitcoin"]} 
            />
            <AssetSummary 
              asset="S&P 500" 
              analyses={assetGrouped["S&P 500"]} 
            />
            <AssetSummary 
              asset="Oro" 
              analyses={assetGrouped["Oro"]} 
            />
          </div>
        )}

        {/* SORT CONTROLS */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            Videos Analizados {selectedAsset && `- ${selectedAsset}`}
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="date">Más Reciente</option>
            <option value="sentiment">Sentimiento</option>
          </select>
        </div>

        {/* VIDEO CARDS */}
        {sortedAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAnalyses.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No hay análisis disponibles
            </p>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>
            Última actualización: {
              analyses.length > 0
                ? new Date(analyses[0].timestamp_analyzed).toLocaleString("es-ES")
                : "Nunca"
            }
          </p>
          <p>Próxima actualización automática en ~6 horas</p>
        </div>
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES

function StatCard({ label, value, color = "white" }) {
  const colorClasses = {
    white: "bg-gray-700 text-white",
    green: "bg-green-900 text-green-100",
    red: "bg-red-900 text-red-100",
    blue: "bg-blue-900 text-blue-100",
    yellow: "bg-yellow-900 text-yellow-100"
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-gray-300 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

// src/components/VideoCard.jsx
export function VideoCard({ video }) {
  const analysis = video.analysis || {};
  const trendColor = {
    ALCISTA: "border-green-500 bg-green-900/20",
    BAJISTA: "border-red-500 bg-red-900/20",
    NEUTRAL: "border-gray-500 bg-gray-700/20"
  };

  const recommendationColor = {
    COMPRA: "text-green-400 bg-green-900/30",
    VENTA: "text-red-400 bg-red-900/30",
    ESPERA: "text-yellow-400 bg-yellow-900/30",
    ACCUMULATE: "text-blue-400 bg-blue-900/30"
  };

  return (
    <div className={`rounded-lg p-6 border-l-4 ${trendColor[analysis.tendencia]}`}>
      {/* HEADER */}
      <div className="mb-4">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-bold text-white hover:text-blue-400 transition truncate"
        >
          {video.title}
        </a>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(video.published_date).toLocaleDateString("es-ES")}
        </p>
      </div>

      {/* ASSET & SIGNAL */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-gray-700 text-gray-200 text-xs rounded-full font-semibold">
          {analysis.activo}
        </span>
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold ${recommendationColor[analysis.recomendacion]}`}
        >
          {analysis.recomendacion}
        </span>
      </div>

      {/* TESIS PRINCIPAL */}
      {analysis.tesis_principal && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {analysis.tesis_principal}
        </p>
      )}

      {/* CONFIANZA & SENTIMENT */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-xs text-gray-500">Confianza</p>
          <p className="font-semibold text-sm">
            {analysis.confianza === "ALTA" && "🟢"}
            {analysis.confianza === "MEDIA" && "🟡"}
            {analysis.confianza === "BAJA" && "🔴"}
            {analysis.confianza}
          </p>
        </div>
        {analysis.sentiment_score && (
          <div className="text-center">
            <p className="text-xs text-gray-500">Sentimiento</p>
            <p className="font-bold text-lg">{analysis.sentiment_score.toFixed(1)}/10</p>
          </div>
        )}
      </div>

      {/* NIVELES TÉCNICOS */}
      {analysis.niveles_tecnicos && (
        <div className="bg-gray-800/50 rounded p-3 mb-4 text-xs">
          <p className="text-gray-400 font-semibold mb-2">Niveles Técnicos</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500">Soportes</p>
              <p className="text-green-400">
                {analysis.niveles_tecnicos.soportes?.[0] || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Resistencias</p>
              <p className="text-red-400">
                {analysis.niveles_tecnicos.resistencias?.[0] || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACCIÓN ESPECÍFICA */}
      {analysis.accion_especifica && (
        <div className="bg-blue-900/30 border border-blue-700 rounded p-3 text-xs text-blue-200">
          <p className="font-semibold mb-1">🎯 Acción</p>
          <p>{analysis.accion_especifica}</p>
        </div>
      )}

      {/* RIESGOS */}
      {analysis.riesgos && analysis.riesgos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-semibold mb-2">⚠️ Riesgos</p>
          <ul className="text-xs text-gray-300 space-y-1">
            {analysis.riesgos.slice(0, 2).map((risk, idx) => (
              <li key={idx} className="text-gray-400">
                • {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* LINK A VIDEO */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-2"
        >
          Ver en YouTube →
        </a>
      </div>
    </div>
  );
}

// src/components/AssetSummary.jsx
function AssetSummary({ asset, analyses }) {
  if (analyses.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">{asset}</h3>
        <p className="text-gray-400">Sin análisis disponibles</p>
      </div>
    );
  }

  const latest = analyses[0]?.analysis || {};
  const avgSentiment = (
    analyses.reduce((sum, a) => sum + (a.analysis?.sentiment_score || 0), 0) /
    analyses.length
  ).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">{asset}</h3>

      {/* TENDENCIA */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-1">Tendencia Latest</p>
        <p className={`text-2xl font-bold ${
          latest.tendencia === "ALCISTA" ? "text-green-400" :
          latest.tendencia === "BAJISTA" ? "text-red-400" :
          "text-gray-400"
        }`}>
          {latest.tendencia === "ALCISTA" ? "📈" : latest.tendencia === "BAJISTA" ? "📉" : "➡️"}
          {latest.tendencia}
        </p>
      </div>

      {/* RECOMENDACIÓN */}
      {latest.recomendacion && (
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-1">Acción</p>
          <p className={`font-semibold text-lg ${
            latest.recomendacion === "COMPRA" ? "text-green-400" :
            latest.recomendacion === "VENTA" ? "text-red-400" :
            "text-yellow-400"
          }`}>
            {latest.recomendacion}
          </p>
        </div>
      )}

      {/* SENTIMIENTO PROMEDIO */}
      <div>
        <p className="text-gray-400 text-sm mb-1">Sentimiento Promedio</p>
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(avgSentiment / 10) * 100}%` }}
            ></div>
          </div>
          <p className="font-bold text-sm">{avgSentiment}</p>
        </div>
      </div>

      {/* VIDEOS COUNT */}
      <p className="text-xs text-gray-500 mt-4">
        {analyses.length} análisis registrados
      </p>
    </div>
  );
}

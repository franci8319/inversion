export const CHANNELS_TO_MONITOR = [
  {
    name: "José Luis Cava",
    channelId: process.env.CHANNEL_ID_CAVA || "UCvCCLJkQpRg0NdT3zNcI08A",
    youtubeHandle: "JoseLuisCavatv",
    url: "https://www.youtube.com/@JoseLuisCavatv"
  },
  {
    name: "HOPLA Finance",
    channelId: process.env.CHANNEL_ID_HOPLA || "UC6cpU68F1BiwwXoAC3sgcGQ",
    youtubeHandle: "HOPLAFinance",
    url: "https://www.youtube.com/@HOPLAFinance"
  }
]

export const ASSETS = {
  BITCOIN: "Bitcoin",
  SP500: "S&P 500",
  GOLD: "Oro",
  MULTIPLE: "Múltiples"
}

export const TREND_COLORS = {
  ALCISTA: { border: "border-green-500", bg: "bg-green-900/20", text: "text-green-400" },
  BAJISTA: { border: "border-red-500", bg: "bg-red-900/20", text: "text-red-400" },
  NEUTRAL: { border: "border-gray-500", bg: "bg-gray-700/20", text: "text-gray-400" }
}

export const RECOMMENDATION_COLORS = {
  COMPRA: "text-green-400 bg-green-900/30",
  VENTA: "text-red-400 bg-red-900/30",
  ESPERA: "text-yellow-400 bg-yellow-900/30",
  ACCUMULATE: "text-blue-400 bg-blue-900/30"
}

export const ANALYSIS_CONFIG = {
  MODEL: "gemini-2.0-flash-lite",
  TEMPERATURE: 0.3,
  MAX_TOKENS: 2000,
  MAX_TRANSCRIPT_CHARS: 5000
}

export const CHECK_INTERVAL_HOURS = 6
export const MAX_VIDEOS_STORED = 100
export const MAX_VIDEOS_PER_CHANNEL = 5

export default function TrendIndicator({ trend, size = "md" }) {
  const config = {
    ALCISTA: { emoji: "📈", label: "ALCISTA", color: "text-green-400", bg: "bg-green-900/30" },
    BAJISTA: { emoji: "📉", label: "BAJISTA", color: "text-red-400", bg: "bg-red-900/30" },
    NEUTRAL: { emoji: "➡️", label: "NEUTRAL", color: "text-gray-400", bg: "bg-gray-700/30" }
  }

  const t = config[trend] || config.NEUTRAL
  const sizeClass = size === "lg" ? "text-2xl px-4 py-2" : "text-sm px-2 py-1"

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${t.color} ${t.bg} ${sizeClass}`}>
      <span>{t.emoji}</span>
      <span>{t.label}</span>
    </span>
  )
}

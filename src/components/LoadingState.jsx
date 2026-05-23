export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
        <p className="text-white text-lg">Cargando análisis financieros...</p>
        <p className="text-gray-500 text-sm mt-2">José Luis Cava · Bitcoin · S&P 500 · Oro</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg p-6 bg-gray-800 border-l-4 border-gray-700 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-700 rounded-full w-16" />
        <div className="h-6 bg-gray-700 rounded-full w-16" />
      </div>
      <div className="h-3 bg-gray-700 rounded w-full mb-2" />
      <div className="h-3 bg-gray-700 rounded w-5/6" />
    </div>
  )
}

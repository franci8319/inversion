import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Análisis Financiero Automático
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Monitorea y analiza automáticamente los videos de José Luis Cava sobre{" "}
          <span className="text-orange-400">Bitcoin</span>,{" "}
          <span className="text-blue-400">S&P 500</span> y{" "}
          <span className="text-yellow-400">Oro</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-lg"
          >
            Ver Dashboard
          </Link>
          <a
            href="/api/health"
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition text-lg"
          >
            Health Check
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-2xl mb-2">📺</p>
            <p className="font-semibold text-white">YouTube</p>
            <p>Videos nuevos detectados automáticamente cada 6 horas</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-2xl mb-2">🤖</p>
            <p className="font-semibold text-white">Gemini AI</p>
            <p>Análisis de ondas de Elliott y niveles técnicos</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-2xl mb-2">📊</p>
            <p className="font-semibold text-white">Dashboard</p>
            <p>Señales de compra/venta con sentimiento del mercado</p>
          </div>
        </div>
      </div>
    </main>
  )
}

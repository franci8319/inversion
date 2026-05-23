"use client"

import { useEffect, useState, useCallback } from "react"
import Dashboard from "@/components/Dashboard"
import LoadingState from "@/components/LoadingState"

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState([])
  const [summary, setSummary] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch("/api/videos")
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setAnalyses(data.videos || [])
      setSummary(data.summary || null)
      setMetadata(data.metadata || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Error al cargar datos</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <Dashboard
      analyses={analyses}
      loading={false}
      summary={summary}
      metadata={metadata}
      onRefresh={fetchData}
    />
  )
}

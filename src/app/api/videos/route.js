import { getStoredVideos, getMetadata } from "@/lib/storage"
import { computeSummary } from "@/lib/utils"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const asset = searchParams.get("asset")
    const limit = parseInt(searchParams.get("limit") || "50")

    const allVideos = await getStoredVideos()
    const metadata = await getMetadata()

    let videos = allVideos
    if (asset) {
      videos = allVideos.filter((v) => v.analysis?.activo === asset)
    }

    videos = videos.slice(0, limit)

    return Response.json({
      videos,
      metadata,
      summary: computeSummary(allVideos)
    })
  } catch (err) {
    return Response.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}

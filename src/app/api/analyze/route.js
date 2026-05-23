import { getVideoTranscript, getChannelVideos } from "@/lib/youtube"
import { analyzeTranscript } from "@/lib/gemini"
import { saveAnalysis, isVideoAnalyzed } from "@/lib/storage"
import { generateId, buildVideoUrl } from "@/lib/utils"

export async function POST(request) {
  const { videoId, youtubeUrl } = await request.json()

  const id = videoId || extractVideoId(youtubeUrl)
  if (!id) {
    return Response.json({ error: "Proporciona videoId o youtubeUrl" }, { status: 400 })
  }

  const alreadyDone = await isVideoAnalyzed(id)
  if (alreadyDone) {
    return Response.json({ message: "Video ya analizado", videoId: id })
  }

  const transcript = await getVideoTranscript(id)
  if (!transcript) {
    return Response.json({ error: "No se pudo obtener transcripción" }, { status: 422 })
  }

  const title = `Video ${id}`
  const analysis = await analyzeTranscript(transcript, title)

  const videoData = {
    id: generateId(),
    youtube_id: id,
    title,
    channel: "Manual",
    url: buildVideoUrl(id),
    published_date: new Date().toISOString(),
    transcript,
    analysis,
    timestamp_analyzed: new Date().toISOString()
  }

  await saveAnalysis(videoData)

  return Response.json({ success: true, videoData })
}

function extractVideoId(url) {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] || null
}

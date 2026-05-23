import { analyzeTranscript } from "@/lib/gemini"
import { saveAnalysis, isVideoAnalyzed } from "@/lib/storage"
import { generateId, buildVideoUrl } from "@/lib/utils"

export const maxDuration = 60

export async function POST(request) {
  const { videoId, title, channel, transcript, publishedDate } = await request.json()

  if (!videoId || !title || !channel || !transcript) {
    return Response.json({ error: "Faltan campos: videoId, title, channel, transcript" }, { status: 400 })
  }

  const already = await isVideoAnalyzed(videoId)
  if (already) {
    return Response.json({ skipped: true, message: `${title} ya estaba analizado` })
  }

  const analysis = await analyzeTranscript(transcript, title)

  await saveAnalysis({
    id: generateId(),
    youtube_id: videoId,
    title,
    channel,
    url: buildVideoUrl(videoId),
    published_date: publishedDate || new Date().toISOString(),
    transcript,
    analysis,
    timestamp_analyzed: new Date().toISOString()
  })

  return Response.json({ success: true, message: `✓ ${title} analizado y guardado` })
}

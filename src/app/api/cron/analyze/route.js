import { getChannelVideos, getVideoTranscript } from "@/lib/youtube"
import { analyzeTranscript } from "@/lib/gemini"
import { saveAnalysis, isVideoAnalyzed } from "@/lib/storage"
import { CHANNELS_TO_MONITOR, MAX_VIDEOS_PER_CHANNEL } from "@/lib/constants"
import { generateId, buildVideoUrl } from "@/lib/utils"

export const maxDuration = 300

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const GEMINI_DELAY_MS = 15000 // 15s entre llamadas → 4 req/min, seguro en cualquier free tier

export async function GET(request) {
  const isDev = process.env.NODE_ENV === "development"

  if (!isDev) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }
  }

  const results = { analyzed: [], skipped: [], errors: [] }

  for (const channel of CHANNELS_TO_MONITOR) {
    console.log(`[CRON] Canal: ${channel.name}`)

    let videos
    try {
      videos = await getChannelVideos(channel.channelId, MAX_VIDEOS_PER_CHANNEL)
    } catch (err) {
      results.errors.push({ channel: channel.name, error: err.message })
      continue
    }

    for (const video of videos) {
      const alreadyDone = await isVideoAnalyzed(video.id)
      if (alreadyDone) {
        results.skipped.push(video.id)
        continue
      }

      console.log(`[CRON] Analizando: ${video.title}`)

      const transcript = await getVideoTranscript(video.id)
      if (!transcript) {
        results.errors.push({ videoId: video.id, error: "Sin transcripción" })
        continue
      }

      try {
        await sleep(GEMINI_DELAY_MS)
        const analysis = await analyzeTranscript(transcript, video.title)

        await saveAnalysis({
          id: generateId(),
          youtube_id: video.id,
          title: video.title,
          channel: channel.name,
          url: buildVideoUrl(video.id),
          thumbnail: video.thumbnail,
          published_date: video.publishedAt,
          transcript,
          analysis,
          timestamp_analyzed: new Date().toISOString()
        })

        results.analyzed.push({ videoId: video.id, title: video.title, analysis })
      } catch (err) {
        results.errors.push({ videoId: video.id, title: video.title, error: err.message })
      }
    }
  }

  return Response.json({
    success: true,
    message: `${results.analyzed.length} videos analizados, ${results.skipped.length} ya existían`,
    ...results
  })
}

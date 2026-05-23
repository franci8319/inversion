import { getVideoTranscript } from "@/lib/youtube"
import { analyzeTranscript } from "@/lib/gemini"
import { saveAnalysis, isVideoAnalyzed } from "@/lib/storage"
import { generateId, buildVideoUrl } from "@/lib/utils"

export const maxDuration = 600

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const DELAY_MS = 15000

const REFERENCE_VIDEOS = [
  // José Luis Cava
  { id: "PRCF_4UnqUc", title: "Manos débiles 2000 y 2025",          channel: "José Luis Cava" },
  { id: "wHYOVyARGqg", title: "Alcista en Bitcoin",                  channel: "José Luis Cava" },
  { id: "MJsR9nWx6Zs", title: "Oportunidad de compra",               channel: "José Luis Cava" },
  { id: "pFqN0NqdWa4", title: "SpaceX e Irán",                       channel: "José Luis Cava" },
  { id: "oUKhClm97Dw", title: "Especuladores de bien",               channel: "José Luis Cava" },
  { id: "aWphtgx57as", title: "Alcista en S&P500",                   channel: "José Luis Cava" },
  { id: "s6vZTik0ZF4", title: "Espabilad jóvenes",                   channel: "José Luis Cava" },
  { id: "vEG8MI5EYro", title: "Máquina de ganar dinero",             channel: "José Luis Cava" },
  { id: "WAXV41-WmLQ", title: "Especulador rentable",                channel: "José Luis Cava" },
  { id: "l2_KIB_ewV0", title: "El año 2027",                         channel: "José Luis Cava" },
  { id: "kNhCJj_MMzw", title: "Alcista en el ORO",                   channel: "José Luis Cava" },
  { id: "IvVx5W__jeI", title: "El timo piramidal",                   channel: "José Luis Cava" },
  { id: "dOdca2QVnTc", title: "Bitcoin supera 80.000",               channel: "José Luis Cava" },
  { id: "ggFVx2B3cFE", title: "Propaganda Iraní",                    channel: "José Luis Cava" },
  { id: "LxD4la63oSA", title: "Base de su sistema",                  channel: "José Luis Cava" },
  // HOPLA Finance
  { id: "gCabw_add4o", title: "Bitcoin: Dejan de vender",            channel: "HOPLA Finance"   },
  { id: "8fZ4HDPfJwk", title: "Subida Histórica",                    channel: "HOPLA Finance"   },
  { id: "Tyn_FtVhRHE", title: "Inyecciones de Liquidez",             channel: "HOPLA Finance"   },
  { id: "E850yFvIKS8", title: "Crédito Privado",                     channel: "HOPLA Finance"   },
  { id: "k7YK3PzayOw", title: "Miedo Extremo",                       channel: "HOPLA Finance"   },
  { id: "sBrakM14wxU", title: "Fin de Guerra en Irán",               channel: "HOPLA Finance"   },
  { id: "lbjbkiHqeC8", title: "Caen Bolsas, Sube BTC",              channel: "HOPLA Finance"   },
]

export async function GET(request) {
  const isDev = process.env.NODE_ENV === "development"
  if (!isDev) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }
  }

  const results = { analyzed: [], skipped: [], errors: [], rejected: [] }

  for (const video of REFERENCE_VIDEOS) {
    const already = await isVideoAnalyzed(video.id)
    if (already) {
      results.skipped.push(video.id)
      console.log(`[BATCH] Ya existe: ${video.title}`)
      continue
    }

    console.log(`[BATCH] Analizando: ${video.title}`)

    const transcript = await getVideoTranscript(video.id)
    if (!transcript) {
      results.errors.push({ videoId: video.id, title: video.title, error: "Sin transcripción" })
      continue
    }

    await sleep(DELAY_MS)

    try {
      const analysis = await analyzeTranscript(transcript, video.title)

      await saveAnalysis({
        id: generateId(),
        youtube_id: video.id,
        title: video.title,
        channel: video.channel,
        url: buildVideoUrl(video.id),
        published_date: new Date().toISOString(),
        transcript,
        analysis,
        timestamp_analyzed: new Date().toISOString()
      })

      results.analyzed.push({ videoId: video.id, title: video.title })
    } catch (err) {
      if (err.message?.includes("Video no financiero")) {
        results.rejected.push({ videoId: video.id, title: video.title })
      } else {
        results.errors.push({ videoId: video.id, title: video.title, error: err.message })
      }
    }
  }

  return Response.json({
    success: true,
    message: `${results.analyzed.length} analizados, ${results.skipped.length} ya existían, ${results.rejected.length} rechazados por Gemini`,
    total: REFERENCE_VIDEOS.length,
    ...results
  })
}

import axios from "axios"

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3"

export async function getChannelVideos(channelId, maxResults = 5) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error("YOUTUBE_API_KEY no configurada")

  const response = await axios.get(`${YOUTUBE_API}/search`, {
    params: {
      part: "snippet",
      channelId,
      order: "date",
      maxResults,
      type: "video",
      key: apiKey
    }
  })

  return response.data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle
  }))
}

export async function getVideoTranscript(videoId) {
  try {
    const { YoutubeTranscript } = await import("youtube-transcript")
    const items = await YoutubeTranscript.fetchTranscript(videoId, { lang: "es" })
    return items.map((item) => item.text).join(" ")
  } catch {
    try {
      const { YoutubeTranscript } = await import("youtube-transcript")
      const items = await YoutubeTranscript.fetchTranscript(videoId)
      return items.map((item) => item.text).join(" ")
    } catch (err) {
      console.error(`Sin transcripción para ${videoId}:`, err.message)
      return null
    }
  }
}

export async function getChannelIdByHandle(handle) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error("YOUTUBE_API_KEY no configurada")

  const response = await axios.get(`${YOUTUBE_API}/channels`, {
    params: {
      part: "id,snippet",
      forHandle: handle,
      key: apiKey
    }
  })

  const items = response.data.items
  if (!items || items.length === 0) throw new Error(`Canal no encontrado: ${handle}`)
  return items[0].id
}

import { MAX_VIDEOS_STORED } from "./constants"
import path from "path"
import fs from "fs"

const DATA_FILE = path.join(process.cwd(), "data", "analyses.json")

function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
}

function isKvConfigured() {
  return !!(process.env.KV_URL && process.env.KV_REST_API_TOKEN)
}

async function getSupabase() {
  const { createClient } = await import("@supabase/supabase-js")
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
}

// ── Local JSON storage (desarrollo) ──────────────────────────────────────────

function readLocalData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { videos: [], metadata: { last_update: null } }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
  } catch {
    return { videos: [], metadata: { last_update: null } }
  }
}

function writeLocalData(data) {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
}

// ── Vercel KV storage (producción) ───────────────────────────────────────────

async function getKvClient() {
  const { kv } = await import("@vercel/kv")
  return kv
}

// ── API pública ───────────────────────────────────────────────────────────────

export async function getStoredVideos() {
  if (isSupabaseConfigured()) {
    const sb = await getSupabase()
    const { data, error } = await sb
      .from("video_analyses")
      .select("*")
      .order("published_date", { ascending: false })
      .limit(MAX_VIDEOS_STORED)
    if (error) throw new Error(error.message)
    return data || []
  }

  if (isKvConfigured()) {
    const kv = await getKvClient()
    const ids = (await kv.lrange("video_ids", 0, -1)) || []
    if (ids.length === 0) return []
    const videos = await Promise.all(ids.map((id) => kv.get(`video:${id}`)))
    return videos.filter(Boolean)
  }

  return readLocalData().videos || []
}

export async function saveAnalysis(videoData) {
  if (isSupabaseConfigured()) {
    const sb = await getSupabase()
    const { error } = await sb
      .from("video_analyses")
      .upsert(videoData, { onConflict: "youtube_id" })
    if (error) throw new Error(error.message)
    return
  }

  if (isKvConfigured()) {
    const kv = await getKvClient()
    await kv.set(`video:${videoData.youtube_id}`, videoData)
    await kv.lpush("video_ids", videoData.youtube_id)
    const total = await kv.llen("video_ids")
    if (total > MAX_VIDEOS_STORED) {
      const oldest = await kv.rpop("video_ids")
      if (oldest) await kv.del(`video:${oldest}`)
    }
    await kv.set("last_update", new Date().toISOString())
    return
  }

  const data = readLocalData()
  const exists = data.videos.some((v) => v.youtube_id === videoData.youtube_id)
  if (exists) return
  data.videos.unshift(videoData)
  if (data.videos.length > MAX_VIDEOS_STORED) data.videos = data.videos.slice(0, MAX_VIDEOS_STORED)
  data.metadata = { last_update: new Date().toISOString() }
  writeLocalData(data)
}

export async function isVideoAnalyzed(youtubeId) {
  if (isSupabaseConfigured()) {
    const sb = await getSupabase()
    const { data } = await sb
      .from("video_analyses")
      .select("youtube_id")
      .eq("youtube_id", youtubeId)
      .maybeSingle()
    return !!data
  }

  const videos = await getStoredVideos()
  return videos.some((v) => v.youtube_id === youtubeId)
}

export async function getMetadata() {
  if (isSupabaseConfigured()) {
    const sb = await getSupabase()
    const { count } = await sb
      .from("video_analyses")
      .select("*", { count: "exact", head: true })
    const { data: latest } = await sb
      .from("video_analyses")
      .select("timestamp_analyzed")
      .order("timestamp_analyzed", { ascending: false })
      .limit(1)
      .maybeSingle()
    return {
      last_update: latest?.timestamp_analyzed || null,
      total_videos: count || 0
    }
  }

  if (isKvConfigured()) {
    const kv = await getKvClient()
    const last_update = await kv.get("last_update")
    const total = await kv.llen("video_ids")
    return { last_update, total_videos: total }
  }

  const data = readLocalData()
  return {
    last_update: data.metadata?.last_update || null,
    total_videos: data.videos?.length || 0
  }
}

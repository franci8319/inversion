import { getMetadata } from "@/lib/storage"

export async function GET() {
  const checks = {
    youtube_api: !!process.env.YOUTUBE_API_KEY,
    gemini_api: !!process.env.GEMINI_API_KEY,
    storage: process.env.SUPABASE_URL ? "supabase" : process.env.KV_URL ? "vercel-kv" : "local-json",
    cron_secret: !!process.env.CRON_SECRET
  }

  let storageOk = false
  try {
    await getMetadata()
    storageOk = true
  } catch {}

  const allOk = checks.youtube_api && checks.gemini_api && storageOk

  return Response.json(
    {
      status: allOk ? "ok" : "degraded",
      checks: { ...checks, storage_connection: storageOk },
      timestamp: new Date().toISOString()
    },
    { status: allOk ? 200 : 503 }
  )
}

import { GoogleGenerativeAI } from "@google/generative-ai"
import { FINANCIAL_ANALYSIS_PROMPT } from "./prompts/financial-analysis"
import { ANALYSIS_CONFIG } from "./constants"

let genAI = null

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY no configurada")
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function generateWithRetry(model, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt)
    } catch (err) {
      const is429 = err?.message?.includes("429")
      const retryMatch = err?.message?.match(/retryDelay.*?(\d+)s/)
      const waitMs = retryMatch ? parseInt(retryMatch[1]) * 1000 + 2000 : 60000
      if (is429 && i < retries - 1) {
        console.log(`[Gemini] Rate limit, reintentando en ${waitMs / 1000}s...`)
        await sleep(waitMs)
        continue
      }
      throw err
    }
  }
}

export async function analyzeTranscript(transcript, videoTitle) {
  const model = getClient().getGenerativeModel({ model: ANALYSIS_CONFIG.MODEL })

  const truncated = transcript.substring(0, ANALYSIS_CONFIG.MAX_TRANSCRIPT_CHARS)

  const prompt = `${FINANCIAL_ANALYSIS_PROMPT}

VIDEO: "${videoTitle}"

TRANSCRIPCIÓN:
${truncated}

Responde SOLO con JSON válido, sin markdown ni explicaciones adicionales.`

  const result = await generateWithRetry(model, prompt)
  const responseText = result.response.text()

  const cleaned = responseText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()

  const analysis = JSON.parse(cleaned)

  if (analysis.error) {
    throw new Error(`Gemini rechazó el video: ${analysis.error}`)
  }

  return {
    ...analysis,
    sentiment_score: analysis.sentiment_score || deriveSentimentScore(analysis)
  }
}

function deriveSentimentScore(analysis) {
  const base = { ALCISTA: 7, NEUTRAL: 5, BAJISTA: 3 }[analysis.tendencia] || 5
  const conf = { ALTA: 1.5, MEDIA: 0, BAJA: -1.5 }[analysis.confianza] || 0
  return Math.min(10, Math.max(0, base + conf))
}

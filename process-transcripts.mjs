import { readFileSync } from 'fs'

const BASE_URL = 'http://localhost:3001'
const DELAY_MS = 16000

const VIDEO_MAP = [
  { id: "vEG8MI5EYro", title: "Máquina de ganar dinero",  channel: "José Luis Cava" },
  { id: "PRCF_4UnqUc", title: "Manos débiles 2000 y 2025", channel: "José Luis Cava" },
  { id: "gCabw_add4o", title: "Bitcoin: Dejan de vender",  channel: "HOPLA Finance"  },
  { id: "dOdca2QVnTc", title: "Bitcoin supera 80.000",     channel: "José Luis Cava" },
  { id: "lbjbkiHqeC8", title: "Caen Bolsas, Sube BTC",    channel: "HOPLA Finance"  },
  { id: "sBrakM14wxU", title: "Fin de Guerra en Irán",     channel: "HOPLA Finance"  },
  { id: "l2_KIB_ewV0", title: "El año 2027",               channel: "José Luis Cava" },
  { id: "IvVx5W__jeI", title: "El timo piramidal",         channel: "José Luis Cava" },
  { id: "s6vZTik0ZF4", title: "Espabilad jóvenes",         channel: "José Luis Cava" },
  { id: "LxD4la63oSA", title: "Base de su sistema",        channel: "José Luis Cava" },
  { id: "Tyn_FtVhRHE", title: "Inyecciones de Liquidez",   channel: "HOPLA Finance"  },
  { id: "ggFVx2B3cFE", title: "Propaganda Iraní",          channel: "José Luis Cava" },
  { id: "k7YK3PzayOw", title: "Miedo Extremo",             channel: "HOPLA Finance"  },
  { id: "MJsR9nWx6Zs", title: "Oportunidad de compra",     channel: "José Luis Cava" },
  { id: "pFqN0NqdWa4", title: "SpaceX e Irán",             channel: "José Luis Cava" },
  { id: "8fZ4HDPfJwk", title: "Subida Histórica",          channel: "HOPLA Finance"  },
  { id: "E850yFvIKS8", title: "Crédito Privado",           channel: "HOPLA Finance"  },
  { id: "WAXV41-WmLQ", title: "Especulador rentable",      channel: "José Luis Cava" },
  { id: "wHYOVyARGqg", title: "Alcista en Bitcoin",        channel: "José Luis Cava" },
  { id: "kNhCJj_MMzw", title: "Alcista en el ORO",         channel: "José Luis Cava" },
  { id: "aWphtgx57as", title: "Alcista en S&P500",         channel: "José Luis Cava" },
  { id: "oUKhClm97Dw", title: "Especuladores de bien",     channel: "José Luis Cava" },
]

function parseTranscripts(text) {
  // Find where real content starts (second occurrence of "1. Así")
  const pattern = /(\d{1,2})\. (Así|Bitcoin|Caen|El |Espabilad|Especulador|Inyecciones|La Prop|Miedo|Nos van|SpaceX|Subida|¿Crisis|¿Cómo|¿Por qué|¿Y dónde)/g
  const matches = []
  let m
  while ((m = pattern.exec(text)) !== null) {
    matches.push({ num: parseInt(m[1]), pos: m.index })
  }

  // Skip the index block (first 22 matches), take the content block (next 22)
  const contentMatches = matches.slice(22)

  const sections = []
  for (let i = 0; i < contentMatches.length; i++) {
    const start = contentMatches[i].pos
    const end = i + 1 < contentMatches.length ? contentMatches[i + 1].pos : text.length
    sections.push(text.slice(start, end).trim())
  }
  return sections
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function processVideo(video, transcript, index) {
  console.log(`\n[${index + 1}/22] Enviando: ${video.title}`)
  console.log(`  Transcripción: ${transcript.length} chars`)

  const res = await fetch(`${BASE_URL}/api/analyze/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoId: video.id,
      title: video.title,
      channel: video.channel,
      transcript,
      publishedDate: new Date().toISOString()
    })
  })

  const data = await res.json()
  if (data.skipped) {
    console.log(`  ⏭  Saltado: ya existía`)
  } else if (data.success) {
    console.log(`  ✓  Guardado en Supabase`)
  } else {
    console.log(`  ✗  Error:`, data.error || JSON.stringify(data))
  }
  return data
}

async function main() {
  const text = readFileSync('transcripciones.txt', 'utf8')
  const sections = parseTranscripts(text)

  console.log(`Parsed ${sections.length} transcripciones`)
  if (sections.length !== 22) {
    console.error('ERROR: se esperaban 22 secciones, se encontraron', sections.length)
    process.exit(1)
  }

  // Verify server is up
  try {
    const health = await fetch(`${BASE_URL}/api/health`)
    const h = await health.json()
    console.log('Servidor:', h.status, '| Storage:', h.checks.storage)
  } catch {
    console.error('ERROR: el servidor no responde en', BASE_URL)
    console.error('Arranca con: npm run dev')
    process.exit(1)
  }

  console.log(`\nProcesando 22 videos con ${DELAY_MS / 1000}s entre llamadas...`)
  console.log('Tiempo estimado:', Math.ceil(22 * DELAY_MS / 60000), 'minutos\n')

  const results = { ok: 0, skipped: 0, errors: 0 }

  for (let i = 0; i < 22; i++) {
    const video = VIDEO_MAP[i]
    const transcript = sections[i]

    try {
      const data = await processVideo(video, transcript, i)
      if (data.skipped) results.skipped++
      else if (data.success) results.ok++
      else results.errors++
    } catch (err) {
      console.log(`  ✗  Excepción: ${err.message}`)
      results.errors++
    }

    if (i < 21) {
      process.stdout.write(`  Esperando ${DELAY_MS / 1000}s...`)
      await sleep(DELAY_MS)
      process.stdout.write(' listo\n')
    }
  }

  console.log('\n=== RESULTADO FINAL ===')
  console.log(`✓ Analizados: ${results.ok}`)
  console.log(`⏭ Saltados:   ${results.skipped}`)
  console.log(`✗ Errores:    ${results.errors}`)
  console.log('\nAbre http://localhost:3000/dashboard para ver los resultados')
}

main()

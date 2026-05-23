# 🚀 GUÍA COMPLETA: Automatizar análisis de videos financieros

## FASE 1: PREPARACIÓN (Hoy)

### 1.1 Credenciales y APIs necesarias

```
YOUTUBE DATA API:
- Ve a: https://console.cloud.google.com
- Crea nuevo proyecto
- Activa: YouTube Data API v3
- Crea credencial: API Key
- Guarda en .env.local: YOUTUBE_API_KEY=xxxxx

GEMINI API:
- Ve a: https://aistudio.google.com/apikey
- Crea API Key
- Guarda en .env.local: GEMINI_API_KEY=xxxxx
```

### 1.2 IDs de los canales a monitorear

```
Canal 1: @JoseLuisCavatv
  - URL canal: https://www.youtube.com/c/JoseLuisCavatv
  - Channel ID: (lo sacas de la API)

Canal 2: @HOPLAFinance
  - URL canal: https://www.youtube.com/c/HOPLAFinance
  - Channel ID: (lo sacas de la API)

Almacenar en: lib/constants.js
```

### 1.3 Stack confirmado

```
✅ Next.js 14+ (App Router)
✅ React 18+
✅ Vercel (hosting)
✅ GitHub (versionado)

Almacenamiento (elige uno):
  A) Vercel KV (Redis) - MÁS RÁPIDO
  B) Supabase PostgreSQL - MÁS ESCALABLE
  C) JSON en GitHub - SIMPLE
  
Mi recomendación: Vercel KV + Backup en GitHub
```

---

## FASE 2: ESTRUCTURA DEL PROYECTO

### 2.1 Crear carpetas en tu PC

```bash
# Abre terminal en tu carpeta de proyectos
mkdir youtube-analyzer
cd youtube-analyzer

# Crear estructura
mkdir -p src/{app,lib,components,styles}
mkdir -p src/app/{api,dashboard}
mkdir -p lib/{youtube,gemini,storage}
mkdir -p public
```

### 2.2 Archivos iniciales

```
youtube-analyzer/
├── .gitignore
├── .env.example
├── .env.local (NO SUBIR)
├── package.json
├── next.config.js
├── jsconfig.json
├── README.md
├── vercel.json
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.js (Layout principal)
│   │   ├── page.js (Home)
│   │   ├── dashboard/
│   │   │   └── page.js (Dashboard principal)
│   │   └── api/
│   │       ├── cron/
│   │       │   └── analyze.js (⭐ CRON JOB - se ejecuta cada 6h)
│   │       ├── videos/
│   │       │   └── route.js (GET lista de videos analizados)
│   │       ├── analyze/
│   │       │   └── route.js (POST análisis manual)
│   │       └── health/
│   │           └── route.js (Verificar que funciona)
│   │
│   ├── lib/
│   │   ├── constants.js (URLs, IDs de canales)
│   │   ├── youtube.js (Obtener videos nuevos)
│   │   ├── gemini.js (Análisis con IA)
│   │   ├── storage.js (Guardar/leer datos)
│   │   ├── prompts/
│   │   │   └── financial-analysis.js (Prompts para Gemini)
│   │   └── utils.js (Funciones comunes)
│   │
│   ├── components/
│   │   ├── VideoCard.jsx (Card de cada análisis)
│   │   ├── Dashboard.jsx (Layout principal)
│   │   ├── AssetSummary.jsx (Resumen por activo: BTC, SPX, ORO)
│   │   ├── AnalysisDetail.jsx (Detalle de un análisis)
│   │   ├── TrendIndicator.jsx (Visual alcista/bajista)
│   │   └── LoadingState.jsx (Skeleton/loading)
│   │
│   └── styles/
│       ├── globals.css (Estilos globales)
│       └── dashboard.module.css (Estilos del dashboard)
│
└── prisma/ (OPCIONAL - si usas Supabase)
    └── schema.prisma
```

---

## FASE 3: CÓDIGO BASE

### 3.1 `.env.example` - Copiar y renombrar a `.env.local`

```env
# YouTube
YOUTUBE_API_KEY=tu_api_key_aqui
YOUTUBE_CHANNELS=JoseLuisCavatv,HOPLAFinance

# Gemini (Google AI)
GEMINI_API_KEY=tu_gemini_key_aqui

# Vercel KV (si usas Vercel KV para storage)
KV_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# O Supabase (si usas PostgreSQL)
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Almacenamiento
STORAGE_TYPE=kv  # 'kv' o 'supabase'

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3.2 `package.json`

```json
{
  "name": "youtube-financial-analyzer",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@google-cloud/youtube-analytics": "^3.0.0",
    "google-auth-library": "^9.0.0",
    "@google/generative-ai": "^0.3.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "@vercel/kv": "^0.2.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### 3.3 `lib/constants.js` - Canales y configuración

```javascript
// Canales a monitorear
export const CHANNELS_TO_MONITOR = [
  {
    name: "José Luis Cava",
    channelId: "UCxxxxxxxxxxxxx", // Obtener de YouTube API
    youtubeHandle: "JoseLuisCavatv",
    url: "https://www.youtube.com/@JoseLuisCavatv"
  },
  {
    name: "HOPLA Finance",
    channelId: "UCyyyyyyyyyyyyyyy",
    youtubeHandle: "HOPLAFinance",
    url: "https://www.youtube.com/@HOPLAFinance"
  }
];

// Activos de interés
export const ASSETS = {
  BITCOIN: "Bitcoin",
  SP500: "S&P 500",
  GOLD: "Oro"
};

// Palabras clave para detección
export const KEYWORDS = {
  BITCOIN: ["bitcoin", "btc", "cripto"],
  SP500: ["s&p500", "sp500", "bolsa", "nasdaq"],
  GOLD: ["oro", "gold", "precious metals"]
};

// Configuración de análisis
export const ANALYSIS_CONFIG = {
  MODEL: "gemini-1.5-flash",
  TEMPERATURE: 0.3,
  MAX_TOKENS: 2000,
  LANGUAGE: "es"
};

// Cada cuánto revisar (en horas)
export const CHECK_INTERVAL_HOURS = 6;

// Máximo de videos a almacenar
export const MAX_VIDEOS_STORED = 100;
```

### 3.4 `lib/youtube.js` - Obtener videos de YouTube

```javascript
import axios from "axios";

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Obtiene videos recientes de un canal
 */
export async function getChannelVideos(channelId, maxResults = 10) {
  try {
    const response = await axios.get(`${YOUTUBE_API}/search`, {
      params: {
        part: "snippet",
        channelId: channelId,
        order: "date",
        maxResults: maxResults,
        type: "video",
        key: API_KEY
      }
    });

    return response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    throw error;
  }
}

/**
 * Obtiene transcripción de un video
 * Nota: Necesitas youtube-transcript-api instalado
 */
export async function getVideoTranscript(videoId) {
  try {
    const YoutubeTranscript = require("youtube-transcript").default;
    const transcript = await YoutubeTranscript.fetchTranscript({
      videoId: videoId,
      lang: "es"
    });

    return transcript.map((item) => item.text).join(" ");
  } catch (error) {
    console.error(`Error fetching transcript for ${videoId}:`, error);
    return null;
  }
}
```

### 3.5 `lib/gemini.js` - Análisis con IA

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FINANCIAL_ANALYSIS_PROMPT } from "./prompts/financial-analysis";
import { ANALYSIS_CONFIG } from "./constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analiza transcripción con Gemini
 */
export async function analyzeTranscript(transcript, videoTitle) {
  try {
    const model = genAI.getGenerativeModel({
      model: ANALYSIS_CONFIG.MODEL
    });

    const prompt = `
${FINANCIAL_ANALYSIS_PROMPT}

VIDEO: "${videoTitle}"

TRANSCRIPCIÓN:
${transcript.substring(0, 5000)} // Primeros 5000 caracteres para evitar límites

Responde SOLO con JSON válido, sin markdown ni explicaciones adicionales.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Limpiar respuesta si viene con backticks
    const cleanedText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const analysis = JSON.parse(cleanedText);
    return analysis;
  } catch (error) {
    console.error("Error analyzing with Gemini:", error);
    throw error;
  }
}
```

### 3.6 `src/app/api/cron/analyze.js` - CRON JOB (⭐ IMPORTANTE)

```javascript
/**
 * Este endpoint se ejecuta automáticamente cada 6 horas en Vercel
 * Configurar en vercel.json con:
 * "crons": [{"path": "/api/cron/analyze", "schedule": "0 */6 * * *"}]
 */

import { getChannelVideos, getVideoTranscript } from "@/lib/youtube";
import { analyzeTranscript } from "@/lib/gemini";
import { saveAnalysis, getStoredVideos } from "@/lib/storage";
import { CHANNELS_TO_MONITOR } from "@/lib/constants";

export async function GET(request) {
  // Verificar que la solicitud viene de Vercel
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("🔄 Iniciando análisis automático de videos...");
    const results = [];

    // Para cada canal
    for (const channel of CHANNELS_TO_MONITOR) {
      console.log(`📺 Verificando canal: ${channel.name}`);

      // Obtener videos recientes
      const videos = await getChannelVideos(channel.channelId, 5);

      // Para cada video
      for (const video of videos) {
        const storedVideos = await getStoredVideos();
        const alreadyAnalyzed = storedVideos.some(
          (v) => v.youtube_id === video.id
        );

        if (!alreadyAnalyzed) {
          console.log(`🎬 Analizando: ${video.title}`);

          // Obtener transcripción
          const transcript = await getVideoTranscript(video.id);

          if (transcript) {
            // Analizar con Gemini
            const analysis = await analyzeTranscript(
              transcript,
              video.title
            );

            // Guardar
            await saveAnalysis({
              youtube_id: video.id,
              title: video.title,
              channel: channel.name,
              url: `https://youtube.com/watch?v=${video.id}`,
              published_date: video.publishedAt,
              transcript: transcript,
              analysis: analysis,
              timestamp_analyzed: new Date().toISOString()
            });

            results.push({
              status: "success",
              videoId: video.id,
              title: video.title,
              analysis: analysis
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      message: "Análisis completado",
      analyzed: results.length,
      results: results
    });
  } catch (error) {
    console.error("Error en cron:", error);
    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
```

### 3.7 `vercel.json` - Configurar CRON en Vercel

```json
{
  "crons": [
    {
      "path": "/api/cron/analyze",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## FASE 4: DASHBOARD REACT

### 4.1 `src/app/dashboard/page.js`

```javascript
"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setAnalyses(data.videos || []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Dashboard analyses={analyses} loading={loading} />
    </main>
  );
}
```

---

## FASE 5: DEPLOYMENT EN VERCEL

### 5.1 Configurar variables de entorno en Vercel

```bash
# En dashboard de Vercel:
# Settings > Environment Variables

YOUTUBE_API_KEY=xxxxx
GEMINI_API_KEY=xxxxx
YOUTUBE_CHANNELS=JoseLuisCavatv,HOPLAFinance
CRON_SECRET=tu_secret_aqui
STORAGE_TYPE=kv
KV_URL=xxxxx
KV_REST_API_TOKEN=xxxxx
```

### 5.2 Deploy

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main

# Vercel detecta Next.js automáticamente y hace deploy
```

---

## ✅ CHECKLIST FINAL

```
CREDENCIALES:
□ YouTube API Key creada y probada
□ Gemini API Key creada y probada
□ Vercel KV (o Supabase) configurado

CÓDIGO:
□ Estructura de carpetas creada
□ package.json con dependencias
□ .env.local configurado (NO en git)
□ lib/youtube.js - Obtener videos
□ lib/gemini.js - Analizar
□ lib/storage.js - Guardar datos
□ api/cron/analyze.js - CRON JOB
□ vercel.json con CRON configurado
□ Components React para dashboard

GITHUB:
□ Repositorio creado
□ .gitignore configurado (.env.local, node_modules)
□ Push a main branch

VERCEL:
□ Proyecto conectado a GitHub
□ Variables de entorno configuradas
□ CRON job activo
□ Deploy successful

TESTING:
□ Probar GET /api/videos
□ Probar GET /api/health
□ Ejecutar /api/cron/analyze manualmente
□ Verificar datos en KV/Supabase
```

---

## 🚨 PROBLEMAS COMUNES

**"YouTube transcript no funciona"**
→ Algunos videos no tienen subtítulos. Necesitas fallback a speech-to-text.

**"Gemini devuelve error"**
→ La transcripción es muy larga. Truncar a primeros 4000 caracteres.

**"CRON no se ejecuta"**
→ Verificar que Vercel Pro está activo (requiere plan de pago).

**"KV lleno"**
→ Implementar rotación: borrar análisis con >30 días.

---

¿Necesitas que continúe con el código de Storage (KV/Supabase) o Components React? 🚀

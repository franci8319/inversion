# ✅ CHECKLIST DE IMPLEMENTACIÓN
## YouTube Financial Analyzer - José Luis Cava

---

## 📋 SEMANA 1: SETUP & CREDENCIALES

### Día 1 - Preparación (30 min)

- [ ] **GitHub**
  - [ ] Crear nuevo repositorio: `youtube-financial-analyzer`
  - [ ] Clonar a tu PC: `git clone https://github.com/TU_USUARIO/youtube-financial-analyzer.git`
  - [ ] `cd youtube-financial-analyzer`

- [ ] **Google Cloud Console - YouTube API**
  - [ ] Ir a: https://console.cloud.google.com
  - [ ] Crear nuevo proyecto: "YouTube Analyzer"
  - [ ] Buscar: "YouTube Data API v3"
  - [ ] Activar la API
  - [ ] Ir a Credenciales > Crear API Key
  - [ ] Copiar la clave a un archivo temporal (la necesitarás pronto)

- [ ] **Google AI Studio - Gemini API**
  - [ ] Ir a: https://aistudio.google.com/apikey
  - [ ] Crear nueva API Key
  - [ ] Copiar la clave a un archivo temporal

- [ ] **Vercel**
  - [ ] Ir a: https://vercel.com
  - [ ] Conectar tu cuenta de GitHub
  - [ ] (Deployaras después, por ahora solo registrarte)

---

### Día 2 - Estructura de carpetas (20 min)

En tu terminal:

```bash
# Crear estructura
mkdir -p src/{app,lib,components,styles}
mkdir -p src/app/{api,dashboard}
mkdir -p src/lib/prompts
mkdir -p public

# Crear archivos base vacíos
touch .env.local
touch .env.example
touch .gitignore
touch package.json
touch next.config.js
touch jsconfig.json
touch vercel.json
touch README.md
```

Estructura final esperada:
```
youtube-financial-analyzer/
├── src/
│   ├── app/
│   │   ├── page.js (HOME)
│   │   ├── dashboard/
│   │   │   └── page.js (DASHBOARD)
│   │   └── api/
│   │       ├── cron/
│   │       │   └── analyze.js ⭐ IMPORTANTE
│   │       ├── videos/
│   │       │   └── route.js
│   │       ├── analyze/
│   │       │   └── route.js
│   │       └── health/
│   │           └── route.js
│   ├── lib/
│   │   ├── constants.js
│   │   ├── youtube.js
│   │   ├── gemini.js
│   │   ├── storage.js
│   │   └── prompts/
│   │       └── financial-analysis.js
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── VideoCard.jsx
│   │   ├── AssetSummary.jsx
│   │   └── TrendIndicator.jsx
│   └── styles/
│       └── globals.css
├── public/
│   └── favicon.ico
├── .env.local (NO SUBIR)
├── .env.example
├── .gitignore
├── package.json
├── next.config.js
├── vercel.json
└── README.md
```

---

### Día 3 - Archivos de configuración (30 min)

#### 1. `.env.example` (TEMPLATE - sube a GIT)
```env
YOUTUBE_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
YOUTUBE_CHANNELS=JoseLuisCavatv,HOPLAFinance
STORAGE_TYPE=kv
KV_URL=your_kv_url
KV_REST_API_TOKEN=your_token
CRON_SECRET=your_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### 2. `.env.local` (SECRETO - NO subir a GIT)
```env
# Reemplaza con tus credenciales reales
YOUTUBE_API_KEY=AIzaSyD...tu_api_key
GEMINI_API_KEY=AIzaSyA...tu_gemini_key
YOUTUBE_CHANNELS=JoseLuisCavatv,HOPLAFinance
STORAGE_TYPE=kv
KV_URL=https://your-kv-instance.kv.vercel.sh
KV_REST_API_TOKEN=your_actual_token
CRON_SECRET=sk_live_random_string_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### 3. `.gitignore` (para proteger secretos)
```
.env.local
.env*.local
node_modules/
.next/
dist/
build/
*.log
.DS_Store
```

#### 4. `package.json`
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
    "@google/generative-ai": "^0.3.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0",
    "@vercel/kv": "^0.2.0"
  }
}
```

#### 5. `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

#### 6. `vercel.json` (⭐ CRUCIAL para CRON)
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

- [ ] Copiar credenciales a `.env.local` (las que sacaste de Google)
- [ ] Ejecutar: `npm install`
- [ ] Ejecutar: `npm run dev`
- [ ] Verificar: http://localhost:3000 carga sin errores

---

## 🔧 SEMANA 2: CÓDIGO PRINCIPAL

### Día 4 - Archivos lib/ (1 hora)

Copiar archivos desde `GUIA_COMPLETA_SETUP.md`:

- [ ] `src/lib/constants.js` → Canales e IDs
- [ ] `src/lib/youtube.js` → Obtener videos
- [ ] `src/lib/gemini.js` → Análisis con IA
- [ ] `src/lib/storage.js` → Guardar/leer datos (KV o Supabase)
- [ ] `src/lib/prompts/financial-analysis.js` → Prompt maestro

**Validación**: Cada archivo debe compilar sin errores

```bash
npm run build
```

---

### Día 5 - API Endpoints (1 hora)

Crear endpoints que serán la columna vertebral:

- [ ] `src/app/api/cron/analyze.js` ⭐ **CRÍTICO**
  - Este ejecuta automáticamente cada 6 horas
  - Obtiene videos nuevos, los analiza, y guarda

- [ ] `src/app/api/videos/route.js`
  - GET: Retorna lista de análisis guardados

- [ ] `src/app/api/analyze/route.js`
  - POST: Analizar un video manualmente

- [ ] `src/app/api/health/route.js`
  - GET: Verificar que el sistema funciona

**Testing local**:
```bash
# Terminal 1
npm run dev

# Terminal 2 - Probar endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/videos
```

---

### Día 6 - Frontend React (1.5 horas)

Componentes para visualizar análisis:

- [ ] `src/app/page.js` → Home con intro
- [ ] `src/app/dashboard/page.js` → Página del dashboard
- [ ] `src/components/Dashboard.jsx` → Lógica principal
- [ ] `src/components/VideoCard.jsx` → Card de cada análisis
- [ ] `src/components/AssetSummary.jsx` → Resumen por activo
- [ ] `src/styles/globals.css` → Estilos (Tailwind o CSS puro)

**Copiar código de**: `components_dashboard_completo.jsx`

**Testing**:
- [ ] Acceder a http://localhost:3000/dashboard
- [ ] Debería cargar (aunque sin datos aún)

---

## 🚀 SEMANA 3: ALMACENAMIENTO & DEPLOYMENT

### Día 7 - Elegir y configurar almacenamiento (1 hora)

**Opción A: Vercel KV (RECOMENDADO)**
- [ ] Dashboard Vercel > Storage > Create KV Database
- [ ] Copiar credenciales a `.env.local`
- [ ] Implementar `src/lib/storage.js` con cliente KV
- [ ] Probar localmente

**Opción B: Supabase**
- [ ] Ir a supabase.com, crear proyecto
- [ ] Crear tabla `analyses` con schema
- [ ] Copiar credenciales a `.env.local`
- [ ] Instalar: `npm install @supabase/supabase-js`
- [ ] Implementar `src/lib/storage.js` con Supabase

**Testing**:
```bash
# Probar guardado
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"videoId":"test","title":"Test"}'
```

---

### Día 8 - Deploy a Vercel (45 min)

#### Step 1: Preparar repositorio
```bash
git add .
git commit -m "Initial commit - YouTube analyzer"
git push origin main
```

- [ ] Verificar en GitHub que todo está subido (excepto `.env.local`)

#### Step 2: Conectar a Vercel
- [ ] Ir a https://vercel.com/dashboard
- [ ] Click "Import Project"
- [ ] Seleccionar repositorio GitHub
- [ ] Vercel detecta Next.js automáticamente
- [ ] Click "Deploy"

#### Step 3: Configurar variables de entorno
En Vercel Dashboard > Project Settings > Environment Variables:

- [ ] Agregar `YOUTUBE_API_KEY`
- [ ] Agregar `GEMINI_API_KEY`
- [ ] Agregar `YOUTUBE_CHANNELS`
- [ ] Agregar `STORAGE_TYPE`
- [ ] Agregar `KV_URL`
- [ ] Agregar `KV_REST_API_TOKEN`
- [ ] Agregar `CRON_SECRET`

#### Step 4: Verificar deployment
```bash
# El URL está en Vercel dashboard, ej: youtube-analyzer.vercel.app
curl https://youtube-analyzer.vercel.app/api/health
# Debería responder: {"status":"ok"}
```

---

### Día 9 - Testing & Validación (1 hora)

#### Test 1: Health Check
- [ ] `GET /api/health` devuelve 200 OK

#### Test 2: Obtener videos
- [ ] `GET /api/videos` devuelve lista (vacía si es primera vez)

#### Test 3: Ejecutar CRON manualmente
- [ ] En Vercel Dashboard > Cron Jobs, ejecutar job
- [ ] Debería tomar 3-5 minutos (obtener + analizar videos)

#### Test 4: Verificar dashboard
- [ ] Abrir: https://youtube-analyzer.vercel.app/dashboard
- [ ] Si hay análisis, deberían aparecer visibles

#### Test 5: Probar análisis manual
```bash
curl -X POST https://youtube-analyzer.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"videoId":"VIDEO_ID","title":"Video Test"}'
```

---

## ✨ SEMANA 4: REFINAMIENTO & OPTIMIZACIÓN

### Día 10-12: Ajustes finales

- [ ] Revisar análisis generados
- [ ] Ajustar prompt si es necesario
- [ ] Mejorar UI del dashboard si falta
- [ ] Agregar más activos si quieres
- [ ] Documentar en README.md

---

## 📊 MÉTRICAS DE ÉXITO

Cuando todo esté funcionando:

```
✅ CRON job se ejecuta cada 6 horas automáticamente
✅ Videos nuevos se detectan y analizan
✅ Dashboard muestra análisis en tiempo real
✅ Filtrado funciona (por activo, fecha, sentimiento)
✅ Almacenamiento persiste entre deployments
✅ No hay errores en logs de Vercel
```

---

## 🔍 DEBUGGING RÁPIDO

| Problema | Solución |
|----------|----------|
| "YouTube API not found" | Verifica YOUTUBE_API_KEY en .env.local |
| "Gemini key invalid" | Genera nueva key en https://aistudio.google.com/apikey |
| "CRON not running" | Solo funciona en Vercel (no localhost). Verifica vercel.json |
| "KV connection timeout" | Verifica credenciales en .env.local match Vercel config |
| "Transcript not found" | El video no tiene subtítulos. Implementar fallback. |
| "Dashboard empty" | Ejecutar CRON manualmente en Vercel para generar datos |

---

## 🎯 PRÓXIMOS PASOS (DESPUÉS DE VERSIÓN 1.0)

- [ ] Agregar más canales (HOPLA Finance, otros analizadores)
- [ ] Webhook para notificaciones en Slack/Email
- [ ] Histórico de predicciones vs. resultados reales
- [ ] Comparación entre análistas
- [ ] Trading simulator basado en análisis
- [ ] API pública para otros usuarios
- [ ] App móvil (React Native)

---

## 📞 REFERENCIAS RÁPIDAS

```
Docs Next.js:           https://nextjs.org/docs
YouTube API v3:         https://developers.google.com/youtube/v3
Gemini API:             https://ai.google.dev/
Vercel Crons:           https://vercel.com/docs/crons
Vercel KV:              https://vercel.com/docs/storage/vercel-kv
GitHub:                 https://github.com
```

---

## ✍️ NOTAS PERSONALES

```
Canal 1: @JoseLuisCavatv
- Especialidad: Elliott Waves, ciclos largos
- Enfoque: Especulación técnica
- Activos: Bitcoin, S&P500, Oro

Canal 2: @HOPLAFinance
- Complementario a José Luis Cava
- Análisis colaborativos
- Actualizaciones de mercado

Tu objetivo:
→ Automatizar extracción de análisis
→ Filtrar por tus activos de interés
→ Dashboard para monitorear señales
→ Tomar decisiones informadas
```

---

**🚀 ¡READY TO LAUNCH!**

Sigue este checklist línea por línea y en ~2 semanas tendrás tu sistema automático funcionando.

Cualquier duda en el camino, abre Claude Desktop (Antigraviti) y pregunta.

¡Éxito! 🎉

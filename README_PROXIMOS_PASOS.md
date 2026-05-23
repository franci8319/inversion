# 🚀 YOUTUBE FINANCIAL ANALYZER - Primeros Pasos

## 📋 Resumen de lo que has recibido

Tienes **5 archivos clave** que contienen toda la estructura para automatizar el análisis de videos de José Luis Cava:

1. **GUIA_COMPLETA_SETUP.md** ← Sigue esto paso a paso
2. **JOSE_LUIS_CAVA_ANALYSIS_PATTERNS.md** ← Entiende su metodología
3. **lib_prompts_financial-analysis-prompt.js** ← El prompt para Gemini
4. **analysis_output_example.json** ← Cómo se guardan los datos
5. **components_dashboard_completo.jsx** ← El interfaz visual

---

## ⚡ PLAN DE ACCIÓN (Hoy y mañana)

### HOY - Setup inicial (30 minutos)

#### 1️⃣ **Crear APIs y obtener credenciales**

```bash
# YouTube API
1. Ve a: https://console.cloud.google.com
2. Crea un proyecto nuevo
3. Busca: "YouTube Data API v3"
4. Actívala
5. Crea credencial: API Key
6. Copia la clave

# Gemini API
1. Ve a: https://aistudio.google.com/apikey
2. Crea una nueva API Key
3. Copia la clave
```

#### 2️⃣ **Crear repositorio en GitHub**

```bash
# En GitHub:
1. New Repository
2. Nombre: "youtube-financial-analyzer"
3. Privado o público (como prefieras)
4. README: NO (lo haremos nosotros)
5. .gitignore: Node.js
6. Create!

# En tu PC:
git clone https://github.com/TU_USUARIO/youtube-financial-analyzer.git
cd youtube-financial-analyzer
```

#### 3️⃣ **Crear estructura de carpetas** (Sigue la guía GUIA_COMPLETA_SETUP.md)

```bash
mkdir -p src/{app,lib,components,styles}
mkdir -p src/app/{api,dashboard}
mkdir -p public
```

#### 4️⃣ **Copiar archivos de configuración**

```bash
# Desde GUIA_COMPLETA_SETUP.md:
# - Crea package.json
# - Crea .env.local (con tus credenciales)
# - Crea .env.example (sin credenciales)
# - Crea .gitignore
# - Crea next.config.js
# - Crea vercel.json
```

#### 5️⃣ **Instalar dependencias**

```bash
npm install
npm run dev

# Debería abrir: http://localhost:3000
```

---

### MAÑANA - Código e integración (1-2 horas)

#### 6️⃣ **Crear archivos lib/**

```bash
src/lib/
├── constants.js (canales a monitorear)
├── youtube.js (obtener videos)
├── gemini.js (analizar con IA)
├── storage.js (guardar datos)
└── prompts/
    └── financial-analysis.js (el prompt maestro)
```

**Copiar código de GUIA_COMPLETA_SETUP.md para cada archivo**

#### 7️⃣ **Crear API endpoints**

```bash
src/app/api/
├── cron/analyze.js (⭐ IMPORTANTE - ejecuta cada 6 horas)
├── videos/route.js (obtiene lista de análisis)
├── analyze/route.js (análisis manual)
└── health/route.js (verifica que funciona)
```

#### 8️⃣ **Crear componentes React**

```bash
src/components/
├── Dashboard.jsx
├── VideoCard.jsx
├── AssetSummary.jsx
└── (copiar de components_dashboard_completo.jsx)
```

#### 9️⃣ **Configurar almacenamiento**

**Opción A: Vercel KV (RECOMENDADO - más rápido)**
```
1. Dashboard de Vercel > Storage > KV
2. Crear nuevo KV
3. Copiar credenciales a .env.local
4. Implementar lib/storage.js con KV client
```

**Opción B: Supabase (alternativa)**
```
1. Ir a supabase.com
2. Crear proyecto
3. Copiar credenciales
4. Implementar lib/storage.js con Supabase client
```

---

### DESPUÉS - Deploy y automatización (30 minutos)

#### 🔟 **Conectar GitHub a Vercel**

```
1. Vercel.com > Import Project
2. Seleccionar repositorio GitHub
3. Vercel detecta Next.js automáticamente
4. Click Deploy
```

#### 1️⃣1️⃣ **Configurar variables de entorno en Vercel**

```
Vercel Dashboard > Settings > Environment Variables

YOUTUBE_API_KEY=xxxxx
GEMINI_API_KEY=xxxxx
YOUTUBE_CHANNELS=JoseLuisCavatv,HOPLAFinance
STORAGE_TYPE=kv (o supabase)
KV_URL=xxxxx
CRON_SECRET=tu_secret_random
```

#### 1️⃣2️⃣ **Activar CRON job**

```
La configuración en vercel.json:
{
  "crons": [
    {
      "path": "/api/cron/analyze",
      "schedule": "0 */6 * * *"
    }
  ]
}

Se ejecutará automáticamente cada 6 horas.
```

---

## 🔑 Credenciales que necesitas

```
1. YOUTUBE_API_KEY
   Obtenible en: https://console.cloud.google.com
   
2. GEMINI_API_KEY
   Obtenible en: https://aistudio.google.com/apikey
   
3. VERCEL_KV o SUPABASE
   Configurar en Vercel o Supabase directamente
   
4. CRON_SECRET (inventar)
   Cualquier string aleatorio para seguridad
   Ejemplo: "sk_live_abc123xyz789"
```

---

## 🔗 URLs importantes

```
GitHub: https://github.com/new
Google Cloud Console: https://console.cloud.google.com
Gemini API: https://aistudio.google.com/apikey
Vercel: https://vercel.com/dashboard
Supabase: https://app.supabase.com
```

---

## 🎯 Flujo de datos

```
┌─────────────────────────────────────────────────────────┐
│  USUARIO CREA ARCHIVO .env.local CON CREDENCIALES      │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │ CRON JOB (6h)   │
        │ /api/cron/      │
        └────────┬────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    │  Obtener videos nuevos  │
    │  (YouTube API)          │
    │                         │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  Extraer transcripción  │
    │  (youtube-transcript)   │
    │                         │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  Analizar con Gemini    │
    │  (IA financiera)        │
    │                         │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  Guardar análisis       │
    │  (KV o Supabase)        │
    │                         │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  DASHBOARD              │
    │  /dashboard             │
    │  Mostrar análisis       │
    │  Filtrar por activo     │
    │  Ver señales            │
    │                         │
    └────────────────────────┘
```

---

## 📊 Qué verás en el Dashboard

```
┌─────────────────────────────────────────────────────┐
│  📊 ANÁLISIS FINANCIERO AUTOMÁTICO                  │
│  José Luis Cava - Bitcoin, S&P 500, Oro             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Stats: 15 Análisis | 8 ALCISTA | 2 BAJISTA]     │
│                                                     │
│  Filtrar: [Bitcoin: 6] [S&P 500: 5] [Oro: 4]      │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ BITCOIN      │  │ S&P 500      │  │ ORO      │ │
│  │ 📈 ALCISTA   │  │ ➡️ NEUTRAL   │  │📈 ALCISTA│ │
│  │ COMPRA       │  │ ESPERA       │  │ COMPRA   │ │
│  │ Sent: 8.5/10│  │ Sent: 6.8/10 │  │ Sent:7.8 │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│ VIDEOS RECIENTES:                                   │
│                                                     │
│ [🎬] "¿Por qué soy alcista en Bitcoin?"            │
│      📈 ALCISTA | COMPRA | Sent: 8.5/10            │
│      "Manos débiles liquidadas, ahora ballenas..." │
│      Niveles: Soporte 79k | Resistencia 85k       │
│      🎯 Acción: Comprar en 79k-81k                │
│                                                     │
│ [🎬] "¿Por qué soy alcista en S&P 500?"           │
│      ➡️ NEUTRAL | ESPERA | Sent: 6.8/10            │
│      "Alcismo con advertencias de burbuja..."      │
│      Niveles: Soporte 5200 | Resistencia 5500    │
│      🎯 Acción: Esperar corrección                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ Puntos críticos

```
✅ .env.local NUNCA debe ir a Git
   Agregar a .gitignore:
   .env.local
   node_modules/

✅ CRON job requiere Vercel Pro o superior
   Si usas plan Free: ejecutar manualmente con /api/cron

✅ YouTube transcript-api falla sin subtítulos
   Solución: implementar fallback a speech-to-text

✅ Gemini tiene límites de tokens
   Si transcript es muy largo: truncar a 4000 caracteres

✅ Primera ejecución toma tiempo
   - Obtener todos los videos: ~30 seg
   - Analizar cada uno: ~10-15 seg
   - Total: 3-5 minutos para 10 videos
```

---

## 🆘 Si algo falla

```
ERROR: "YouTube API disabled"
→ Ve a Google Cloud Console > YouTube Data API v3 > Activar

ERROR: "Gemini API key invalid"
→ Copia correctamente de https://aistudio.google.com/apikey

ERROR: "CRON not running"
→ Verifica vercel.json existe y tiene estructura correcta
→ Solo funciona en Vercel (no en localhost)

ERROR: "KV connection timeout"
→ Verificar credenciales en .env.local
→ Probar conexión con simple GET request

ERROR: "Transcript not found"
→ El video no tiene subtítulos en YouTube
→ Implementar fallback a speech-to-text
```

---

## 📚 Recursos

```
Next.js Docs:          https://nextjs.org/docs
Vercel Deployment:     https://vercel.com/docs
YouTube API v3:        https://developers.google.com/youtube/v3
Gemini API:            https://ai.google.dev/
Vercel Cron Jobs:      https://vercel.com/docs/crons
```

---

## 🎉 Cuándo estará listo

```
Estimación:
- Setup credenciales:      15 minutos
- Crear carpetas y archivos: 30 minutos
- Copiar código lib/:       20 minutos
- Crear API endpoints:      20 minutos
- Crear componentes React:  20 minutos
- Configurar storage:       15 minutos
- Deploy a Vercel:          10 minutos
─────────────────────────────────────
TOTAL:                  ~2 horas 30 min

**RESULTADO: App en producción analizando videos automáticamente cada 6 horas**
```

---

## 📞 Necesitas ayuda?

```
Si en algún paso queda duda:
1. Consulta los comentarios en GUIA_COMPLETA_SETUP.md
2. Revisa el archivo analysis_output_example.json
3. Estudia JOSE_LUIS_CAVA_ANALYSIS_PATTERNS.md
4. Verifica que tus credenciales sean correctas

Si falla algo técnico:
- Abre Developer Console (F12) y busca errores
- Verifica logs en Vercel Dashboard
- Prueba endpoints con curl o Postman
```

---

**¡Listo para empezar? Abre GUIA_COMPLETA_SETUP.md y sigue paso a paso! 🚀**

Cualquier pregunta mientras implementas, me la haces en Claude (normal o en Antigraviti).

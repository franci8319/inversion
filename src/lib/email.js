import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = process.env.NOTIFY_EMAIL || "fvilleguillas@gmail.com"

const SIGNAL_COLOR = { "MUY ALCISTA": "#22c55e", "NEUTRAL": "#eab308", "PRECAUCIÓN": "#ef4444" }
const REC_COLOR    = { "COMPRA": "#22c55e", "ESPERA": "#eab308", "VENTA": "#ef4444", "ALCISTA": "#22c55e", "BAJISTA": "#ef4444" }

export async function sendDailyReport({ spyScore, newVideos, totalVideos }) {
  const fecha = new Date().toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Europe/Madrid"
  })

  const scoreColor = SIGNAL_COLOR[spyScore?.score?.signal] || "#6b7280"

  const videosHtml = newVideos.length > 0
    ? newVideos.map(v => {
        const rec = v.analysis?.recomendacion || "—"
        const col = REC_COLOR[rec] || "#6b7280"
        const activo = v.analysis?.activo || ""
        const resumen = v.analysis?.resumen_ejecutivo || ""
        return `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #374151;">
              <div style="font-weight:600;color:#f9fafb;margin-bottom:4px;">${v.title}</div>
              <div style="font-size:13px;color:#9ca3af;margin-bottom:6px;">${v.channel}${activo ? " · " + activo : ""}</div>
              ${resumen ? `<div style="font-size:13px;color:#d1d5db;line-height:1.5;">${resumen}</div>` : ""}
            </td>
            <td style="padding:12px 0 12px 16px;border-bottom:1px solid #374151;white-space:nowrap;vertical-align:top;">
              <span style="background:${col}22;color:${col};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${rec}</span>
            </td>
          </tr>`
      }).join("")
    : `<tr><td colspan="2" style="padding:16px 0;color:#6b7280;text-align:center;">Sin videos nuevos hoy</td></tr>`

  const scoreHtml = spyScore ? `
    <div style="background:#1f2937;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid ${scoreColor}44;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <div style="font-size:12px;color:#9ca3af;margin-bottom:4px;">SPY · Cierre Institucional 21:10h</div>
          <div style="font-size:28px;font-weight:700;color:#f9fafb;">
            $${spyScore.price?.toFixed(2)}
            <span style="font-size:16px;color:${spyScore.changePercent >= 0 ? '#22c55e' : '#ef4444'};">
              ${spyScore.changePercent >= 0 ? "+" : ""}${spyScore.changePercent?.toFixed(2)}%
            </span>
          </div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:48px;font-weight:900;color:${scoreColor};">${spyScore.score?.total}</div>
          <div style="font-size:12px;color:#6b7280;">/ ${spyScore.score?.maxTotal} pts</div>
        </div>
      </div>
      <div style="background:${scoreColor}22;border:1px solid ${scoreColor}44;border-radius:8px;padding:8px 16px;display:inline-block;">
        <span style="color:${scoreColor};font-weight:700;font-size:14px;">● ${spyScore.score?.signal}</span>
      </div>
      <table style="width:100%;margin-top:16px;">
        ${Object.entries(spyScore.score?.breakdown || {}).map(([, item]) => `
          <tr>
            <td style="padding:4px 0;font-size:13px;color:${item.points > 0 ? '#22c55e' : '#6b7280'};">
              ${item.points > 0 ? "✓" : "·"} ${item.label}
            </td>
            <td style="padding:4px 0;font-size:12px;color:#6b7280;text-align:right;">${item.value}</td>
          </tr>`).join("")}
      </table>
    </div>` : ""

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Cabecera -->
    <div style="margin-bottom:24px;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;text-transform:capitalize;">${fecha}</div>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#f9fafb;">📊 Análisis Diario · Sistema Cava</h1>
    </div>

    <!-- SPY Score -->
    ${scoreHtml}

    <!-- Videos -->
    <div style="background:#1f2937;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-size:12px;color:#9ca3af;margin-bottom:4px;">ANÁLISIS DE VIDEOS</div>
      <div style="font-size:14px;color:#6b7280;margin-bottom:16px;">
        ${newVideos.length} nuevo${newVideos.length !== 1 ? "s" : ""} hoy · ${totalVideos} en total
      </div>
      <table style="width:100%;border-collapse:collapse;">${videosHtml}</table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://inversion-tau.vercel.app"}/dashboard"
         style="background:#3b82f6;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
        Ver dashboard completo →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:11px;color:#374151;">
      Inversion · Sistema Cava · Análisis automático diario a las 21:10h
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: "Inversion <onboarding@resend.dev>",
    to: TO,
    subject: `📊 Análisis ${fecha} · SPY ${spyScore?.score?.total ?? "?"}/${spyScore?.score?.maxTotal ?? 6} pts · ${spyScore?.score?.signal ?? ""}`,
    html
  })
}

import "../styles/globals.css"

export const metadata = {
  title: "Análisis Financiero - José Luis Cava",
  description: "Análisis automático de videos de José Luis Cava sobre Bitcoin, S&P 500 y Oro",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

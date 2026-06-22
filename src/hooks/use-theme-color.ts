import { useEffect } from 'react'

// Cambia el <meta name="theme-color"> mientras el componente está montado y
// restaura el valor anterior al desmontar. En Android Chrome PWA standalone
// esto controla el color de la status bar del sistema, así que combina con
// el navbar de la ruta activa. En iOS no afecta (iOS usa apple-mobile-web-app-
// status-bar-style en su lugar).
export function useThemeColor(color: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) return
    const prev = meta.content
    meta.content = color
    return () => {
      meta.content = prev
    }
  }, [color])
}

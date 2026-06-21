import { useCallback, useEffect, useState } from 'react'

// Evento no estándar del whatwg, soportado en Chrome/Edge/Samsung Internet.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallPromptState {
  // Android/Chrome: tenemos el evento capturado y podemos llamar a prompt().
  canInstall: boolean
  // El sistema operativo del cliente es iOS (iPhone/iPad).
  isIos: boolean
  // La app ya está corriendo como instalada (standalone).
  isStandalone: boolean
  // Disparar el prompt nativo (solo Android). Retorna outcome o null si no se pudo.
  promptInstall: () => Promise<'accepted' | 'dismissed' | null>
}

function detectIos(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  const isIosUA = /iphone|ipad|ipod/.test(ua)
  // iPadOS 13+ se identifica como Mac con touch.
  const isIPadOS = ua.includes('mac') && 'ontouchend' in document
  return isIosUA || isIPadOS
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const mq = window.matchMedia('(display-mode: standalone)').matches
  // iOS legacy:
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return mq || nav.standalone === true
}

export function useInstallPrompt(): InstallPromptState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(() => detectStandalone())
  const [isIos] = useState(() => detectIos())

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    function handleInstalled() {
      setDeferred(null)
      setIsStandalone(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    // El media query puede cambiar si el usuario lanza la app desde el home.
    const mq = window.matchMedia('(display-mode: standalone)')
    const handleMqChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches)
    mq.addEventListener?.('change', handleMqChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
      mq.removeEventListener?.('change', handleMqChange)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return null
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    return choice.outcome
  }, [deferred])

  return {
    canInstall: deferred !== null,
    isIos,
    isStandalone,
    promptInstall,
  }
}

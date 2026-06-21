import { useState } from 'react'
import { Download, Share, Plus, X, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInstallPrompt } from '@/hooks/use-install-prompt'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'ghost' | 'outline'
  /** Estilos custom para integrarse al header oscuro de partido-activo */
  className?: string
  iconOnlyOnMobile?: boolean
}

export function InstallButton({
  variant = 'outline',
  className,
  iconOnlyOnMobile = false,
}: Props) {
  const { canInstall, isIos, isStandalone, promptInstall } = useInstallPrompt()
  const [iosOpen, setIosOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Ya está instalada o el usuario cerró el prompt: no mostrar nada.
  if (isStandalone || dismissed) return null
  // Sin soporte (Firefox desktop, Safari macOS sin install): no mostrar nada.
  if (!canInstall && !isIos) return null

  async function handleClick() {
    if (isIos) {
      setIosOpen(true)
      return
    }
    const outcome = await promptInstall()
    if (outcome === 'dismissed') setDismissed(true)
  }

  return (
    <>
      <Button variant={variant} size="sm" onClick={handleClick} className={className}>
        <Download />
        <span className={iconOnlyOnMobile ? 'hidden sm:inline' : ''}>Instalar app</span>
      </Button>

      {iosOpen && <IosInstallSheet onClose={() => setIosOpen(false)} />}
    </>
  )
}

function IosInstallSheet({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card text-card-foreground shadow-2xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Smartphone className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold leading-tight">Instalar en iPhone</h2>
              <p className="text-xs text-muted-foreground">3 pasos en Safari</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2 -mt-2">
            <X />
          </Button>
        </header>

        <ol className="space-y-3 text-sm">
          <Step
            number={1}
            icon={<Share className="size-4" />}
            text={
              <>
                Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
              </>
            }
          />
          <Step
            number={2}
            icon={<Plus className="size-4" />}
            text={
              <>
                Desliza y elige{' '}
                <strong>"Agregar a pantalla de inicio"</strong>.
              </>
            }
          />
          <Step
            number={3}
            icon={<Download className="size-4" />}
            text={
              <>
                Toca <strong>Agregar</strong> en la esquina superior derecha.
              </>
            }
          />
        </ol>

        <p className="text-xs text-muted-foreground border-t pt-3">
          Importante: usa <strong>Safari</strong> (no Chrome) para instalar en iPhone/iPad.
        </p>

        <Button onClick={onClose} className="w-full" size="lg">
          Entendido
        </Button>
      </div>
    </div>
  )
}

function Step({
  number,
  icon,
  text,
}: {
  number: number
  icon: React.ReactNode
  text: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          'size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs',
        )}
      >
        {number}
      </span>
      <div className="flex-1 pt-0.5 flex items-start gap-2">
        <span className="text-muted-foreground shrink-0 pt-0.5">{icon}</span>
        <p>{text}</p>
      </div>
    </li>
  )
}

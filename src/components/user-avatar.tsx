import { resolveAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/utils'

interface Props {
  photoUrl?: string | null
  name?: string | null
  className?: string
  fallbackClassName?: string
}

function initialsFrom(name: string | null | undefined): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserAvatar({ photoUrl, name, className, fallbackClassName }: Props) {
  const src = resolveAssetUrl(photoUrl)

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={cn('rounded-xl object-cover shrink-0', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center shrink-0 font-black',
        fallbackClassName,
        className,
      )}
    >
      {initialsFrom(name)}
    </div>
  )
}

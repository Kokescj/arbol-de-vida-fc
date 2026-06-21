const DATE_FORMATTER = new Intl.DateTimeFormat('es-CL', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatMatchDate(iso: string): string {
  try {
    return DATE_FORMATTER.format(new Date(iso))
  } catch {
    return iso
  }
}

// Convierte ISO → 'YYYY-MM-DDTHH:mm' para <input type="datetime-local">
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromDateTimeLocal(value: string): string {
  // 'YYYY-MM-DDTHH:mm' (local) → ISO string en UTC
  return new Date(value).toISOString()
}

import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { fromDateTimeLocal } from '@/lib/format'

interface FormValues {
  place: string
  dateTimeLocal: string
  requiredPlayers: number
  notes: string
}

interface Props {
  initial?: Partial<FormValues>
  submitLabel: string
  submitting: boolean
  errorMessage?: string | string[] | null
  onSubmit: (input: { place: string; dateTime: string; requiredPlayers: number; notes?: string }) => void
}

export function MatchForm({ initial, submitLabel, submitting, errorMessage, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>({
    place: initial?.place ?? '',
    dateTimeLocal: initial?.dateTimeLocal ?? '',
    requiredPlayers: initial?.requiredPlayers ?? 14,
    notes: initial?.notes ?? '',
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      place: values.place.trim(),
      dateTime: fromDateTimeLocal(values.dateTimeLocal),
      requiredPlayers: Number(values.requiredPlayers),
      notes: values.notes.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="place">Lugar</Label>
        <Input
          id="place"
          placeholder="Centro deportivo Laurita Vicuña"
          required
          maxLength={150}
          value={values.place}
          onChange={(e) => setValues((v) => ({ ...v, place: e.target.value }))}
          disabled={submitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateTime">Fecha y hora</Label>
          <Input
            id="dateTime"
            type="datetime-local"
            required
            value={values.dateTimeLocal}
            onChange={(e) => setValues((v) => ({ ...v, dateTimeLocal: e.target.value }))}
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="requiredPlayers">Cupo de jugadores</Label>
          <Input
            id="requiredPlayers"
            type="number"
            required
            min={2}
            max={40}
            value={values.requiredPlayers}
            onChange={(e) => setValues((v) => ({ ...v, requiredPlayers: Number(e.target.value) }))}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Traer pechera blanca, llegar 10 min antes…"
          maxLength={500}
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
          disabled={submitting}
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">
          {Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Guardando…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}

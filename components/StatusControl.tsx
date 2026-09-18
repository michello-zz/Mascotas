'use client'

import { useActionState } from 'react'
import { cambiarEstado, type ActionState } from '@/app/actions/pets'
import { ESTADO_LABEL } from '@/lib/labels'

const inicial: ActionState = {}

export function StatusControl({ petId, estado }: { petId: string; estado: string }) {
  const [state, action, pending] = useActionState(cambiarEstado, inicial)

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="petId" value={petId} />
      <select name="estado" defaultValue={estado} className="input max-w-56">
        {Object.entries(ESTADO_LABEL).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <button type="submit" className="btn-secondary" disabled={pending}>
        {pending ? 'Guardando…' : 'Actualizar estado'}
      </button>
      {state.ok && <span className="text-sm text-green-700">Listo ✓</span>}
      {state.error && <span className="text-sm text-red-700">{state.error}</span>}
    </form>
  )
}

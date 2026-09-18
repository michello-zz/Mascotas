'use client'

import { useActionState } from 'react'
import { crearMascota, editarMascota } from '@/app/actions/pets'
import type { ActionState } from '@/lib/constantes'
import { ESPECIE_LABEL } from '@/lib/labels'

const inicial: ActionState = {}

export function PetForm({
  modo = 'crear',
  pet,
}: {
  modo?: 'crear' | 'editar'
  pet?: { id: number; name: string; species: string; comments: string | null }
}) {
  const accion = modo === 'crear' ? crearMascota : editarMascota
  const [state, action, pending] = useActionState(accion, inicial)

  return (
    <form action={action} className="card grid gap-4 p-4">
      {modo === 'editar' && <input type="hidden" name="id" value={pet?.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="nombre">
            Nombre *
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            defaultValue={pet?.name ?? ''}
            className="input"
            placeholder="Luna"
          />
        </div>
        <div>
          <label className="label" htmlFor="especie">
            Especie *
          </label>
          <select
            id="especie"
            name="especie"
            required
            defaultValue={pet?.species ?? ''}
            className="input"
          >
            <option value="" disabled>
              Elegí…
            </option>
            {Object.entries(ESPECIE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="comentarios">
          Comentarios
        </label>
        <textarea
          id="comentarios"
          name="comentarios"
          rows={3}
          defaultValue={pet?.comments ?? ''}
          className="input"
          placeholder="Ej: tiene una mancha blanca en el pecho, es muy asustadiza…"
        />
      </div>

      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.ok && state.mensaje && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{state.mensaje}</p>
      )}

      <button type="submit" className="btn-primary justify-self-start" disabled={pending}>
        {pending ? 'Guardando…' : modo === 'crear' ? 'Agregar mascota' : 'Guardar cambios'}
      </button>
    </form>
  )
}

'use client'

import { useActionState, useState } from 'react'
import { borrarMascota, marcarEncontrada, marcarPerdida } from '@/app/actions/pets'
import type { ActionState } from '@/lib/constantes'

const inicial: ActionState = {}

export function PetAcciones({
  petId,
  nombre,
  isLost,
}: {
  petId: number
  nombre: string
  isLost: boolean
}) {
  const [perdidaState, accionPerdida, perdidaPending] = useActionState(marcarPerdida, inicial)
  const [okState, accionOk, okPending] = useActionState(marcarEncontrada, inicial)
  const [borrarState, accionBorrar, borrarPending] = useActionState(borrarMascota, inicial)
  const [mostrarFormPerdida, setMostrarFormPerdida] = useState(false)

  return (
    <div className="space-y-2">
      {!isLost ? (
        <>
          {!mostrarFormPerdida ? (
            <button type="button" className="btn-primary" onClick={() => setMostrarFormPerdida(true)}>
              Reportar como perdida
            </button>
          ) : (
            <form action={accionPerdida} className="grid gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <input type="hidden" name="id" value={petId} />
              <label className="label" htmlFor={`lostComment-${petId}`}>
                Comentario de cómo contactarte *
              </label>
              <textarea
                id={`lostComment-${petId}`}
                name="lostComment"
                rows={3}
                required
                className="input"
                placeholder="Ej: llamame al 099 123 456, vive cerca de la plaza, es miedosa"
              />
              <p className="text-xs text-red-800">
                Esto es lo que va a ver quien la encuentre en el listado público.
              </p>
              {perdidaState.error && <p className="text-sm text-red-700">{perdidaState.error}</p>}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary" disabled={perdidaPending}>
                  {perdidaPending ? 'Publicando…' : 'Publicar como perdida'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setMostrarFormPerdida(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
          {perdidaState.ok && perdidaState.mensaje && (
            <p className="text-sm text-green-800">{perdidaState.mensaje}</p>
          )}
        </>
      ) : (
        <form action={accionOk} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={petId} />
          <button type="submit" className="btn-primary" disabled={okPending}>
            {okPending ? 'Guardando…' : '¡La encontramos! (sacar del listado)'}
          </button>
          {okState.error && <span className="text-sm text-red-700">{okState.error}</span>}
        </form>
      )}

      <form
        action={accionBorrar}
        onSubmit={(e) => {
          if (!confirm(`¿Borrar a ${nombre}? No se puede deshacer.`)) e.preventDefault()
        }}
      >
        <input type="hidden" name="id" value={petId} />
        <button
          type="submit"
          className="btn border border-red-200 bg-white text-red-700 hover:bg-red-50"
          disabled={borrarPending}
        >
          {borrarPending ? 'Borrando…' : 'Borrar mascota'}
        </button>
        {borrarState.error && <span className="ml-2 text-sm text-red-700">{borrarState.error}</span>}
      </form>
    </div>
  )
}

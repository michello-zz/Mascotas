'use client'

import { useActionState } from 'react'
import { borrarMascota, type ActionState } from '@/app/actions/pets'

const inicial: ActionState = {}

export function DeletePetButton({ petId, nombre }: { petId: string; nombre: string }) {
  const [state, action, pending] = useActionState(borrarMascota, inicial)

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`¿Borrar la publicación de ${nombre}? No se puede deshacer.`)) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="petId" value={petId} />
      <button
        type="submit"
        disabled={pending}
        className="btn border border-red-200 bg-white text-red-700 hover:bg-red-50"
      >
        {pending ? 'Borrando…' : 'Borrar'}
      </button>
      {state.error && <span className="ml-2 text-sm text-red-700">{state.error}</span>}
    </form>
  )
}

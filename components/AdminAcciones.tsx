'use client'

import { useActionState } from 'react'
import { borrarMascotaAdmin, borrarUsuario, cambiarRol } from '@/app/actions/cuenta'
import type { ActionState } from '@/lib/constantes'

const inicial: ActionState = {}

export function CambiarRol({ userId, rol }: { userId: string; rol: string }) {
  const [state, action, pending] = useActionState(cambiarRol, inicial)

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select name="role" defaultValue={rol} className="input max-w-36">
        <option value="DUENO">Dueño</option>
        <option value="ADMIN">Administrador</option>
      </select>
      <button type="submit" className="btn-secondary" disabled={pending}>
        {pending ? '…' : 'Cambiar'}
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  )
}

export function BorrarUsuario({ userId, nombre }: { userId: string; nombre: string }) {
  const [state, action, pending] = useActionState(borrarUsuario, inicial)

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`¿Borrar a ${nombre} y todas sus mascotas? No se puede deshacer.`)) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="btn border border-red-200 bg-white text-red-700 hover:bg-red-50"
        disabled={pending}
      >
        {pending ? '…' : 'Borrar'}
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  )
}

export function BorrarMascotaAdmin({ petId, nombre }: { petId: number; nombre: string }) {
  const [state, action, pending] = useActionState(borrarMascotaAdmin, inicial)

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`¿Borrar a ${nombre}?`)) e.preventDefault()
      }}
    >
      <input type="hidden" name="petId" value={petId} />
      <button
        type="submit"
        className="btn border border-red-200 bg-white text-red-700 hover:bg-red-50"
        disabled={pending}
      >
        {pending ? '…' : 'Borrar'}
      </button>
      {state.error && <span className="text-xs text-red-700">{state.error}</span>}
    </form>
  )
}

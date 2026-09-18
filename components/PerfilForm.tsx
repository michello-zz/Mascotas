'use client'

import { useActionState } from 'react'
import { actualizarPerfil } from '@/app/actions/cuenta'
import type { ActionState } from '@/lib/constantes'

const inicial: ActionState = {}

export function PerfilForm({
  usuario,
}: {
  usuario: {
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
    comments: string | null
  }
}) {
  const [state, action, pending] = useActionState(actualizarPerfil, inicial)

  return (
    <form action={action} className="card grid gap-4 p-4">
      <h2 className="font-semibold text-stone-800">Mis datos</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">
            Nombre *
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            defaultValue={usuario.firstName ?? ''}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="lastName">
            Apellido *
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            defaultValue={usuario.lastName ?? ''}
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">
            Correo *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={usuario.email}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Teléfono *
          </label>
          <input
            id="phone"
            name="phone"
            required
            defaultValue={usuario.phone ?? ''}
            className="input"
            inputMode="tel"
            placeholder="099123456"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="comments">
          Comentarios
        </label>
        <textarea
          id="comments"
          name="comments"
          rows={2}
          defaultValue={usuario.comments ?? ''}
          className="input"
          placeholder="Algo que quieras aclarar (opcional)"
        />
      </div>

      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.ok && state.mensaje && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{state.mensaje}</p>
      )}

      <button type="submit" className="btn-primary justify-self-start" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar mis datos'}
      </button>
    </form>
  )
}

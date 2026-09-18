'use client'

import { useActionState } from 'react'
import { agregarAvistamiento, type ActionState } from '@/app/actions/pets'
import { CIUDADES_POR_DEPARTAMENTO, DEPARTAMENTOS } from '@/lib/uruguay'

const inicial: ActionState = {}

export function SightingForm({
  petId,
  ciudadDefault,
  departamentoDefault,
}: {
  petId: string
  ciudadDefault?: string | null
  departamentoDefault?: string | null
}) {
  const [state, action, pending] = useActionState(agregarAvistamiento, inicial)

  if (state.ok) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ¡Gracias! Guardamos tu avistamiento. Si dejaste un teléfono, el dueño se va a poder
        comunicar.
      </div>
    )
  }

  return (
    <form action={action} className="card grid gap-3 p-4">
      <input type="hidden" name="petId" value={petId} />
      <h3 className="font-semibold text-stone-800">¿La viste? Avisá acá</h3>
      <p className="text-sm text-stone-500">
        No hace falta tener cuenta. Cuanto más detalle, mejor.
      </p>

      <div>
        <label className="label" htmlFor="av-desc">
          Qué viste *
        </label>
        <textarea
          id="av-desc"
          name="descripcion"
          required
          rows={3}
          className="input"
          placeholder="Ej: la vi cruzando cerca de la plaza, tenía el collar rojo"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="av-fecha">
            ¿Cuándo?
          </label>
          <input id="av-fecha" name="visto_el" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="av-foto">
            Link de una foto (opcional)
          </label>
          <input
            id="av-foto"
            name="foto"
            className="input"
            placeholder="https://..."
            inputMode="url"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="av-dir">
            Dirección / lugar
          </label>
          <input id="av-dir" name="direccion" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="av-dep">
            Departamento
          </label>
          <select id="av-dep" name="departamento" defaultValue={departamentoDefault ?? ''} className="input">
            <option value="">—</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="av-ciudad">
            Ciudad
          </label>
          <input
            id="av-ciudad"
            name="ciudad"
            className="input"
            defaultValue={ciudadDefault ?? ''}
            list="ciudades-av"
          />
          <datalist id="ciudades-av">
            {Object.values(CIUDADES_POR_DEPARTAMENTO)
              .flat()
              .map((c) => (
                <option key={c} value={c} />
              ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="av-nombre">
            Tu nombre (opcional)
          </label>
          <input id="av-nombre" name="nombre" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="av-tel">
            Tu teléfono (opcional)
          </label>
          <input id="av-tel" name="telefono" className="input" inputMode="tel" />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      )}

      <button type="submit" className="btn-primary justify-self-start" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar avistamiento'}
      </button>
    </form>
  )
}

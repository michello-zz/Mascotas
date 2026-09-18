'use client'

import { useActionState, useState } from 'react'
import { crearMascota, type ActionState } from '@/app/actions/pets'
import { CIUDADES_POR_DEPARTAMENTO, DEPARTAMENTOS } from '@/lib/uruguay'
import { ESPECIE_LABEL, ESTADO_LABEL, SEXO_LABEL, TAMANO_LABEL } from '@/lib/labels'

const inicial: ActionState = {}

export function PetForm({ email }: { email?: string | null }) {
  const [state, action, pending] = useActionState(crearMascota, inicial)
  const [departamento, setDepartamento] = useState('')
  const [conChip, setConChip] = useState('')
  const [castrado, setCastrado] = useState('')

  const ciudades = CIUDADES_POR_DEPARTAMENTO[departamento] ?? []

  return (
    <form action={action} className="grid gap-6">
      <fieldset className="card grid gap-4 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-700">La mascota</legend>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="nombre">
              Nombre *
            </label>
            <input id="nombre" name="nombre" required className="input" placeholder="Luna" />
          </div>
          <div>
            <label className="label" htmlFor="especie">
              Especie *
            </label>
            <select id="especie" name="especie" required defaultValue="" className="input">
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

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="raza">
              Raza
            </label>
            <input id="raza" name="raza" className="input" placeholder="Mestiza" />
          </div>
          <div>
            <label className="label" htmlFor="sexo">
              Sexo
            </label>
            <select id="sexo" name="sexo" defaultValue="DESCONOCIDO" className="input">
              {Object.entries(SEXO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="tamano">
              Tamaño
            </label>
            <select id="tamano" name="tamano" defaultValue="" className="input">
              <option value="">—</option>
              {Object.entries(TAMANO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="color">
              Color / señas
            </label>
            <input id="color" name="color" className="input" placeholder="Negra con pecho blanco" />
          </div>
          <div>
            <label className="label" htmlFor="edad_meses">
              Edad (en meses)
            </label>
            <input id="edad_meses" name="edad_meses" className="input" inputMode="numeric" placeholder="24" />
          </div>
          <div>
            <label className="label" htmlFor="estado">
              Estado
            </label>
            <select id="estado" name="estado" defaultValue="PERDIDA" className="input">
              {Object.entries(ESTADO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            className="input"
            placeholder="Es muy miedosa, si la ves no la corras, llamame."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="tiene_chip">
              ¿Tiene chip?
            </label>
            <select
              id="tiene_chip"
              name="tiene_chip"
              value={conChip}
              onChange={(e) => setConChip(e.target.value)}
              className="input"
            >
              <option value="">No sé</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          {conChip === 'si' && (
            <div>
              <label className="label" htmlFor="numero_chip">
                Número de chip
              </label>
              <input id="numero_chip" name="numero_chip" className="input" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="castrado">
              ¿Está castrada?
            </label>
            <select
              id="castrado"
              name="castrado"
              value={castrado}
              onChange={(e) => setCastrado(e.target.value)}
              className="input"
            >
              <option value="">No sé</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="card grid gap-4 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-700">Dónde se perdió</legend>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="departamento">
              Departamento
            </label>
            <select
              id="departamento"
              name="departamento"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="input"
            >
              <option value="">—</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ciudad">
              Ciudad / zona
            </label>
            <input id="ciudad" name="ciudad" className="input" list="ciudades-pet" />
            <datalist id="ciudades-pet">
              {ciudades.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label" htmlFor="visto_el">
              Fecha en que la viste por última vez
            </label>
            <input id="visto_el" name="visto_el" type="date" className="input" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="direccion">
            Dirección o referencia
          </label>
          <input id="direccion" name="direccion" className="input" placeholder="Barrio, calle, esquina…" />
        </div>
      </fieldset>

      <fieldset className="card grid gap-4 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-700">Fotos</legend>
        <div>
          <label className="label" htmlFor="fotos">
            Un link por línea (máx. 6). La primera es la principal.
          </label>
          <textarea
            id="fotos"
            name="fotos"
            rows={3}
            className="input font-mono text-xs"
            placeholder={'https://.../foto1.jpg\nhttps://.../foto2.jpg'}
          />
          <p className="mt-1 text-xs text-stone-500">
            Por ahora aceptamos links (Drive, Imgur, etc.). La subida directa de archivos llega con
            Vercel Blob.
          </p>
        </div>
      </fieldset>

      <fieldset className="card grid gap-4 p-4">
        <legend className="px-1 text-sm font-semibold text-stone-700">Contacto</legend>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="telefono">
              Teléfono
            </label>
            <input id="telefono" name="telefono" className="input" inputMode="tel" placeholder="099123456" />
          </div>
          <div>
            <label className="label" htmlFor="whatsapp">
              WhatsApp
            </label>
            <input id="whatsapp" name="whatsapp" className="input" inputMode="tel" placeholder="099123456" />
          </div>
          <div>
            <label className="label" htmlFor="email_contacto">
              Email
            </label>
            <input
              id="email_contacto"
              name="email_contacto"
              type="email"
              className="input"
              defaultValue={email ?? ''}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="recompensa">
            Recompensa (opcional)
          </label>
          <input id="recompensa" name="recompensa" className="input" placeholder="$ 5.000" />
        </div>
      </fieldset>

      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Publicando…' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}

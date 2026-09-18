'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { DEPARTAMENTOS, CIUDADES_POR_DEPARTAMENTO } from '@/lib/uruguay'
import { ESPECIE_LABEL, ESTADO_LABEL } from '@/lib/labels'

export function SearchFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [especie, setEspecie] = useState(params.get('especie') ?? '')
  const [departamento, setDepartamento] = useState(params.get('departamento') ?? '')
  const [ciudad, setCiudad] = useState(params.get('ciudad') ?? '')
  const [estado, setEstado] = useState(params.get('estado') ?? '')

  const ciudades = CIUDADES_POR_DEPARTAMENTO[departamento] ?? []

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (q.trim()) sp.set('q', q.trim())
    if (especie) sp.set('especie', especie)
    if (departamento) sp.set('departamento', departamento)
    if (ciudad) sp.set('ciudad', ciudad)
    if (estado) sp.set('estado', estado)
    router.push(`/mascotas${sp.toString() ? `?${sp}` : ''}`)
  }

  return (
    <form onSubmit={buscar} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="label" htmlFor="q">
          Nombre o seña
        </label>
        <input
          id="q"
          className="input"
          placeholder="Ej: Luna, mancha en el ojo"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="especie">
          Especie
        </label>
        <select id="especie" className="input" value={especie} onChange={(e) => setEspecie(e.target.value)}>
          <option value="">Todas</option>
          {Object.entries(ESPECIE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="departamento">
          Departamento
        </label>
        <select
          id="departamento"
          className="input"
          value={departamento}
          onChange={(e) => {
            setDepartamento(e.target.value)
            setCiudad('')
          }}
        >
          <option value="">Todos</option>
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
        <select
          id="ciudad"
          className="input"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          disabled={!ciudades.length}
        >
          <option value="">Todas</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="estado">
          Estado
        </label>
        <select id="estado" className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Cualquiera</option>
          {Object.entries(ESTADO_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
        <button type="submit" className="btn-primary">
          Buscar
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setQ('')
            setEspecie('')
            setDepartamento('')
            setCiudad('')
            setEstado('')
            router.push('/mascotas')
          }}
        >
          Limpiar
        </button>
      </div>
    </form>
  )
}

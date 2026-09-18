'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function BuscarPorId() {
  const router = useRouter()
  const [valor, setValor] = useState('')

  function ir(e: React.FormEvent) {
    e.preventDefault()
    const soloNum = valor.replace(/[^0-9]/g, '')
    if (!soloNum) return
    router.push(`/mascotas/${soloNum}`)
  }

  return (
    <form onSubmit={ir} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="label" htmlFor="buscar-id">
          ¿Encontraste una mascota? Buscá su ID
        </label>
        <input
          id="buscar-id"
          className="input"
          placeholder="Ej: 12  (el número que figura en la chapa)"
          inputMode="numeric"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary sm:w-40">
        Ver al dueño
      </button>
    </form>
  )
}

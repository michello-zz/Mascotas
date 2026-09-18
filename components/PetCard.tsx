import Link from 'next/link'
import { ESPECIE_EMOJI, ESPECIE_LABEL, idMascota, nombreCompleto, tiempoRelativo } from '@/lib/labels'

export type PetCardData = {
  id: number
  name: string
  species: string
  comments: string | null
  isLost: boolean
  lostAt: Date | null
  owner?: { firstName: string | null; lastName: string | null; name: string | null } | null
}

export function PetCard({ pet }: { pet: PetCardData }) {
  return (
    <Link
      href={`/mascotas/${pet.id}`}
      className="card group overflow-hidden transition hover:shadow-md"
    >
      <div className="flex items-center justify-center bg-stone-100 py-6 text-5xl">
        {ESPECIE_EMOJI[pet.species] ?? '🐾'}
      </div>

      <div className="space-y-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-stone-800">{pet.name}</h3>
          <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-600">
            {idMascota(pet.id)}
          </span>
        </div>

        <p className="text-sm text-stone-500">{ESPECIE_LABEL[pet.species] ?? pet.species}</p>

        {pet.owner && (
          <p className="text-xs text-stone-500">Dueño: {nombreCompleto(pet.owner)}</p>
        )}

        <p className="text-xs text-stone-400">
          {pet.isLost && pet.lostAt ? `Perdida ${tiempoRelativo(pet.lostAt)}` : 'Sin reportar como perdida'}
        </p>
      </div>
    </Link>
  )
}

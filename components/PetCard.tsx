import Link from 'next/link'
import {
  ESPECIE_EMOJI,
  ESPECIE_LABEL,
  ESTADO_COLOR,
  ESTADO_LABEL,
  edadLegible,
  tiempoRelativo,
} from '@/lib/labels'

export type PetCardData = {
  id: string
  name: string
  species: string
  breed: string | null
  sex: string
  size: string | null
  color: string | null
  ageMonths: number | null
  status: string
  city: string | null
  department: string | null
  lastSeenAt: Date | null
  createdAt: Date
  photos: { url: string }[]
}

export function PetCard({ pet }: { pet: PetCardData }) {
  const foto = pet.photos[0]?.url

  return (
    <Link
      href={`/mascotas/${pet.id}`}
      className="card group overflow-hidden transition hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full bg-stone-100">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt={pet.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-stone-300">
            {ESPECIE_EMOJI[pet.species] ?? '🐾'}
          </div>
        )}
      </div>

      <div className="space-y-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-stone-800">
            {ESPECIE_EMOJI[pet.species] ?? '🐾'} {pet.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
              ESTADO_COLOR[pet.status] ?? 'bg-stone-200'
            }`}
          >
            {ESTADO_LABEL[pet.status] ?? pet.status}
          </span>
        </div>

        <p className="text-sm text-stone-500">
          {[
            ESPECIE_LABEL[pet.species],
            pet.breed,
            edadLegible(pet.ageMonths),
            pet.color,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>

        <p className="text-xs text-stone-500">
          📍 {[pet.city, pet.department].filter(Boolean).join(', ') || 'Sin ubicación'}
        </p>

        <p className="text-xs text-stone-400">
          {pet.lastSeenAt ? `Visto ${tiempoRelativo(pet.lastSeenAt)}` : tiempoRelativo(pet.createdAt)}
        </p>
      </div>
    </Link>
  )
}

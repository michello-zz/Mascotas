import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StatusControl } from '@/components/StatusControl'
import { DeletePetButton } from '@/components/DeletePetButton'
import { ESPECIE_EMOJI, ESTADO_LABEL, tiempoRelativo } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  if (!session) redirect('/login?next=/dashboard')

  const mascotas = await prisma.pet.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      photos: { orderBy: { sortOrder: 'asc' }, take: 1 },
      _count: { select: { sightings: true } },
    },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mi panel</h1>
          <p className="text-stone-600">
            Hola {session.user.name} ({session.user.email})
          </p>
        </div>
        <Link href="/mascotas/nueva" className="btn-primary">
          + Publicar
        </Link>
      </div>

      {mascotas.length === 0 ? (
        <div className="card p-8 text-center text-stone-500">
          Todavía no publicaste ninguna mascota.
          <br />
          <Link href="/mascotas/nueva" className="text-teal-700 hover:underline">
            Publicar ahora
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {mascotas.map((p) => (
            <li key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
              <Link href={`/mascotas/${p.id}`} className="shrink-0">
                {p.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photos[0].url}
                    alt={p.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-stone-100 text-3xl text-stone-300">
                    {ESPECIE_EMOJI[p.species] ?? '🐾'}
                  </div>
                )}
              </Link>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/mascotas/${p.id}`}
                    className="font-semibold text-stone-800 hover:text-teal-700"
                  >
                    {p.name}
                  </Link>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                    {ESTADO_LABEL[p.status] ?? p.status}
                  </span>
                  <span className="text-xs text-stone-400">
                    publicada {tiempoRelativo(p.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-stone-500">
                  {p._count.sightings} avistamiento{p._count.sightings === 1 ? '' : 's'} ·{' '}
                  {[p.city, p.department].filter(Boolean).join(', ') || 'sin ubicación'}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusControl petId={p.id} estado={p.status} />
                  <DeletePetButton petId={p.id} nombre={p.name} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

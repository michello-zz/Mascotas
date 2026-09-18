import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PetCard } from '@/components/PetCard'
import { SearchFilters } from '@/components/SearchFilters'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [recientes, totalPerdidas, totalReunidas] = await Promise.all([
    prisma.pet
      .findMany({
        where: { status: { in: ['PERDIDA', 'AVISTADA', 'ENCONTRADA'] } },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { photos: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      })
      .catch(() => []),
    prisma.pet.count({ where: { status: 'PERDIDA' } }).catch(() => 0),
    prisma.pet.count({ where: { status: 'REUNIDA' } }).catch(() => 0),
  ])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
          Ayudemos a que vuelvan a casa 🐾
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-stone-600">
          Publicá tu mascota perdida, mirá las que se reportaron cerca tuyo y avisá si viste alguna.
          Cada dato cuenta.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/mascotas/nueva" className="btn-primary">
            Publicar mascota perdida
          </Link>
          <Link href="/mascotas" className="btn-secondary">
            Ver todas
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-8 text-sm">
          <div>
            <div className="text-2xl font-bold text-red-700">{totalPerdidas}</div>
            <div className="text-stone-500">perdidas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{totalReunidas}</div>
            <div className="text-stone-500">reunidas</div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <SearchFilters />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">Publicaciones recientes</h2>
          <Link href="/mascotas" className="text-sm text-teal-700 hover:underline">
            Ver todas →
          </Link>
        </div>

        {recientes.length === 0 ? (
          <div className="card p-8 text-center text-stone-500">
            Todavía no hay mascotas publicadas. ¿Querés ser el primero?{' '}
            <Link href="/mascotas/nueva" className="text-teal-700 hover:underline">
              Publicar
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recientes.map((p) => (
              <PetCard key={p.id} pet={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PetCard } from '@/components/PetCard'
import { SearchFilters } from '@/components/SearchFilters'
import type { Prisma } from '@/generated/prisma/client'

export const dynamic = 'force-dynamic'

type SP = {
  q?: string
  especie?: string
  departamento?: string
  ciudad?: string
  estado?: string
}

export default async function BuscarPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams

  const where: Prisma.PetWhereInput = {}

  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: 'insensitive' } },
      { breed: { contains: sp.q, mode: 'insensitive' } },
      { color: { contains: sp.q, mode: 'insensitive' } },
      { description: { contains: sp.q, mode: 'insensitive' } },
    ]
  }
  if (sp.especie) where.species = sp.especie as never
  if (sp.departamento) where.department = sp.departamento
  if (sp.ciudad) where.city = sp.ciudad
  if (sp.estado) {
    where.status = sp.estado as never
  } else {
    // por defecto mostramos las que siguen abiertas
    where.status = { in: ['PERDIDA', 'AVISTADA', 'ENCONTRADA'] }
  }

  const mascotas = await prisma.pet.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 60,
    include: { photos: { orderBy: { sortOrder: 'asc' }, take: 1 } },
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Buscar mascotas</h1>
        <Link href="/mascotas/nueva" className="btn-primary">
          Publicar
        </Link>
      </div>

      <section className="mb-6">
        <SearchFilters />
      </section>

      <p className="mb-3 text-sm text-stone-500">
        {mascotas.length} {mascotas.length === 1 ? 'resultado' : 'resultados'}
      </p>

      {mascotas.length === 0 ? (
        <div className="card p-8 text-center text-stone-500">
          No encontramos nada con esos filtros.
          <br />
          Probá sacar algún filtro o{' '}
          <Link href="/mascotas" className="text-teal-700 hover:underline">
            ver todas
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mascotas.map((p) => (
            <PetCard key={p.id} pet={p} />
          ))}
        </div>
      )}
    </main>
  )
}

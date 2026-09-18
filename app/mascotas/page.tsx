import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PetCard } from '@/components/PetCard'
import { ESPECIE_LABEL } from '@/lib/labels'

export const dynamic = 'force-dynamic'

type SP = { especie?: string; q?: string }

export default async function ListadoPerdidas({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const especie = sp.especie && ESPECIE_LABEL[sp.especie] ? sp.especie : undefined
  const q = sp.q?.trim()

  const donde = {
    isLost: true,
    ...(especie ? { species: especie as never } : {}),
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
  }

  const perdidas = await prisma.pet.findMany({
    where: donde,
    orderBy: { lostAt: 'desc' },
    take: 100,
    include: { owner: { select: { firstName: true, lastName: true, name: true } } },
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900">Mascotas perdidas</h1>
      <p className="mt-1 mb-5 text-stone-600">
        Listado público. Hacé clic en una mascota para ver los datos de su dueño.
      </p>

      <form className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="q">
            Buscar por nombre
          </label>
          <input id="q" name="q" defaultValue={q ?? ''} className="input" placeholder="Ej: Luna" />
        </div>
        <div className="sm:w-48">
          <label className="label" htmlFor="especie">
            Especie
          </label>
          <select id="especie" name="especie" defaultValue={especie ?? ''} className="input">
            <option value="">Todas</option>
            {Object.entries(ESPECIE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary sm:w-32">
          Filtrar
        </button>
        <Link href="/mascotas" className="btn-secondary sm:w-32">
          Limpiar
        </Link>
      </form>

      <p className="mb-3 text-sm text-stone-500">
        {perdidas.length} {perdidas.length === 1 ? 'mascota perdida' : 'mascotas perdidas'}
      </p>

      {perdidas.length === 0 ? (
        <div className="card p-8 text-center text-stone-500">
          No hay mascotas perdidas con esos criterios.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perdidas.map((p) => (
            <PetCard key={p.id} pet={p} />
          ))}
        </div>
      )}
    </main>
  )
}

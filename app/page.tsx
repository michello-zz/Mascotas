import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PetCard } from '@/components/PetCard'
import { BuscarPorId } from '@/components/BuscarPorId'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [perdidas, registradas, encontradas, ultimas] = await Promise.all([
    prisma.pet.count({ where: { isLost: true } }).catch(() => 0),
    prisma.pet.count().catch(() => 0),
    prisma.pet.count({ where: { foundAt: { not: null } } }).catch(() => 0),
    prisma.pet
      .findMany({
        where: { isLost: true },
        orderBy: { lostAt: 'desc' },
        take: 6,
        include: { owner: { select: { firstName: true, lastName: true, name: true } } },
      })
      .catch(() => []),
  ])

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
          Ayudemos a que vuelvan a casa 🐾
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-stone-600">
          Cada mascota registrada tiene un <b>ID único</b> y un <b>código QR</b>. Quien la
          encuentre escanea el QR y ve al instante de quién es y cómo contactar al dueño.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/mascotas" className="btn-primary">
            Ver mascotas perdidas
          </Link>
          <Link href="/login?modo=registro" className="btn-secondary">
            Registrar mis mascotas
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm">
          <div>
            <div className="text-2xl font-bold text-red-700">{perdidas}</div>
            <div className="text-stone-500">perdidas ahora</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{encontradas}</div>
            <div className="text-stone-500">encontradas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-800">{registradas}</div>
            <div className="text-stone-500">registradas</div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <BuscarPorId />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">Perdidas recientes</h2>
          <Link href="/mascotas" className="text-sm text-teal-700 hover:underline">
            Ver todas →
          </Link>
        </div>

        {ultimas.length === 0 ? (
          <div className="card p-8 text-center text-stone-500">
           No hay mascotas perdidas publicadas en este momento. 🎉
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ultimas.map((p) => (
              <PetCard key={p.id} pet={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

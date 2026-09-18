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
      <section className="mb-10 grid items-center gap-8 lg:grid-cols-2">
        {/* Imagen: el collar con la identificación. Se reemplaza por la foto definitiva. */}
        <div className="mx-auto w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/collar-id.svg"
            alt="Collar con chapa identificatoria y código QR"
            className="w-full"
          />
        </div>

        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
            Ayudemos a que vuelvan a casa 🐾
          </h1>
          <p className="mt-3 text-stone-600">
            Poné a tu mascota un <b>collar con su identificación</b>: el ID y el código QR hacen que
            quien la encuentre sepa al instante de quién es, sin vueltas.
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Registrá a tus mascotas, descargá su QR, imprimilo y listo. Si algún día se pierde, un
            escaneo alcanza.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/mascotas" className="btn-primary">
              Ver mascotas perdidas
            </Link>
            <Link href="/login?modo=registro" className="btn-secondary">
              Registrar mis mascotas
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm lg:justify-start">
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

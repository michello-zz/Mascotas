import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PerfilForm } from '@/components/PerfilForm'
import { PetForm } from '@/components/PetForm'
import { PetAcciones } from '@/components/PetAcciones'
import { ESPECIE_EMOJI, ESPECIE_LABEL, fmtFechaHora, idMascota } from '@/lib/labels'
import { MAX_MASCOTAS } from '@/lib/constantes'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  if (!session) redirect('/login?next=/dashboard')

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      comments: true,
      role: true,
      approved: true,
    },
  })
  if (!usuario) redirect('/login')
  // Los dueños nuevos necesitan el visto bueno del administrador.
  if (!usuario.approved && usuario.role !== 'ADMIN') redirect('/pendiente')

  const mascotas = await prisma.pet.findMany({
    where: { ownerId: usuario.id },
    orderBy: { id: 'asc' },
  })

  const perdidas = mascotas.filter((m) => m.isLost).length

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mi panel</h1>
          <p className="text-stone-600">
            {mascotas.length} de {MAX_MASCOTAS} mascotas
            {perdidas > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                {perdidas} perdida{perdidas === 1 ? '' : 's'}
              </span>
            )}
          </p>
        </div>
        {mascotas.length < MAX_MASCOTAS && (
          <Link href="/mascotas/nueva" className="btn-primary">
            + Agregar mascota
          </Link>
        )}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-800">Mis mascotas</h2>

          {mascotas.length === 0 ? (
            <div className="card p-8 text-center text-stone-500">
              Todavía no cargaste ninguna mascota.
              <br />
              <Link href="/mascotas/nueva" className="text-teal-700 hover:underline">
                Agregar la primera
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {mascotas.map((m) => (
                <li key={m.id} className="card p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="text-4xl">{ESPECIE_EMOJI[m.species] ?? '🐾'}</div>

                    <div className="min-w-56 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-stone-800">{m.name}</span>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-600">
                          {idMascota(m.id)}
                        </span>
                        {m.isLost ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                            PERDIDA
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            EN CASA
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-stone-500">
                        {ESPECIE_LABEL[m.species] ?? m.species}
                      </p>

                      {m.comments && <p className="text-sm text-stone-600">{m.comments}</p>}

                      {m.isLost && m.lostAt && (
                        <p className="text-xs text-red-700">
                          Reportada perdida el {fmtFechaHora(m.lostAt)}
                          {m.lostComment ? ` · “${m.lostComment}”` : ''}
                        </p>
                      )}
                      {!m.isLost && m.foundAt && (
                        <p className="text-xs text-green-700">
                          Encontrada el {fmtFechaHora(m.foundAt)}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1 text-sm">
                        <Link href={`/mascotas/${m.id}`} className="text-teal-700 hover:underline">
                          Ver ficha pública
                        </Link>
                        <a
                          href={`/mascotas/${m.id}/qr?descargar=1`}
                          className="text-teal-700 hover:underline"
                        >
                          Descargar QR
                        </a>
                      </div>
                    </div>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/mascotas/${m.id}/qr`}
                      alt={`QR ${m.name}`}
                      className="h-24 w-24 rounded border border-stone-200"
                    />
                  </div>

                  <div className="mt-4 grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2">
                    <PetAcciones
                      petId={m.id}
                      nombre={m.name}
                      isLost={m.isLost}
                      telefono={usuario.phone}
                    />

                    <details className="rounded-lg border border-stone-200 p-3">
                      <summary className="cursor-pointer text-sm font-medium text-stone-700">
                        Editar datos
                      </summary>
                      <div className="mt-3">
                        <PetForm
                          modo="editar"
                          pet={{ id: m.id, name: m.name, species: m.species, comments: m.comments }}
                        />
                      </div>
                    </details>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <PerfilForm usuario={usuario} />
        </section>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ESPECIE_EMOJI, ESPECIE_LABEL, fmtFecha, idMascota, linkWhatsapp, nombreCompleto, tiempoRelativo } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function FichaMascota({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const num = parseInt(id.replace(/[^0-9]/g, ''), 10)
  if (!Number.isFinite(num)) notFound()

  const pet = await prisma.pet.findUnique({
    where: { id: num },
    include: {
      owner: {
        select: { firstName: true, lastName: true, name: true, phone: true, email: true, comments: true },
      },
    },
  })

  if (!pet) notFound()

  const duenio = nombreCompleto(pet.owner)
  const tel = pet.owner.phone
  const texto = `Hola ${duenio}! Encontré a ${pet.name} (ID ${idMascota(pet.id)}) en Mascotas. `

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/mascotas" className="text-sm text-stone-500 hover:text-teal-700">
        ← Listado de mascotas perdidas
      </Link>

      <div className="card mt-4 overflow-hidden">
        <div className="flex items-center gap-4 border-b border-stone-200 bg-stone-50 p-5">
          <div className="text-5xl">{ESPECIE_EMOJI[pet.species] ?? '🐾'}</div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{pet.name}</h1>
            <p className="font-mono text-sm text-stone-500">ID {idMascota(pet.id)}</p>
          </div>
          <div className="ml-auto">
            {pet.isLost ? (
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                PERDIDA
              </span>
            ) : (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                {pet.foundAt ? 'ENCONTRADA' : 'EN CASA'}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            {pet.isLost && (
              <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                <h2 className="font-semibold text-red-900">Está perdida — cómo contactar al dueño</h2>
                <p className="mt-1 whitespace-pre-line text-red-900">{pet.lostComment || '—'}</p>
                {pet.lostAt && (
                  <p className="mt-2 text-xs text-red-700">
                    Reportada {tiempoRelativo(pet.lostAt)} ({fmtFecha(pet.lostAt)})
                  </p>
                )}
              </div>
            )}

            <div>
              <h2 className="mb-2 font-semibold text-stone-800">Datos de la mascota</h2>
              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <div className="flex justify-between gap-4 border-b border-stone-100 py-1">
                  <dt className="text-sm text-stone-500">ID</dt>
                  <dd className="font-mono text-sm font-medium text-stone-800">{idMascota(pet.id)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-stone-100 py-1">
                  <dt className="text-sm text-stone-500">Nombre</dt>
                  <dd className="text-sm font-medium text-stone-800">{pet.name}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-stone-100 py-1">
                  <dt className="text-sm text-stone-500">Especie</dt>
                  <dd className="text-sm font-medium text-stone-800">
                    {ESPECIE_LABEL[pet.species] ?? pet.species}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-stone-100 py-1">
                  <dt className="text-sm text-stone-500">Dueño</dt>
                  <dd className="text-sm font-medium text-stone-800">{duenio}</dd>
                </div>
              </dl>
              {pet.comments && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-stone-700">Comentarios</h3>
                  <p className="mt-1 whitespace-pre-line text-stone-700">{pet.comments}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-2 font-semibold text-stone-800">Contacto del dueño</h2>
              {tel ? (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={linkWhatsapp(tel, texto)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                  >
                    WhatsApp {tel}
                  </a>
                  <a href={`tel:${tel}`} className="btn-secondary">
                    Llamar
                  </a>
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  El dueño no cargó un teléfono. Probá con el correo.
                </p>
              )}
              {pet.owner.email && (
                <p className="mt-2 text-sm text-stone-500">
                  Correo: <span className="text-stone-700">{pet.owner.email}</span>
                </p>
              )}
              {pet.owner.comments && (
                <p className="mt-2 text-sm text-stone-600">{pet.owner.comments}</p>
              )}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="card p-3 text-center">
              <p className="mb-2 text-xs font-medium text-stone-500">Código QR de esta mascota</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/mascotas/${pet.id}/qr`}
                alt={`Código QR de ${pet.name}`}
                className="mx-auto h-40 w-40"
              />
              <p className="mt-2 text-xs text-stone-500">
                Quien lo escanee llega a esta página.
              </p>
              <a href={`/mascotas/${pet.id}/qr?descargar=1`} className="btn-secondary mt-3 w-full">
                Descargar PNG
              </a>
            </div>

            <div className="card p-3 text-xs text-stone-500">
              Escaneá el QR con la cámara del celular o buscá el ID{' '}
              <b className="font-mono">{idMascota(pet.id)}</b> en el sitio.
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

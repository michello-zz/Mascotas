import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { SightingForm } from '@/components/SightingForm'
import { StatusControl } from '@/components/StatusControl'
import {
  ESPECIE_EMOJI,
  ESPECIE_LABEL,
  ESTADO_COLOR,
  ESTADO_LABEL,
  SEXO_LABEL,
  TAMANO_LABEL,
  edadLegible,
  fmtFecha,
  linkWhatsapp,
  tiempoRelativo,
} from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function MascotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [pet, session] = await Promise.all([
    prisma.pet.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        sightings: { orderBy: { createdAt: 'desc' } },
        owner: { select: { id: true, name: true } },
      },
    }),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ])

  if (!pet) notFound()

  const soyDueno = session?.user.id === pet.ownerId
  const tel = pet.contactWhatsapp ?? pet.contactPhone
  const textoWa = `Hola! Vi la publicación de ${pet.name} en Mascotas. `

  const datos = [
    ['Especie', ESPECIE_LABEL[pet.species]],
    ['Raza', pet.breed],
    ['Sexo', SEXO_LABEL[pet.sex]],
    ['Tamaño', pet.size ? TAMANO_LABEL[pet.size] : null],
    ['Color / señas', pet.color],
    ['Edad', edadLegible(pet.ageMonths)],
    ['Chip', pet.hasChip ? pet.chipNumber ?? 'Sí' : null],
    ['Castrada', pet.sterilized == null ? null : pet.sterilized ? 'Sí' : 'No'],
  ].filter(([, v]) => Boolean(v)) as [string, string][]

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/mascotas" className="text-sm text-stone-500 hover:text-teal-700">
        ← Volver a la búsqueda
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Columna principal */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-stone-900">
                {ESPECIE_EMOJI[pet.species] ?? '🐾'} {pet.name}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  ESTADO_COLOR[pet.status] ?? 'bg-stone-200'
                }`}
              >
                {ESTADO_LABEL[pet.status] ?? pet.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              Publicado por {pet.owner.name} · {tiempoRelativo(pet.createdAt)}
            </p>
          </div>

          {pet.photos.length === 0 ? (
            <div className="card flex aspect-[4/3] items-center justify-center text-6xl text-stone-300">
              {ESPECIE_EMOJI[pet.species] ?? '🐾'}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pet.photos[0].url}
                  alt={pet.name}
                  className="max-h-[520px] w-full object-contain bg-stone-100"
                />
              </div>
              {pet.photos.length > 1 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {pet.photos.slice(1).map((f) => (
                    <div key={f.id} className="card overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.url} alt={pet.name} className="aspect-square w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {pet.description && (
            <div className="card p-4">
              <h2 className="mb-2 font-semibold text-stone-800">Descripción</h2>
              <p className="whitespace-pre-line text-stone-700">{pet.description}</p>
            </div>
          )}

          <div className="card p-4">
            <h2 className="mb-3 font-semibold text-stone-800">Datos</h2>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {datos.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-stone-100 py-1">
                  <dt className="text-sm text-stone-500">{k}</dt>
                  <dd className="text-sm font-medium text-stone-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Avistamientos */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-stone-800">
              Avistamientos ({pet.sightings.length})
            </h2>

            {pet.sightings.length === 0 ? (
              <p className="text-sm text-stone-500">Todavía no hay avistamientos reportados.</p>
            ) : (
              <ul className="space-y-3">
                {pet.sightings.map((a) => (
                  <li key={a.id} className="card p-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-stone-800">
                        {a.reporterName || 'Anónimo'}
                      </span>
                      <span className="text-stone-400">
                        {a.seenAt ? `lo vio el ${fmtFecha(a.seenAt)}` : tiempoRelativo(a.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-stone-700">{a.description}</p>
                    {(a.city || a.department || a.address) && (
                      <p className="mt-1 text-xs text-stone-500">
                        📍 {[a.address, a.city, a.department].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {a.reporterPhone && (
                      <p className="mt-1 text-xs text-stone-500">📞 {a.reporterPhone}</p>
                    )}
                    {a.photoUrl && (
                      <a
                        href={a.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-teal-700 hover:underline"
                      >
                        Ver foto
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <SightingForm
              petId={pet.id}
              ciudadDefault={pet.city}
              departamentoDefault={pet.department}
            />
          </section>
        </div>

        {/* Columna lateral */}
        <aside className="space-y-4">
          <div className="card p-4">
            <h2 className="mb-2 font-semibold text-stone-800">Última ubicación</h2>
            <p className="text-sm text-stone-700">
              📍 {[pet.address, pet.city, pet.department].filter(Boolean).join(', ') || 'Sin datos'}
            </p>
            {pet.lastSeenAt && (
              <p className="mt-1 text-sm text-stone-500">Visto el {fmtFecha(pet.lastSeenAt)}</p>
            )}
            {pet.lat != null && pet.lng != null && (
              <a
                href={`https://www.google.com/maps?q=${pet.lat},${pet.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-teal-700 hover:underline"
              >
                Ver en el mapa →
              </a>
            )}
          </div>

          <div className="card space-y-2 p-4">
            <h2 className="font-semibold text-stone-800">Contacto</h2>
            {pet.reward && (
              <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
                🎁 Recompensa: {pet.reward}
              </p>
            )}
            {tel && (
              <>
                <a
                  href={linkWhatsapp(tel, textoWa)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary w-full"
                >
                  WhatsApp
                </a>
                <a href={`tel:${tel}`} className="btn-secondary w-full">
                  Llamar {tel}
                </a>
              </>
            )}
            {pet.contactEmail && (
              <a
                href={`mailto:${pet.contactEmail}?subject=${encodeURIComponent(
                  `Sobre ${pet.name} — Mascotas`,
                )}`}
                className="btn-secondary w-full"
              >
                Email
              </a>
            )}
            {!tel && !pet.contactEmail && (
              <p className="text-sm text-stone-500">El dueño no dejó datos de contacto.</p>
            )}
          </div>

          {soyDueno && (
            <div className="card space-y-3 p-4">
              <h2 className="font-semibold text-stone-800">Tu publicación</h2>
              <p className="text-sm text-stone-500">
                ¿Apareció? Cambiá el estado para que otros lo sepan.
              </p>
              <StatusControl petId={pet.id} estado={pet.status} />
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}

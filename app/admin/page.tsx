import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  Aprobar,
  BorrarMascotaAdmin,
  BorrarUsuario,
  CambiarRol,
  Rechazar,
} from '@/components/AdminAcciones'
import { ESPECIE_LABEL, ROL_LABEL, fmtFecha, idMascota, nombreCompleto, tiempoRelativo } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  if (!session) redirect('/login?next=/admin')
  if (session.user.role !== 'ADMIN') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-stone-900">Acceso restringido</h1>
        <p className="mt-2 text-stone-600">Esta sección es solo para administradores.</p>
        <Link href="/" className="btn-primary mt-6">
          Volver al inicio
        </Link>
      </main>
    )
  }

  const [usuarios, mascotas] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ approved: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phone: true,
        comments: true,
        role: true,
        approved: true,
        createdAt: true,
        _count: { select: { pets: true } },
      },
    }),
    prisma.pet.findMany({
      orderBy: { id: 'asc' },
      include: {
        owner: { select: { firstName: true, lastName: true, name: true, email: true, phone: true } },
      },
    }),
  ])

  const pendientes = usuarios.filter((u) => !u.approved && u.role !== 'ADMIN')
  const activos = usuarios.filter((u) => u.approved || u.role === 'ADMIN')
  const perdidas = mascotas.filter((m) => m.isLost).length
  const encontradas = mascotas.filter((m) => m.foundAt).length

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900">Administración</h1>
      <p className="mt-1 mb-6 text-stone-600">
        Acceso total: aprobación de dueños, usuarios, mascotas y estados.
      </p>

      <div className="mb-8 grid gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-amber-700">{pendientes.length}</div>
          <div className="text-sm text-stone-500">esperando aprobación</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-stone-800">{activos.length}</div>
          <div className="text-sm text-stone-500">dueños activos</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-red-700">{perdidas}</div>
          <div className="text-sm text-stone-500">perdidas ahora</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-700">{encontradas}</div>
          <div className="text-sm text-stone-500">encontradas</div>
        </div>
      </div>

      {/* Solicitudes pendientes */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-800">
          Solicitudes pendientes ({pendientes.length})
        </h2>

        {pendientes.length === 0 ? (
          <div className="card p-6 text-center text-stone-500">
            No hay solicitudes esperando. 🎉
          </div>
        ) : (
          <ul className="space-y-3">
            {pendientes.map((u) => (
              <li key={u.id} className="card flex flex-wrap items-center gap-4 border-l-4 border-amber-400 p-4">
                <div className="min-w-56 flex-1">
                  <div className="font-semibold text-stone-800">{nombreCompleto(u)}</div>
                  <div className="text-sm text-stone-600">
                    {u.email} · {u.phone ?? 'sin teléfono'}
                  </div>
                  {u.comments && <div className="text-xs text-stone-500">{u.comments}</div>}
                  <div className="text-xs text-stone-400">
                    se registró {tiempoRelativo(u.createdAt)} ({fmtFecha(u.createdAt)})
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Aprobar userId={u.id} nombre={nombreCompleto(u)} />
                  <Rechazar userId={u.id} nombre={nombreCompleto(u)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Usuarios */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-800">
          Usuarios activos ({activos.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">Correo</th>
                <th className="py-2 pr-3">Teléfono</th>
                <th className="py-2 pr-3">Mascotas</th>
                <th className="py-2 pr-3">Rol</th>
                <th className="py-2 pr-3">Alta</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {activos.map((u) => (
                <tr key={u.id} className="border-b border-stone-100 align-top">
                  <td className="py-3 pr-3">
                    <div className="font-medium text-stone-800">{nombreCompleto(u)}</div>
                    {u.comments && <div className="text-xs text-stone-500">{u.comments}</div>}
                  </td>
                  <td className="py-3 pr-3 text-stone-600">{u.email}</td>
                  <td className="py-3 pr-3 text-stone-600">{u.phone ?? '—'}</td>
                  <td className="py-3 pr-3 text-stone-600">{u._count.pets}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === 'ADMIN' ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {ROL_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-xs text-stone-500">{fmtFecha(u.createdAt)}</td>
                  <td className="py-3">
                    <div className="flex flex-col gap-2">
                      <CambiarRol userId={u.id} rol={u.role} />
                      <BorrarUsuario userId={u.id} nombre={nombreCompleto(u)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mascotas */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-800">Mascotas ({mascotas.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">Especie</th>
                <th className="py-2 pr-3">Dueño</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {mascotas.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-500">
                    Todavía no hay mascotas cargadas.
                  </td>
                </tr>
              )}
              {mascotas.map((m) => (
                <tr key={m.id} className="border-b border-stone-100 align-top">
                  <td className="py-3 pr-3 font-mono text-stone-600">{idMascota(m.id)}</td>
                  <td className="py-3 pr-3">
                    <Link
                      href={`/mascotas/${m.id}`}
                      className="font-medium text-stone-800 hover:text-teal-700"
                    >
                      {m.name}
                    </Link>
                    {m.comments && <div className="text-xs text-stone-500">{m.comments}</div>}
                  </td>
                  <td className="py-3 pr-3 text-stone-600">{ESPECIE_LABEL[m.species] ?? m.species}</td>
                  <td className="py-3 pr-3 text-stone-600">
                    {nombreCompleto(m.owner)}
                    <div className="text-xs text-stone-500">{m.owner.phone ?? m.owner.email}</div>
                  </td>
                  <td className="py-3 pr-3">
                    {m.isLost ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                        PERDIDA
                      </span>
                    ) : m.foundAt ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        ENCONTRADA
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                        EN CASA
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <BorrarMascotaAdmin petId={m.id} nombre={m.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

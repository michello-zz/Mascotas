import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PetForm } from '@/components/PetForm'
import { MAX_MASCOTAS } from '@/lib/constantes'

export const dynamic = 'force-dynamic'

export default async function NuevaMascotaPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  if (!session) redirect('/login?next=/mascotas/nueva')

  const cantidad = await prisma.pet.count({ where: { ownerId: session.user.id } })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900">Agregar mascota</h1>
      <p className="mt-1 mb-6 text-stone-600">
        Cada mascota recibe un <b>ID único</b> y su <b>código QR</b>, que podés imprimir y ponerle
        en la chapa del collar.
      </p>

      {cantidad >= MAX_MASCOTAS ? (
        <div className="card p-6">
          <p className="font-medium text-stone-800">
            Ya tenés {cantidad} de {MAX_MASCOTAS} mascotas cargadas.
          </p>
          <p className="mt-1 text-sm text-stone-600">
            El límite es {MAX_MASCOTAS} por dueño. Si querés agregar otra, borrá una desde tu panel.
          </p>
          <a href="/dashboard" className="btn-primary mt-4">
            Ir a mi panel
          </a>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-stone-500">
            Vas {cantidad} de {MAX_MASCOTAS}.
          </p>
          <PetForm modo="crear" />
        </>
      )}
    </main>
  )
}

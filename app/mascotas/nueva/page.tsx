import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PetForm } from '@/components/PetForm'

export const dynamic = 'force-dynamic'

export default async function NuevaMascotaPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  if (!session) redirect('/login?next=/mascotas/nueva')

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900">Publicar mascota</h1>
      <p className="mt-1 mb-6 text-stone-600">
        Cuantos más datos y fotos pongas, más chances hay de encontrarla.
      </p>
      <PetForm email={session.user.email} />
    </main>
  )
}

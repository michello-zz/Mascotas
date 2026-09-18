import { redirect } from 'next/navigation'
import { usuarioActual } from '@/lib/sesion'
import { PendienteAviso } from '@/components/PendienteAviso'

export const dynamic = 'force-dynamic'

export default async function PendientePage() {
  const u = await usuarioActual()
  if (!u) redirect('/login?next=/dashboard')
  if (u.approved) redirect('/dashboard')

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <PendienteAviso email={u.email} />
    </main>
  )
}

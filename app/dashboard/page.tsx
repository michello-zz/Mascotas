import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  return (
    <main style={{ maxWidth: 640, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Dashboard</h1>
      <p>
        Hola <b>{session.user.name}</b> ({session.user.email})
      </p>
      <p>Área privada: sólo se ve con sesión activa.</p>
      <Link href="/">← Volver</Link>
    </main>
  )
}

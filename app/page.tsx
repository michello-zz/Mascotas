import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>nuevo-sitio</h1>
      <p>Next.js + Prisma + PostgreSQL + Better Auth, listo para Vercel.</p>
      <ul>
        <li>
          <Link href="/login">Login / Registro</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard (protegido)</Link>
        </li>
        <li>
          <Link href="/api/health">Health check</Link>
        </li>
      </ul>
    </main>
  )
}

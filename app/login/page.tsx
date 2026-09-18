import { Suspense } from 'react'
import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Suspense fallback={<div className="card p-6 text-stone-500">Cargando…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}

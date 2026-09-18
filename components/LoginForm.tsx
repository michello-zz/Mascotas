'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth-client'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)

    const res =
      mode === 'signup'
        ? await signUp.email({ name, email, password })
        : await signIn.email({ email, password })

    setBusy(false)

    if (res.error) {
      setMsg(res.error.message ?? 'Error inesperado')
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-stone-900">
        {mode === 'signin' ? 'Ingresar' : 'Crear cuenta'}
      </h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        {mode === 'signin'
          ? 'Entrá para publicar y administrar tus mascotas.'
          : 'Con una cuenta podés publicar y hacer seguimiento.'}
      </p>

      <form onSubmit={onSubmit} className="grid gap-4">
        {mode === 'signup' && (
          <div>
            <label className="label" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          {mode === 'signup' && <p className="mt-1 text-xs text-stone-500">Mínimo 8 caracteres.</p>}
        </div>

        {msg && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{msg}</p>}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Un momento…' : mode === 'signin' ? 'Ingresar' : 'Registrarme'}
        </button>
      </form>

      <p className="mt-4 text-sm text-stone-600">
        {mode === 'signin' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setMsg(null)
          }}
          className="font-semibold text-teal-700 hover:underline"
        >
          {mode === 'signin' ? 'Registrate' : 'Ingresá'}
        </button>
      </p>
    </div>
  )
}

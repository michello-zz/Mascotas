'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/lib/auth-client'

export default function LoginPage() {
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
    window.location.href = '/dashboard'
  }

  return (
    <main style={{ maxWidth: 380, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>{mode === 'signin' ? 'Ingresar' : 'Crear cuenta'}</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        {mode === 'signup' && (
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: 10 }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10 }}
        />
        <input
          type="password"
          placeholder="Contraseña (mín. 8)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 10 }}
        />
        <button type="submit" disabled={busy} style={{ padding: 10 }}>
          {busy ? '...' : mode === 'signin' ? 'Ingresar' : 'Registrarme'}
        </button>
      </form>

      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

      <p style={{ marginTop: 16 }}>
        {mode === 'signin' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={{ background: 'none', border: 'none', color: '#06f', cursor: 'pointer', padding: 0 }}
        >
          {mode === 'signin' ? 'Registrate' : 'Ingresá'}
        </button>
      </p>
    </main>
  )
}

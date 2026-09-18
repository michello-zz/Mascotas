'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth-client'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'

  const [modo, setModo] = useState<'ingresar' | 'registro'>(
    params.get('modo') === 'registro' ? 'registro' : 'ingresar',
  )
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comments: '',
    password: '',
  })
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)

    if (modo === 'registro') {
      if (!form.firstName.trim()) return fail('Poné tu nombre.')
      if (!form.lastName.trim()) return fail('Poné tu apellido.')
      if (!form.phone.trim()) return fail('Poné tu teléfono: es el dato que más se usa para avisarte.')

      const res = await signUp.email({
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        comments: form.comments.trim(),
      } as never)

      if (res.error) return fail(res.error.message ?? 'No se pudo crear la cuenta.')
      router.push('/dashboard')
      router.refresh()
      return
    }

    const res = await signIn.email({ email: form.email.trim(), password: form.password })
    if (res.error) return fail('Correo o contraseña incorrectos.')
    router.push(next)
    router.refresh()
  }

  function fail(m: string) {
    setBusy(false)
    setMsg(m)
    return
  }

  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-stone-900">
        {modo === 'ingresar' ? 'Ingresar' : 'Crear cuenta de dueño'}
      </h1>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        {modo === 'ingresar'
          ? 'Entrá para gestionar tus mascotas y reportar las que se pierdan.'
          : 'Cargá tus datos una vez y después podés registrar hasta 5 mascotas.'}
      </p>

      <form onSubmit={onSubmit} className="grid gap-4">
        {modo === 'registro' && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="firstName">
                  Nombre *
                </label>
                <input
                  id="firstName"
                  className="input"
                  value={form.firstName}
                  onChange={set('firstName')}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="label" htmlFor="lastName">
                  Apellido *
                </label>
                <input
                  id="lastName"
                  className="input"
                  value={form.lastName}
                  onChange={set('lastName')}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="phone">
                Teléfono *
              </label>
              <input
                id="phone"
                className="input"
                inputMode="tel"
                placeholder="099123456"
                value={form.phone}
                onChange={set('phone')}
                autoComplete="tel"
              />
              <p className="mt-1 text-xs text-stone-500">
                Es el número que va a ver quien encuentre a tu mascota.
              </p>
            </div>
          </>
        )}

        <div>
          <label className="label" htmlFor="email">
            Correo *
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </div>

        {modo === 'registro' && (
          <div>
            <label className="label" htmlFor="comments">
              Comentarios
            </label>
            <textarea
              id="comments"
              rows={2}
              className="input"
              value={form.comments}
              onChange={set('comments')}
              placeholder="Opcional"
            />
          </div>
        )}

        <div>
          <label className="label" htmlFor="password">
            Contraseña *
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={set('password')}
            required
            minLength={8}
            autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
          />
          {modo === 'registro' && <p className="mt-1 text-xs text-stone-500">Mínimo 8 caracteres.</p>}
        </div>

        {msg && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{msg}</p>}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Un momento…' : modo === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-4 text-sm text-stone-600">
        {modo === 'ingresar' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
        <button
          type="button"
          onClick={() => {
            setModo(modo === 'ingresar' ? 'registro' : 'ingresar')
            setMsg(null)
          }}
          className="font-semibold text-teal-700 hover:underline"
        >
          {modo === 'ingresar' ? 'Creá una' : 'Ingresá'}
        </button>
      </p>
    </div>
  )
}

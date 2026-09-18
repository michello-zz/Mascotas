import { headers } from 'next/headers'
import { auth } from './auth'

export type UsuarioSesion = {
  id: string
  name: string
  email: string
  role: string
  approved: boolean
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  comments?: string | null
}

export async function sesion() {
  const s = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  return s
}

export async function usuarioActual(): Promise<UsuarioSesion | null> {
  const s = await sesion()
  return (s?.user as unknown as UsuarioSesion) ?? null
}

/// Usuario logueado Y aprobado por el administrador.
export async function usuarioAprobado(): Promise<UsuarioSesion | null> {
  const u = await usuarioActual()
  if (!u) return null
  return u.approved ? u : null
}

export async function esAdmin(): Promise<boolean> {
  const u = await usuarioActual()
  return u?.role === 'ADMIN'
}

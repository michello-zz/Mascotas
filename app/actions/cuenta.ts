'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MAX_MASCOTAS, type ActionState } from '@/lib/constantes'

async function usuarioActual() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

function txt(fd: FormData, k: string) {
  const v = fd.get(k)
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length ? s : null
}

/* ─────────────── El dueño edita sus propios datos ─────────────── */

export async function actualizarPerfil(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' }

  const firstName = txt(formData, 'firstName')
  const lastName = txt(formData, 'lastName')
  if (!firstName) return { error: 'Poné tu nombre.' }
  if (!lastName) return { error: 'Poné tu apellido.' }

  const phone = txt(formData, 'phone')
  if (!phone) return { error: 'Poné un teléfono: es el dato que más se usa para avisarte.' }

  const email = txt(formData, 'email')
  if (!email) return { error: 'Falta el correo.' }

  const emailNorm = email.toLowerCase()
  if (emailNorm !== user.email.toLowerCase()) {
    const ocupado = await prisma.user.findUnique({ where: { email: emailNorm }, select: { id: true } })
    if (ocupado && ocupado.id !== user.id) return { error: 'Ya hay otra cuenta con ese correo.' }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        phone,
        comments: txt(formData, 'comments'),
        email: emailNorm,
        name: `${firstName} ${lastName}`.trim(),
      },
    })
  } catch (e) {
    return { error: `No se pudo guardar: ${(e as Error).message}` }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { ok: true, mensaje: 'Tus datos quedaron actualizados.' }
}

/* ─────────────── Solo ADMIN ─────────────── */

async function requerirAdmin() {
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' as const, user: null }
  if (user.role !== 'ADMIN') return { error: 'Solo un administrador puede hacer esto.' as const, user: null }
  return { error: null, user }
}

export async function cambiarRol(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { error, user } = await requerirAdmin()
  if (error || !user) return { error: error ?? 'Sin permisos.' }

  const id = txt(formData, 'userId')
  const rol = txt(formData, 'role')
  if (!id || !rol || !['DUENO', 'ADMIN'].includes(rol)) return { error: 'Datos incompletos.' }
  if (id === user.id) return { error: 'No podés cambiarte el rol a vos mismo.' }

  await prisma.user.update({ where: { id }, data: { role: rol as 'DUENO' | 'ADMIN' } })
  revalidatePath('/admin')
  return { ok: true, mensaje: 'Rol actualizado.' }
}

export async function borrarUsuario(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { error, user } = await requerirAdmin()
  if (error || !user) return { error: error ?? 'Sin permisos.' }

  const id = txt(formData, 'userId')
  if (!id) return { error: 'Falta el usuario.' }
  if (id === user.id) return { error: 'No podés borrar tu propia cuenta.' }

  await prisma.user.delete({ where: { id } }) // borra en cascada sus mascotas y sesiones
  revalidatePath('/admin')
  return { ok: true, mensaje: 'Usuario y sus mascotas eliminados.' }
}

export async function borrarMascotaAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { error, user } = await requerirAdmin()
  if (error || !user) return { error: error ?? 'Sin permisos.' }

  const raw = txt(formData, 'petId')
  const id = raw ? parseInt(raw.replace(/[^0-9]/g, ''), 10) : NaN
  if (!Number.isFinite(id)) return { error: 'Falta la mascota.' }

  await prisma.pet.delete({ where: { id } })
  revalidatePath('/admin')
  revalidatePath('/mascotas')
  return { ok: true, mensaje: 'Mascota eliminada.' }
}

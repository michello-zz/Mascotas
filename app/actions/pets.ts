'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { usuarioActual, type UsuarioSesion } from '@/lib/sesion'
import { MAX_MASCOTAS, ESPECIES, type ActionState } from '@/lib/constantes'

const ESPECIES_VALIDAS = ESPECIES
type Especie = (typeof ESPECIES)[number]

/** Usuario logueado y aprobado por el administrador (el admin siempre pasa). */
async function requerido(): Promise<{ user: UsuarioSesion | null; error?: string }> {
  const u = await usuarioActual()
  if (!u) return { user: null, error: 'Necesitás iniciar sesión.' }
  if (!u.approved && u.role !== 'ADMIN') {
    return {
      user: null,
      error: 'Tu cuenta todavía no fue aprobada por el administrador.',
    }
  }
  return { user: u }
}

function txt(fd: FormData, k: string) {
  const v = fd.get(k)
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length ? s : null
}

function entero(fd: FormData, k: string) {
  const s = txt(fd, k)
  if (!s) return null
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(n) ? n : null
}

function especieValida(fd: FormData): Especie | null {
  const s = txt(fd, 'especie')
  return s && (ESPECIES_VALIDAS as readonly string[]).includes(s) ? (s as Especie) : null
}

function refrescar(id?: number) {
  revalidatePath('/')
  revalidatePath('/mascotas')
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  if (id) {
    revalidatePath(`/mascotas/${id}`)
    revalidatePath(`/mascotas/${id}/qr`)
  }
}

/** Verifica que la mascota exista y que el usuario pueda tocarla. */
async function mascotaPropia(id: number, user: UsuarioSesion) {
  const pet = await prisma.pet.findUnique({ where: { id }, select: { ownerId: true } })
  if (!pet) return { error: 'Esa mascota no existe.' as const }
  if (pet.ownerId !== user.id && user.role !== 'ADMIN') {
    return { error: 'Solo el dueño puede hacer esto.' as const }
  }
  return { error: null }
}

/* ─────────────── Publicar una mascota (máx. 5 por dueño) ─────────────── */

export async function crearMascota(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, error } = await requerido()
  if (error || !user) return { error: error ?? 'Sin permisos.' }

  const nombre = txt(formData, 'nombre')
  if (!nombre) return { error: 'Poné el nombre de la mascota.' }

  const species = especieValida(formData)
  if (!species) return { error: 'Elegí la especie.' }

  const cantidad = await prisma.pet.count({ where: { ownerId: user.id } })
  if (cantidad >= MAX_MASCOTAS) {
    return { error: `Podés tener hasta ${MAX_MASCOTAS} mascotas. Borrá alguna para agregar otra.` }
  }

  let nuevoId: number
  try {
    const pet = await prisma.pet.create({
      data: {
        name: nombre,
        species,
        comments: txt(formData, 'comentarios'),
        ownerId: user.id,
      },
      select: { id: true },
    })
    nuevoId = pet.id
  } catch (e) {
    return { error: `No se pudo guardar: ${(e as Error).message}` }
  }

  refrescar(nuevoId)
  redirect(`/dashboard?alta=${nuevoId}`)
}

/* ─────────────── Editar datos de una mascota ─────────────── */

export async function editarMascota(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, error } = await requerido()
  if (error || !user) return { error: error ?? 'Sin permisos.' }

  const id = entero(formData, 'id')
  if (!id) return { error: 'Falta la mascota.' }

  const check = await mascotaPropia(id, user)
  if (check.error) return { error: check.error }

  const nombre = txt(formData, 'nombre')
  if (!nombre) return { error: 'Poné el nombre de la mascota.' }

  const species = especieValida(formData)
  if (!species) return { error: 'Elegí la especie.' }

  await prisma.pet.update({
    where: { id },
    data: { name: nombre, species, comments: txt(formData, 'comentarios') },
  })

  refrescar(id)
  return { ok: true, mensaje: 'Datos guardados.' }
}

/* ─────────────── Marcar como perdida ─────────────── */

export async function marcarPerdida(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, error } = await requerido()
  if (error || !user) return { error: error ?? 'Sin permisos.' }

  const id = entero(formData, 'id')
  if (!id) return { error: 'Falta la mascota.' }

  const check = await mascotaPropia(id, user)
  if (check.error) return { error: check.error }

  const comentario = txt(formData, 'lostComment')
  if (!comentario) {
    return { error: 'Escribí un comentario de cómo contactarte: es lo que va a ver quien la encuentre.' }
  }

  await prisma.pet.update({
    where: { id },
    data: { isLost: true, lostAt: new Date(), lostComment: comentario, foundAt: null },
  })

  refrescar(id)
  return { ok: true, mensaje: 'La mascota quedó publicada en el listado de perdidas.' }
}

/* ─────────────── Marcar como encontrada (sale del listado) ─────────────── */

export async function marcarEncontrada(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, error } = await requerido()
  if (error || !user) return { error: error ?? 'Sin permisos.' }

  const id = entero(formData, 'id')
  if (!id) return { error: 'Falta la mascota.' }

  const check = await mascotaPropia(id, user)
  if (check.error) return { error: check.error }

  await prisma.pet.update({
    where: { id },
    data: { isLost: false, foundAt: new Date() },
  })

  refrescar(id)
  return { ok: true, mensaje: '¡Qué alegría! La sacamos del listado de perdidas.' }
}

/* ─────────────── Borrar una mascota ─────────────── */

export async function borrarMascota(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, error } = await requerido()
  if (error || !user) return { error: error ?? 'Sin permisos.' }

  const id = entero(formData, 'id')
  if (!id) return { error: 'Falta la mascota.' }

  const check = await mascotaPropia(id, user)
  if (check.error) return { error: check.error }

  await prisma.pet.delete({ where: { id } })
  refrescar()
  return { ok: true, mensaje: 'Mascota borrada.' }
}

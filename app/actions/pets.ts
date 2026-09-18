'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MAX_MASCOTAS, ESPECIES, type ActionState } from '@/lib/constantes'

const ESPECIES_VALIDAS = ESPECIES
type Especie = (typeof ESPECIES)[number]

async function usuarioActual() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
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

/* ─────────────── Publicar una mascota (máx. 5 por dueño) ─────────────── */

export async function crearMascota(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' }

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
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' }

  const id = entero(formData, 'id')
  if (!id) return { error: 'Falta la mascota.' }

  const pet = await prisma.pet.findUnique({ where: { id }, select: { ownerId: true } })
  if (!pet) return { error: 'Esa mascota no existe.' }
  if (pet.ownerId !== user.id && user.role !== 'ADMIN') {
    return { error: 'Solo el dueño (o un administrador) puede editarla.' }
  }

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
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' }

  const id = entero(formData, 'id')
  if (!id) return { error: 'Falta la mascota.' }

  const pet = await prisma.pet.findUnique({ where: { id }, select: { ownerId: true } })
  if (!pet) return { error: 'Esa mascota no existe.' }
  if (pet.ownerId !== user.id && user.role !== 'ADMIN') {
    return { error: 'Solo el dueño puede marcar esta mascota como perdida.' }
  }

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
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' }

  const id = entero(formData, 'id')
  if (!id) return { error: 'Falta la mascota.' }

  const pet = await prisma.pet.findUnique({ where: { id }, select: { ownerId: true } })
  if (!pet) return { error: 'Esa mascota no existe.' }
  if (pet.ownerId !== user.id && user.role !== 'ADMIN') {
    return { error: 'Solo el dueño puede marcarla como encontrada.' }
  }

  await prisma.pet.update({
    where: { id },
    data: { isLost: false, foundAt: new Date() },
  })

  refrescar(id)
  return { ok: true, mensaje: '¡Qué alegría! La sacamos del listado de perdidas.' }
}

/* ─────────────── Borrar una mascota ─────────────── */

export async function borrarMascota(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' }

  const id = entero(formData, 'id')
  if (!id) return { error: 'Falta la mascota.' }

  const pet = await prisma.pet.findUnique({ where: { id }, select: { ownerId: true } })
  if (!pet) return { error: 'Esa mascota no existe.' }
  if (pet.ownerId !== user.id && user.role !== 'ADMIN') {
    return { error: 'Solo el dueño (o un administrador) puede borrarla.' }
  }

  await prisma.pet.delete({ where: { id } })
  refrescar()
  return { ok: true, mensaje: 'Mascota borrada.' }
}

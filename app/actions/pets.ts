'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type ActionState = { error?: string; ok?: boolean }

const ESPECIES = ['PERRO', 'GATO', 'OTRO'] as const
const SEXOS = ['MACHO', 'HEMBRA', 'DESCONOCIDO'] as const
const TAMANOS = ['CHICO', 'MEDIANO', 'GRANDE'] as const
const ESTADOS = [
  'PERDIDA',
  'AVISTADA',
  'ENCONTRADA',
  'REUNIDA',
  'EN_ADOPCION',
  'ARCHIVADA',
] as const

async function usuarioActual() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

function txt(fd: FormData, k: string) {
  const v = fd.get(k)
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length ? s : null
}

function num(fd: FormData, k: string) {
  const s = txt(fd, k)
  if (!s) return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function entero(fd: FormData, k: string) {
  const s = txt(fd, k)
  if (!s) return null
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(n) ? n : null
}

function fecha(fd: FormData, k: string) {
  const s = txt(fd, k)
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

function enumDe<T extends string>(
  fd: FormData,
  k: string,
  permitidos: readonly T[],
  def?: T,
): T | null {
  const s = txt(fd, k)
  if (!s) return def ?? null
  return (permitidos as readonly string[]).includes(s) ? (s as T) : null
}

/* ─────────────── Publicar mascota ─────────────── */

export async function crearMascota(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión para publicar.' }

  const nombre = txt(formData, 'nombre')
  if (!nombre) return { error: 'Poné el nombre de la mascota (o cómo la llamás).' }

  const species = enumDe(formData, 'especie', ESPECIES)
  if (!species) return { error: 'Elegí la especie.' }

  const fotos = (txt(formData, 'fotos') ?? '')
    .split(/\s*\n\s*/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s))
    .slice(0, 6)

  let petId: string
  try {
    const pet = await prisma.pet.create({
      data: {
        name: nombre,
        species,
        breed: txt(formData, 'raza'),
        sex: enumDe(formData, 'sexo', SEXOS, 'DESCONOCIDO') ?? 'DESCONOCIDO',
        size: enumDe(formData, 'tamano', TAMANOS),
        color: txt(formData, 'color'),
        ageMonths: entero(formData, 'edad_meses'),
        description: txt(formData, 'descripcion'),
        hasChip: txt(formData, 'tiene_chip') === 'si',
        chipNumber: txt(formData, 'numero_chip'),
        sterilized: txt(formData, 'castrado') === 'si',
        status: enumDe(formData, 'estado', ESTADOS, 'PERDIDA') ?? 'PERDIDA',
        lastSeenAt: fecha(formData, 'visto_el'),
        address: txt(formData, 'direccion'),
        city: txt(formData, 'ciudad'),
        department: txt(formData, 'departamento'),
        lat: num(formData, 'lat'),
        lng: num(formData, 'lng'),
        contactPhone: txt(formData, 'telefono'),
        contactEmail: txt(formData, 'email_contacto') ?? user.email,
        contactWhatsapp: txt(formData, 'whatsapp'),
        reward: txt(formData, 'recompensa'),
        ownerId: user.id,
        photos: {
          create: fotos.map((url, i) => ({ url, isMain: i === 0, sortOrder: i })),
        },
      },
      select: { id: true },
    })
    petId = pet.id
  } catch (e) {
    return { error: `No se pudo publicar: ${(e as Error).message}` }
  }

  revalidatePath('/mascotas')
  revalidatePath('/dashboard')
  redirect(`/mascotas/${petId}`)
}

/* ─────────────── Avistamiento ─────────────── */

export async function agregarAvistamiento(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const petId = txt(formData, 'petId')
  if (!petId) return { error: 'Falta la mascota.' }

  const descripcion = txt(formData, 'descripcion')
  if (!descripcion) return { error: 'Contanos qué viste.' }

  const user = await usuarioActual()
  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { id: true } })
  if (!pet) return { error: 'Esa mascota ya no está publicada.' }

  try {
    await prisma.sighting.create({
      data: {
        petId,
        reporterId: user?.id ?? null,
        reporterName: txt(formData, 'nombre'),
        reporterPhone: txt(formData, 'telefono'),
        description: descripcion,
        photoUrl: txt(formData, 'foto'),
        seenAt: fecha(formData, 'visto_el') ?? new Date(),
        address: txt(formData, 'direccion'),
        city: txt(formData, 'ciudad'),
        department: txt(formData, 'departamento'),
      },
    })
  } catch (e) {
    return { error: `No se pudo guardar: ${(e as Error).message}` }
  }

  revalidatePath(`/mascotas/${petId}`)
  return { ok: true }
}

/* ─────────────── Cambiar estado ─────────────── */

export async function cambiarEstado(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' }

  const petId = txt(formData, 'petId')
  const nuevo = enumDe(formData, 'estado', ESTADOS)
  if (!petId || !nuevo) return { error: 'Datos incompletos.' }

  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { ownerId: true } })
  if (!pet) return { error: 'No existe esa publicación.' }
  if (pet.ownerId !== user.id) return { error: 'Solo el dueño puede cambiar el estado.' }

  await prisma.pet.update({
    where: { id: petId },
    data: {
      status: nuevo,
      resolvedAt: nuevo === 'REUNIDA' || nuevo === 'ENCONTRADA' ? new Date() : null,
    },
  })

  revalidatePath(`/mascotas/${petId}`)
  revalidatePath('/dashboard')
  return { ok: true }
}

/* ─────────────── Borrar publicación ─────────────── */

export async function borrarMascota(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await usuarioActual()
  if (!user) return { error: 'Necesitás iniciar sesión.' }

  const petId = txt(formData, 'petId')
  if (!petId) return { error: 'Datos incompletos.' }

  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { ownerId: true } })
  if (!pet) return { error: 'No existe esa publicación.' }
  if (pet.ownerId !== user.id) return { error: 'Solo el dueño puede borrarla.' }

  await prisma.pet.delete({ where: { id: petId } })

  revalidatePath('/mascotas')
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

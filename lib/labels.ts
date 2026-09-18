// Etiquetas y helpers de formato.

export const ESPECIE_LABEL: Record<string, string> = {
  PERRO: 'Perro',
  GATO: 'Gato',
  OTRO: 'Otro',
}

export const ESPECIE_EMOJI: Record<string, string> = {
  PERRO: '🐕',
  GATO: '🐈',
  OTRO: '🐾',
}

export const ROL_LABEL: Record<string, string> = {
  DUENO: 'Dueño',
  ADMIN: 'Administrador',
}

export function fmtFecha(d: Date | string | null | undefined) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function fmtFechaHora(d: Date | string | null | undefined) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function tiempoRelativo(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  const seg = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seg < 3600) return `hace ${Math.max(1, Math.floor(seg / 60))} min`
  if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`
  const dias = Math.floor(seg / 86400)
  if (dias === 1) return 'ayer'
  if (dias < 30) return `hace ${dias} días`
  return fmtFecha(date)
}

export function soloDigitos(tel: string) {
  return tel.replace(/[^0-9]/g, '')
}

export function linkWhatsapp(tel: string, texto = '') {
  const num = soloDigitos(tel)
  const conPais = num.startsWith('598') ? num : `598${num.replace(/^0/, '')}`
  const q = texto ? `?text=${encodeURIComponent(texto)}` : ''
  return `https://wa.me/${conPais}${q}`
}

/// Código legible para mostrar el ID: M-000123
export function idMascota(id: number) {
  return `M-${String(id).padStart(6, '0')}`
}

export function nombreCompleto(u: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
}) {
  const armado = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
  return armado || u.name || '—'
}

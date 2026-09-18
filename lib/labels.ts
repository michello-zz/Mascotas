// Etiquetas legibles para los enums del schema.

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

export const SEXO_LABEL: Record<string, string> = {
  MACHO: 'Macho',
  HEMBRA: 'Hembra',
  DESCONOCIDO: 'No sé',
}

export const TAMANO_LABEL: Record<string, string> = {
  CHICO: 'Chico',
  MEDIANO: 'Mediano',
  GRANDE: 'Grande',
}

export const ESTADO_LABEL: Record<string, string> = {
  PERDIDA: 'Perdida',
  AVISTADA: 'Avistada',
  ENCONTRADA: 'Encontrada',
  REUNIDA: '¡Reunida con su familia!',
  EN_ADOPCION: 'En adopción',
  ARCHIVADA: 'Archivada',
}

export const ESTADO_ABIERTOS = ['PERDIDA', 'AVISTADA', 'ENCONTRADA'] as const

export const ESTADO_COLOR: Record<string, string> = {
  PERDIDA: 'bg-red-100 text-red-800',
  AVISTADA: 'bg-amber-100 text-amber-800',
  ENCONTRADA: 'bg-blue-100 text-blue-800',
  REUNIDA: 'bg-green-100 text-green-800',
  EN_ADOPCION: 'bg-purple-100 text-purple-800',
  ARCHIVADA: 'bg-stone-200 text-stone-700',
}

export function fmtFecha(d: Date | string | null | undefined) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })
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

export function edadLegible(meses: number | null | undefined) {
  if (!meses) return null
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const anios = Math.floor(meses / 12)
  const resto = meses % 12
  return resto ? `${anios} ${anios === 1 ? 'año' : 'años'} y ${resto} meses` : `${anios} años`
}

export function soloDigitos(tel: string) {
  return tel.replace(/[^0-9]/g, '')
}

export function linkWhatsapp(tel: string, texto: string) {
  const num = soloDigitos(tel)
  const conPais = num.startsWith('598') ? num : `598${num.replace(/^0/, '')}`
  return `https://wa.me/${conPais}?text=${encodeURIComponent(texto)}`
}

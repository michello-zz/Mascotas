// Constantes y tipos compartidos.
// OJO: no pueden vivir en un archivo 'use server' (ahí solo se exportan funciones async).

export const MAX_MASCOTAS = 5

export type ActionState = { error?: string; ok?: boolean; mensaje?: string }

export const ESPECIES = ['PERRO', 'GATO', 'OTRO'] as const
export const ROLES = ['DUENO', 'ADMIN'] as const

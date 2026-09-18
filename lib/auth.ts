import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

// Emails que se crean automáticamente como ADMIN y ya aprobados (separados por coma).
function adminsConfigurados() {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export const auth = betterAuth({
  appName: 'Mascotas',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Datos extra del dueño (los que pide la lógica del sitio)
  user: {
    additionalFields: {
      firstName: { type: 'string', required: false },
      lastName: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      comments: { type: 'string', required: false },
      // El rol y la aprobación los define el sistema, nunca el formulario.
      role: { type: 'string', required: false, defaultValue: 'DUENO', input: false },
      approved: { type: 'boolean', required: false, defaultValue: false, input: false },
      approvedAt: { type: 'date', required: false, input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = String(user.email ?? '').toLowerCase()
          const esAdmin = adminsConfigurados().includes(email)
          return {
            data: {
              ...user,
              role: esAdmin ? 'ADMIN' : 'DUENO',
              // El administrador entra directo; los dueños quedan pendientes de aprobación.
              approved: esAdmin,
              approvedAt: esAdmin ? new Date() : null,
            },
          }
        },
      },
    },
  },
})

export type RolUsuario = 'DUENO' | 'ADMIN'

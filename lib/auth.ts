import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

// Emails que se crean automáticamente como ADMIN (separados por coma).
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
      // El rol NO se puede mandar desde el formulario: lo define el sistema.
      role: { type: 'string', required: false, defaultValue: 'DUENO', input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const admins = adminsConfigurados()
          const email = String(user.email ?? '').toLowerCase()
          const esAdmin = admins.includes(email)
          return {
            data: {
              ...user,
              role: esAdmin ? 'ADMIN' : 'DUENO',
            },
          }
        },
      },
    },
  },
})

export type RolUsuario = 'DUENO' | 'ADMIN'

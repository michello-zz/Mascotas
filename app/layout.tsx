import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import './globals.css'
import { auth } from '@/lib/auth'
import { SignOutButton } from '@/components/SignOutButton'

export const metadata: Metadata = {
  title: 'Busca Mascotas — búsqueda de mascotas perdidas',
  description:
    'Sitio para gestionar la búsqueda de mascotas perdidas. Cada mascota tiene un ID y un código QR que lleva a los datos de su dueño.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  const u = session?.user as unknown as { role?: string; approved?: boolean } | undefined
  const esAdmin = u?.role === 'ADMIN'
  const pendiente = !!u && !u.approved && !esAdmin

  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-teal-800">
              <span aria-hidden>🐾</span> Busca Mascotas
            </Link>

            <nav className="flex flex-wrap items-center gap-3 text-sm">
              <Link href="/mascotas" className="text-stone-600 hover:text-teal-700">
                Perdidas
              </Link>

              {session ? (
                <>
                  {pendiente ? (
                    <Link
                      href="/pendiente"
                      className="rounded-lg bg-amber-500 px-3 py-2 font-semibold text-white hover:bg-amber-600"
                    >
                      Pendiente de aprobación
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="rounded-lg bg-teal-700 px-3 py-2 font-semibold text-white hover:bg-teal-800"
                    >
                      Mi panel
                    </Link>
                  )}
                  {esAdmin && (
                    <Link
                      href="/admin"
                      className="rounded-lg border border-teal-700 px-3 py-2 font-semibold text-teal-800 hover:bg-teal-50"
                    >
                      Admin
                    </Link>
                  )}
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/login?next=/dashboard"
                    className="rounded-lg bg-teal-700 px-3 py-2 font-semibold text-white hover:bg-teal-800"
                  >
                    Ingresar
                  </Link>
                  <Link href="/login?modo=registro" className="text-stone-600 hover:text-teal-700">
                    Crear cuenta
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-16 border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
          Busca Mascotas · gestión de búsqueda de mascotas perdidas 🇺🇾        </footer>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import './globals.css'
import { auth } from '@/lib/auth'
import { SignOutButton } from '@/components/SignOutButton'

export const metadata: Metadata = {
  title: 'Mascotas — búsqueda de mascotas perdidas',
  description:
    'Publicá tu mascota perdida, reportá avistamientos y ayudá a que vuelvan a casa. Uruguay.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)

  return (
    <html lang="es">
      <body className="min-h-screen">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-teal-800">
              <span aria-hidden>🐾</span> Mascotas
            </Link>

            <nav className="flex items-center gap-3 text-sm">
              <Link href="/mascotas" className="text-stone-600 hover:text-teal-700">
                Buscar
              </Link>
              {session ? (
                <>
                  <Link
                    href="/mascotas/nueva"
                    className="rounded-lg bg-teal-700 px-3 py-2 font-semibold text-white hover:bg-teal-800"
                  >
                    Publicar
                  </Link>
                  <Link href="/dashboard" className="text-stone-600 hover:text-teal-700">
                    Mi panel
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/mascotas/nueva"
                    className="rounded-lg bg-teal-700 px-3 py-2 font-semibold text-white hover:bg-teal-800"
                  >
                    Publicar
                  </Link>
                  <Link href="/login" className="text-stone-600 hover:text-teal-700">
                    Ingresar
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {children}

        <footer className="mt-16 border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
          Mascotas · hecho en Uruguay 🇺🇾
        </footer>
      </body>
    </html>
  )
}

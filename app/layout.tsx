import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'nuevo-sitio',
  description: 'Sitio Next.js + Prisma + PostgreSQL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

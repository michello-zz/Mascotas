import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Devuelve el PNG del QR de la mascota. El QR apunta a su ficha pública.
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  const num = parseInt(id.replace(/[^0-9]/g, ''), 10)
  if (!Number.isFinite(num)) return new NextResponse('ID inválido', { status: 400 })

  const pet = await prisma.pet.findUnique({ where: { id: num }, select: { id: true, name: true } })
  if (!pet) return new NextResponse('No existe esa mascota', { status: 404 })

  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const base = process.env.BETTER_AUTH_URL?.replace(/\/$/, '') || `${proto}://${host}`
  const url = `${base}/mascotas/${pet.id}`

  const png = await QRCode.toBuffer(url, {
    type: 'png',
    width: 600,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

  const descargar = new URL(req.url).searchParams.get('descargar')
  const nombre = `qr-${pet.id}-${pet.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.png`

  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
      ...(descargar ? { 'Content-Disposition': `attachment; filename="${nombre}"` } : {}),
    },
  })
}

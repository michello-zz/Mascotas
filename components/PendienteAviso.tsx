'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'

export function PendienteAviso({ email }: { email: string }) {
  const router = useRouter()

  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <div className="text-5xl">⏳</div>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Tu cuenta está pendiente de aprobación</h1>
      <p className="mt-3 text-stone-600">
        Recibimos tu solicitud con el correo <b>{email}</b>. El administrador tiene que aceptarla
        antes de que puedas cargar tus mascotas.
      </p>
      <p className="mt-3 text-sm text-stone-500">
        Cuando te aprueben, entrá de nuevo y vas a poder registrar hasta 5 mascotas, reportar las
        que se pierdan y descargar sus códigos QR.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            router.refresh()
          }}
        >
          Ya me aprobaron, volver a chequear
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={async () => {
            await signOut()
            window.location.href = '/'
          }}
        >
          Salir
        </button>
      </div>
    </div>
  )
}

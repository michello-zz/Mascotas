'use client'

import { signOut } from '@/lib/auth-client'

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut()
        window.location.href = '/'
      }}
      className="text-stone-500 hover:text-red-600"
    >
      Salir
    </button>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const is2FAValidated = localStorage.getItem('2fa_validated') === 'true'

    if (!token) {
      router.replace('/login')
    } else if (!is2FAValidated) {
      router.replace('/double-auth')
    }
  }, [router])
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function useRedirectIfAuthenticated() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const is2FAValidated = localStorage.getItem('2fa_validated') === 'true'

    if (token && is2FAValidated) {
      router.replace('/home')
    }
  }, [router])
}

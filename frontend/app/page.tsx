'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const twoFA = localStorage.getItem('2fa_validated')

    if (!token) {
      router.replace('/login')
    } else if (!twoFA) {
      router.replace('/double-auth')
    } else {
      router.replace('/home')
    }
  }, [router])

  return null
}

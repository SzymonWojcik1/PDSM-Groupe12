'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function useAdminGuard(): boolean {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const validated = localStorage.getItem('2fa_validated') === 'true'
    const role = localStorage.getItem('role')

    if (!token) {
      router.replace('/login')
    } else if (!validated) {
      router.replace('/double-auth')
    } else if (role !== 'siege') {
      router.replace('/')
    } else {
      setChecked(true)
    }
  }, [router])

  return checked
}

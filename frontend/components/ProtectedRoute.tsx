'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const twoFA = localStorage.getItem('2fa_validated')

    if (!token || twoFA !== 'true') {
      router.replace('/login')
    } else {
      setChecking(false)
    }
  }, [router])

  if (checking) {
    return <div className="p-6 text-gray-700">Vérification de la session...</div>
  }

  return <>{children}</>
}

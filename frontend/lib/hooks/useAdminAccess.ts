// /lib/hooks/useAdminAccess.ts
import { useState, useEffect } from 'react'

export default function useAdminAccess(): boolean | null {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('role')
    setIsAdmin(role === 'siege')
  }, [])

  return isAdmin
}

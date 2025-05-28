'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Custom Hook: useAdminGuard
 * 
 * This hook protects admin-only routes by checking:
 * 1. If the user has a valid authentication token
 * 2. If the user has completed 2FA validation
 * 3. If the user has the 'siege' (admin/headquarters) role
 * 
 * Protection logic:
 * - No token: Redirects to login page
 * - Token but no 2FA: Redirects to 2FA page
 * - Token and 2FA but not 'siege' role: Redirects to home page
 * - All checks pass: Allows access to the protected route
 * 
 * Usage:
 * - Place in components or pages that require admin access
 * - Returns a boolean indicating if the user is allowed (true) or still being checked (false)
 * 
 * @returns {boolean} Whether the user is allowed to access the admin route
 */
export default function useAdminGuard(): boolean {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Retrieve authentication and role information from localStorage
    const token = localStorage.getItem('token')
    const validated = localStorage.getItem('2fa_validated') === 'true'
    const role = localStorage.getItem('role')

    // Redirect to login if not authenticated
    if (!token) {
      router.replace('/login')
    // Redirect to 2FA if not validated
    } else if (!validated) {
      router.replace('/double-auth')
    // Redirect to home if not admin ('siege' role)
    } else if (role !== 'siege') {
      router.replace('/')
    // All checks passed, allow access
    } else {
      setChecked(true)
    }
  }, [router])

  // Return true if user is allowed, false while checking or redirecting
  return checked
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Custom Hook: useAuthGuard
 * 
 * This hook provides authentication protection for routes by checking:
 * 1. If the user has a valid authentication token
 * 2. If the user has completed 2FA validation
 * 
 * Protection logic:
 * - No token: Redirects to login page
 * - Token but no 2FA: Redirects to 2FA page
 * - Both valid: Allows access to protected route
 * 
 * Usage:
 * - Place in components that require authentication
 * - Typically used in protected pages/routes
 * - Works in conjunction with useRedirectIfAuthenticated
 * 
 * @returns void
 */
export default function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    // Check for authentication token in localStorage
    const token = localStorage.getItem('token')
    // Verify 2FA validation status
    const is2FAValidated = localStorage.getItem('2fa_validated') === 'true'

    // Redirect to login if no token is present
    if (!token) {
      router.replace('/login')
    } 
    // Redirect to 2FA page if token exists but 2FA is not validated
    else if (!is2FAValidated) {
      router.replace('/double-auth')
    }
  }, [router])
}

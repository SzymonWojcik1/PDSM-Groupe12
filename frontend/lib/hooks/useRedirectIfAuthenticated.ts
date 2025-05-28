'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Custom Hook: useRedirectIfAuthenticated
 * 
 * This hook checks if a user is authenticated and has completed 2FA validation.
 * If both conditions are met, it redirects the user to the home page.
 * 
 * Authentication check:
 * - Verifies presence of authentication token
 * - Confirms 2FA validation status
 * 
 * Usage:
 * - Place in components that should redirect authenticated users
 * - Typically used in login or registration pages
 * 
 * @returns void
 */
export default function useRedirectIfAuthenticated() {
  const router = useRouter()

  useEffect(() => {
    // Check for authentication token in localStorage
    const token = localStorage.getItem('token')
    // Verify 2FA validation status
    const is2FAValidated = localStorage.getItem('2fa_validated') === 'true'

    // Redirect to home page if user is fully authenticated
    if (token && is2FAValidated) {
      router.replace('/home')
    }
  }, [router])
}

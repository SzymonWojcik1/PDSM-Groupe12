'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Root Page Component
 * 
 * This component serves as the application's entry point and handles initial routing
 * based on the user's authentication status. It performs the following checks:
 * 
 * Authentication Flow:
 * 1. Checks for authentication token
 * 2. Verifies 2FA validation status
 * 3. Redirects to appropriate page based on auth state
 * 
 * Routing Logic:
 * - No token: Redirects to login page
 * - Token but no 2FA: Redirects to 2FA validation page
 * - Both token and 2FA: Redirects to home page
 * 
 * Note: This component doesn't render any UI as it's purely for routing logic
 */
export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Get authentication data from localStorage
    const token = localStorage.getItem('token')
    const twoFA = localStorage.getItem('2fa_validated')

    // Handle routing based on authentication status
    if (!token) {
      // Redirect to login if no token is present
      router.replace('/login')
    } else if (!twoFA) {
      // Redirect to 2FA if token exists but 2FA is not validated
      router.replace('/double-auth')
    } else {
      // Redirect to home if fully authenticated
      router.replace('/home')
    }
  }, [router])

  // Component doesn't render anything as it's only for routing
  return null
}

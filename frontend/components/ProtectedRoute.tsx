'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Protected Route Component
 * 
 * This component acts as a wrapper to protect routes that require authentication.
 * It checks for the presence of a valid token and 2FA validation before rendering
 * the protected content.
 * 
 * @param children - The child components to be rendered if authentication is valid
 * @returns The protected content or a loading message
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Router for navigation
  const router = useRouter()
  
  // State to track authentication check status
  const [checking, setChecking] = useState(true)

  // Check authentication status on component mount
  useEffect(() => {
    // Get authentication data from localStorage
    const token = localStorage.getItem('token')
    const twoFA = localStorage.getItem('2fa_validated')

    // Redirect to login if authentication is invalid
    if (!token || twoFA !== 'true') {
      router.replace('/login')
    } else {
      setChecking(false)
    }
  }, [router])

  // Show loading message while checking authentication
  if (checking) {
    return <div className="p-6 text-gray-700">Checking session...</div>
  }

  // Render protected content if authentication is valid
  return <>{children}</>
}

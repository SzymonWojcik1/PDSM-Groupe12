// /lib/hooks/useAdminAccess.ts
import { useState, useEffect } from 'react'

/**
 * Custom Hook: useAdminAccess
 * 
 * This hook checks if the current user has administrative privileges.
 * It verifies if the user's role is 'siege' (headquarters/admin role).
 * 
 * Features:
 * - Simple role-based access check
 * - State management for admin status
 * - Initial null state while checking
 * 
 * Usage:
 * - Use in components that need to conditionally render admin features
 * - Returns null during initial check
 * - Returns true if user is admin, false if not
 * 
 * @returns {boolean | null} Admin status: true for admin, false for non-admin, null while checking
 */
export default function useAdminAccess(): boolean | null {
  // State to track admin status, initially null while checking
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('role')
    // Set admin status based on role check
    setIsAdmin(role === 'siege')
  }, [])

  return isAdmin
}

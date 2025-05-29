'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '@/lib/i18n'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import useRedirectIfAuthenticated from '@/lib/hooks/useRedirectIfAuthenticated'

/**
 * Two-Factor Authentication Page Component
 *
 * This page handles the second step of the authentication process.
 * Features include:
 * - 2FA code verification
 * - Token management
 * - Error handling
 * - Loading states
 * - Language switching
 * - Automatic redirection if no token exists
 */
export default function VerifyPage() {
  // Redirect if user is already authenticated
  useRedirectIfAuthenticated()

  // Internationalization setup
  const { t, i18n } = useTranslation('common', { useSuspense: false })
  const router = useRouter()

  // Form state management
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting and token validation
  useEffect(() => {
    setMounted(true)
    const token = sessionStorage.getItem('temp_token')
    if (!token) {
      router.replace('/login')
    }
  }, [router])

  /**
   * Handles the 2FA code verification
   * Verifies the code with the API and manages the authentication flow
   * Stores the token permanently after successful verification
   */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Check if temporary token exists
    const token = sessionStorage.getItem('temp_token')
    if (!token) {
      setError(t('2fa_error_no_token'))
      setLoading(false)
      router.replace('/login')
      return
    }

    try {
      // Send verification request to API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || t('2fa_error_invalid_code'))
      }

      // Store authentication data after successful verification
      localStorage.setItem('token', token)
      localStorage.setItem('2fa_validated', 'true')
      localStorage.setItem('role', data.user.role)
      sessionStorage.removeItem('temp_token')

      // Redirect to home page
      router.push('/home')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  // Prevent hydration issues
  if (!mounted || !i18n.isInitialized) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* Language switcher component */}
      <div className="absolute top-4 right-4 w-40">
        <LanguageSwitcher />
      </div>

      {/* Main form container */}
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        {/* Page title */}
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          {t('2fa_title')}
        </h2>

        {/* Description text */}
        <p className="text-sm text-gray-600 text-center">
          {t('2fa_description')}
        </p>

        {/* 2FA verification form */}
        <form onSubmit={handleVerify} className="space-y-4">
          {/* Code input field */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              {t('2fa_code_label')}
            </label>
            <input
              type="text"
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
            />
          </div>

          {/* Error message display */}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? t('2fa_verifying') : t('2fa_button')}
          </button>
        </form>
      </div>
    </div>
  )
}

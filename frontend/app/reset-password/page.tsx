'use client'

import '@/lib/i18n'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'

/**
 * Interface for API error responses
 * Can contain either a general message or specific field errors
 */
interface ErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Reset Password Page Component
 * 
 * This page handles the password reset process after a user clicks the reset link from their email.
 * It validates the reset token and email from URL parameters and allows users to set a new password.
 */
export default function ResetPasswordPage() {
  // Router and URL parameters
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token')
  const email = params.get('email')

  // Internationalization setup
  const { t, i18n } = useTranslation('common', { useSuspense: false })
  const [mounted, setMounted] = useState(false)

  // Form state management
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Validate reset link parameters
  useEffect(() => {
    if (!token || !email) {
      setError(t('reset_invalid_link'))
    }
  }, [token, email, t])

  // Prevent hydration issues
  if (!mounted || !i18n.isInitialized) return null

  /**
   * Handles the password reset form submission
   * Sends the new password to the API and handles the response
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      // Send reset request to API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      const data: ErrorResponse = await res.json()

      if (!res.ok) {
        // Extract first error message from response
        const firstError =
          data.message ||
          (data.errors && Object.values(data.errors)[0]?.[0]) ||
          t('reset_unknown_error')

        throw new Error(firstError)
      }

      // Show success message and redirect to login
      setMessage(t('reset_success'))
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* Language switcher component */}
      <div className="absolute top-4 right-4 w-40">
        <LanguageSwitcher />
      </div>

      {/* Main form container */}
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          {t('reset_title')}
        </h2>

        {/* Password reset form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New password input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('reset_new_password')}
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Password confirmation input */}
          <div>
            <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700">
              {t('reset_confirm_password')}
            </label>
            <input
              type="password"
              id="passwordConfirmation"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Error and success messages */}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? t('reset_sending') : t('reset_button')}
          </button>
        </form>
      </div>
    </div>
  )
}

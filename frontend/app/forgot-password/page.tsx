'use client'

import '@/lib/i18n'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'

/**
 * Forgot Password Page Component
 *
 * This page allows users to request a password reset link.
 * Features include:
 * - Email input form
 * - Error handling
 * - Success messages
 * - Loading states
 * - Language switching
 * - Responsive design
 */
export default function ForgotPasswordPage() {
  // Internationalization setup
  const { t, i18n } = useTranslation('common', { useSuspense: false })
  const [mounted, setMounted] = useState(false)

  // Form state management
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration issues
  if (!mounted || !i18n.isInitialized) return null

  /**
   * Handles the password reset request form submission
   * Sends the email to the API and manages the response
   * Shows success message if email is sent successfully
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Send password reset request to API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/password/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.errors?.email?.[0] || t('forgot_error_unknown'))
      }

      // Show success message
      setMessage(t('forgot_success'))
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
          {t('forgot_title')}
        </h2>

        {/* Description text */}
        <p className="text-sm text-gray-600 text-center">
          {t('forgot_description')}
        </p>

        {/* Password reset form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
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
            {loading ? t('forgot_sending') : t('forgot_button')}
          </button>
        </form>
      </div>
    </div>
  )
}

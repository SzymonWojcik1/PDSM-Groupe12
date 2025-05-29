'use client'
import '@/lib/i18n'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import useRedirectIfAuthenticated from '@/lib/hooks/useRedirectIfAuthenticated'

/**
 * Login Page Component
 *
 * This page handles user authentication with email and password.
 * It includes:
 * - Email and password form
 * - Error handling
 * - Loading states
 * - Language switching
 * - Redirect to 2FA if login successful
 * - Redirect to forgot password page
 */
export default function LoginPage() {
  // Redirect if user is already authenticated
  useRedirectIfAuthenticated()

  // Router for navigation
  const router = useRouter()

  // Form state management
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Internationalization setup
  const { t, i18n } = useTranslation('common', { useSuspense: false })
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration issues
  if (!mounted || !i18n.isInitialized) return null

  /**
   * Handles the login form submission
   * Sends credentials to API and manages the authentication flow
   * Redirects to 2FA page on successful login
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Send login request to API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.errors?.email?.[0] || t('login_error_unknown'))
      }

      // Store token temporarily for 2FA process
      sessionStorage.setItem('temp_token', data.token)

      // Redirect to 2FA page
      router.push('/double-auth')
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
        <h2 className="text-2xl font-semibold text-center text-gray-800">{t('login_title')}</h2>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 text-black"
            />
          </div>

          {/* Password input field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? t('logging_in') : t('login_button')}
          </button>
        </form>

        {/* Forgot password link */}
        <div className="text-sm text-center">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            {t('forgot_password')}
          </a>
        </div>
      </div>
    </div>
  )
}

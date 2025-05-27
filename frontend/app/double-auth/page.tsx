'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '@/lib/i18n'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import useRedirectIfAuthenticated from '@/lib/hooks/useRedirectIfAuthenticated'

export default function VerifyPage() {
  useRedirectIfAuthenticated()
  const { t, i18n } = useTranslation('common', { useSuspense: false })
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = sessionStorage.getItem('temp_token')
    if (!token) {
      router.replace('/login')
    }
  }, [router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const token = sessionStorage.getItem('temp_token')
    if (!token) {
      setError(t('2fa_error_no_token'))
      setLoading(false)
      router.replace('/login')
      return
    }

    try {
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

      // Stocke le token définitivement après succès de la 2FA
      localStorage.setItem('token', token)
      localStorage.setItem('2fa_validated', 'true')
      sessionStorage.removeItem('temp_token')

      router.push('/home')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !i18n.isInitialized) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="absolute top-4 right-4 w-40">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          {t('2fa_title')}
        </h2>

        <p className="text-sm text-gray-600 text-center">
          {t('2fa_description')}
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
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

          {error && <div className="text-red-600 text-sm">{error}</div>}

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

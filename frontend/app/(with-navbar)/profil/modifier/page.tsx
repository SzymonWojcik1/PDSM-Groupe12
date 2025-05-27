'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { Eye, EyeOff } from 'lucide-react'

import useAuthGuard from '@/lib/hooks/useAuthGuard'
import { useApi } from '@/lib/hooks/useApi'

type UserData = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
}

export default function ModifierProfilPage() {
  useAuthGuard()
  const router = useRouter()
  const { t } = useTranslation()
  const { callApi } = useApi()

  const [user, setUser] = useState<UserData | null>(null)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/me`)
        const data = await res.json()
        setUser(data)
        setNom(data.nom)
        setPrenom(data.prenom)
        setTelephone(data.telephone || '')
      } catch (err: any) {
        setError(err.message || t('error_fetch'))
      }
    }

    fetchUser()
  }, [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!user) return

    const payload: any = { nom, prenom, telephone }

    if (password) {
      if (password !== passwordConfirm) {
        setError(t('password_mismatch'))
        setLoading(false)
        return
      }
      payload.password = password
      payload.password_confirmation = passwordConfirm
    }

    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.message ||
          data.errors?.nom?.[0] ||
          data.errors?.prenom?.[0] ||
          data.errors?.password?.[0] ||
          t('error_fetch')
        )
      }

      router.push('/profil')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) return <div className="p-6 text-red-600">{t('error_prefix')} {error}</div>
  if (!user) return <div className="p-6">{t('loading')}</div>

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('edit_profile_title')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6 text-lg text-gray-800">
            <div>
              <label className="block font-medium mb-1">{t('label_lastname')}</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">{t('label_firstname')}</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">{t('label_phone')}</label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">{t('label_password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showPassword ? t('hide') : t('show')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">{t('label_password_confirm')}</label>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showPasswordConfirm ? t('hide') : t('show')}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#9F0F3A] text-white px-6 py-2 rounded hover:bg-[#800d30] transition"
              >
                {loading ? t('saving') : t('save')}
              </button>

              <button
                type="button"
                onClick={() => router.push('/profil')}
                className="text-gray-700 hover:underline"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

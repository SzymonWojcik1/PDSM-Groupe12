'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

type UserData = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
}

export default function ProfilPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError(t('not_authenticated'))
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error(t('error_fetch'))

        const data = await res.json()
        setUser(data)
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchUser()
  }, [t])

  if (error) return <div className="p-6 text-red-600">{t('error_prefix')} {error}</div>
  if (!user) return <div className="p-6">{t('loading')}</div>

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t('profile_title')}</h1>

      <div className="space-y-2">
        <p><strong>{t('label_lastname')} :</strong> {user.nom}</p>
        <p><strong>{t('label_firstname')} :</strong> {user.prenom}</p>
        <p><strong>{t('label_email')} :</strong> {user.email}</p>
        {user.telephone && <p><strong>{t('label_phone')} :</strong> {user.telephone}</p>}
      </div>

      <button
        onClick={() => router.push('/profil/modifier')}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {t('edit_profile_button')}
      </button>
    </div>
  )
}
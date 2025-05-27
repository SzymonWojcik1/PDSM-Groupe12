'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

import useAuthGuard from '@/lib/hooks/useAuthGuard'
import { useApi } from '@/lib/hooks/useApi'

type UserData = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  role: string
}

export default function ProfilPage() {
  useAuthGuard()
  const { callApi } = useApi()
  const { t } = useTranslation()
  const router = useRouter()

  const [user, setUser] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/me`)
        if (!res.ok) throw new Error(t('error_fetch'))
        const data = await res.json()
        setUser(data)
      } catch (err: any) {
        setError(err.message || t('error_occurred'))
      }
    }

    fetchUser()
  }, [t])

  const getTranslatedRole = (role: string) => {
    switch (role) {
      case 'siege':
        return 'Siège'
      case 'cr':
        return 'Coordinateur régional'
      case 'cn':
        return 'Coordinateur national'
      case 'partenaire':
        return 'Partenaire local'
      default:
        return role
    }
  }

  if (error) {
    return <div className="p-6 text-red-600 text-base">{t('error_prefix')} {error}</div>
  }

  if (!user) {
    return <div className="p-6 text-gray-600 text-base">{t('loading')}</div>
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-5xl font-bold text-[#9F0F3A] mb-1">{t('profile_title')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="grid md:grid-cols-2 gap-y-6 gap-x-12 text-lg text-gray-800">
            <p><span className="font-semibold">{t('label_lastname')} :</span> {user.nom}</p>
            <p><span className="font-semibold">{t('label_firstname')} :</span> {user.prenom}</p>
            <p><span className="font-semibold">{t('label_email')} :</span> {user.email}</p>
            {user.telephone && (
              <p><span className="font-semibold">{t('label_phone')} :</span> {user.telephone}</p>
            )}
            <p><span className="font-semibold">{t('label_role')} :</span> {getTranslatedRole(user.role)}</p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => router.push('/profil/modifier')}
              className="text-base text-white bg-[#9F0F3A] hover:bg-[#800d30] px-6 py-3 rounded transition"
            >
              {t('edit_profile_button')}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

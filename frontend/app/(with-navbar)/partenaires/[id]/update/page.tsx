'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { countriesByRegion } from '@/lib/countriesByRegion'
import useAuthGuard from '@/lib/hooks/useAuthGuard'
import { useApi } from '@/lib/hooks/useApi'

export default function UpdatePartenaire() {
  useAuthGuard()
  const { callApi } = useApi()
  const { t } = useTranslation()
  const { id } = useParams()
  const router = useRouter()

  const [form, setForm] = useState({
    part_nom: '',
    part_pays: '',
    part_region: '',
  })

  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires/${id}`)
        const data = await res.json()
        setForm({
          part_nom: data.part_nom || '',
          part_pays: data.part_pays || '',
          part_region: data.part_region || '',
        })
      } catch (err) {
        setErrorMessage(t('error_occurred'))
      }
    }

    fetchData()
  }, [id, t])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrorMessage('')
  }

  const handleRegionChange = (region: string) => {
    setForm(prev => ({ ...prev, part_region: region, part_pays: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.message || t('error_occurred'))
        return
      }

      router.push('/partenaires')
    } catch (err: any) {
      setErrorMessage(err.message || t('error_occurred'))
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('update_partner_title')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
            </div>
            <Link
              href="/partenaires"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              {t('back_to_list')}
            </Link>
          </div>
        </header>

        <div className="bg-white border rounded-2xl shadow-sm p-6 w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded">
                {errorMessage}
              </div>
            )}

            <input
              name="part_nom"
              placeholder={t('partner_name')}
              className="border p-2 rounded text-black"
              value={form.part_nom}
              onChange={handleChange}
              required
            />

            <select
              name="part_region"
              value={form.part_region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="border p-2 rounded text-black"
              required
            >
              <option value="">{t('select_region')}</option>
              {Object.keys(countriesByRegion).map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              name="part_pays"
              value={form.part_pays}
              onChange={handleChange}
              className="border p-2 rounded text-black"
              disabled={!form.part_region}
              required
            >
              <option value="">{t('select_country')}</option>
              {(countriesByRegion as Record<string, string[]>)[form.part_region]?.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30] transition"
            >
              {t('save_changes')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

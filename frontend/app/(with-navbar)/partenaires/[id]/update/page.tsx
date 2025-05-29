'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { countriesByRegion } from '@/lib/countriesByRegion'
import useAuthGuard from '@/lib/hooks/useAuthGuard'
import { useApi } from '@/lib/hooks/useApi'

export default function UpdatePartenaire() {
  useAuthGuard() // Block access if user is not authenticated
  const { callApi } = useApi()
  const { t } = useTranslation()
  const { id } = useParams() // Extract the ID from the URL
  const router = useRouter()

  // Form state containing the values of the partner being edited
  const [form, setForm] = useState({
    part_nom: '',
    part_pays: '',
    part_region: '',
  })

  const [errorMessage, setErrorMessage] = useState('') // State to display any error message

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the partner data from the backend
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires/${id}`)
        const data = await res.json()
        // Pre-fill the form with existing data
        setForm({
          part_nom: data.part_nom || '',
          part_pays: data.part_pays || '',
          part_region: data.part_region || '',
        })
      } catch {
        // Display a translated error message if fetch fails
        setErrorMessage(t('error_occurred'))
      }
    }

    fetchData()
  }, [id, t, callApi])

  // Handle input change for both text and select inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrorMessage('') // Reset error message on change
  }

  // Reset the selected country if region is changed
  const handleRegionChange = (region: string) => {
    setForm(prev => ({ ...prev, part_region: region, part_pays: '' }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Send a PUT request to update the partner
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        // Show error returned from the backend
        setErrorMessage(data.message || t('error_occurred'))
        return
      }

      // Redirect to the partners list if update succeeds
      router.push('/partenaires')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message || t('error_occurred'))
      } else {
        setErrorMessage(t('error_occurred'))
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with title and return link */}
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

        {/* Form to update the partner */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Error message if any */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded">
                {errorMessage}
              </div>
            )}

            {/* Partner name input */}
            <input
              name="part_nom"
              placeholder={t('partner_name')}
              className="border p-2 rounded text-black"
              value={form.part_nom}
              onChange={handleChange}
              required
            />

            {/* Region select dropdown */}
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

            {/* Country select dropdown (depends on selected region) */}
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

            {/* Submit button */}
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

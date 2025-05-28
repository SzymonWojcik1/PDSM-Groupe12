'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import useAuthGuard from '@/lib/hooks/useAuthGuard'
import { useApi } from '@/lib/hooks/useApi'
import { countriesByRegion } from '@/lib/countriesByRegion'

export default function PartenairesPage() {
  useAuthGuard() // Ensures that only authenticated users can access this page
  const { callApi } = useApi()
  const { t } = useTranslation()

  // State for the list of partners and filters
  const [partenaires, setPartenaires] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [filters, setFilters] = useState({
    nom: '',
    pays: '',
    region: '',
  })

  // Fetch all partners from the backend
  const fetchPartenaires = async () => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
      const data = await res.json()
      setPartenaires(data)
      setFiltered(data) // Initial state = all partners
    } catch (err) {
      console.error('Erreur chargement partenaires', err)
    }
  }

  // Fetch on page load
  useEffect(() => {
    fetchPartenaires()
  }, [])

  // Apply filters whenever they change
  useEffect(() => {
    let result = [...partenaires]
    if (filters.nom) {
      result = result.filter(p =>
        p.part_nom.toLowerCase().includes(filters.nom.toLowerCase())
      )
    }
    if (filters.pays) {
      result = result.filter(p => p.part_pays === filters.pays)
    }
    if (filters.region) {
      result = result.filter(p => p.part_region === filters.region)
    }
    setFiltered(result)
  }, [filters, partenaires])

  // Handle filter input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  // Update region and reset country when region changes
  const handleRegionChange = (region: string) => {
    setFilters(prev => ({ ...prev, region, pays: '' }))
  }

  // Clear all filters
  const resetFilters = () => {
    setFilters({ nom: '', pays: '', region: '' })
  }

  // Delete partner by ID
  const deletePartenaire = async (id: number) => {
    if (!confirm(t('confirm_delete'))) return
    try {
      await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires/${id}`, {
        method: 'DELETE',
      })
      await fetchPartenaires() // Refresh list after deletion
    } catch (err) {
      console.error('Erreur suppression partenaire', err)
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Page title */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">
            {t('partners_list_title')}
          </h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
          <p className="text-gray-600">{t('partners_list_description')}</p>
        </header>

        {/* Create partner button */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-6">
          <Link href="/partenaires/creer">
            <button className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium">
              {t('create_partner')}
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#9F0F3A] mb-4">{t('filters')}</h2>
          <div className="flex flex-wrap gap-3 items-end">
            {/* Name filter */}
            <input
              type="text"
              name="nom"
              value={filters.nom}
              onChange={handleChange}
              placeholder={t('search_by_name')}
              className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
            />

            {/* Region dropdown */}
            <select
              name="region"
              value={filters.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
            >
              <option value="">{t('all_regions')}</option>
              {Object.keys(countriesByRegion).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            {/* Country dropdown - only enabled if region selected */}
            <select
              name="pays"
              value={filters.pays}
              onChange={handleChange}
              className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
              disabled={!filters.region}
            >
              <option value="">{t('all_countries')}</option>
              {(countriesByRegion as Record<string, string[]>)[filters.region]?.map(pays => (
                <option key={pays} value={pays}>{pays}</option>
              ))}
            </select>

            {/* Reset filters button */}
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 text-sm"
            >
              {t('reset')}
            </button>
          </div>
        </div>

        {/* Partners table */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">
            {t('partners_table_title')}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">{t('column_name')}</th>
                  <th className="px-4 py-2">{t('column_country')}</th>
                  <th className="px-4 py-2">{t('column_region')}</th>
                  <th className="px-4 py-2">{t('column_action')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(partenaire => (
                  <tr key={partenaire.part_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">{partenaire.part_nom}</td>
                    <td className="px-4 py-2 text-gray-800">{partenaire.part_pays}</td>
                    <td className="px-4 py-2 text-gray-800">{partenaire.part_region}</td>
                    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                      {/* Edit button */}
                      <Link
                        href={`/partenaires/${partenaire.part_id}/update`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t('edit')}
                      </Link>
                      {/* Delete button */}
                      <button
                        onClick={() => deletePartenaire(partenaire.part_id)}
                        className="text-sm text-gray-500 hover:text-red-600 hover:underline"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
                {/* No results message */}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center px-4 py-6 text-gray-500">
                      {t('no_partners_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

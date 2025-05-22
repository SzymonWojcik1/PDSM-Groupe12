'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

type Partenaire = {
  part_id: number
  part_nom: string
  part_pays: string
  part_region: string
}

export default function PartenairesPage() {
  const { t } = useTranslation()
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [filtered, setFiltered] = useState<Partenaire[]>([])
  const [filters, setFilters] = useState({
    nom: '',
    pays: '',
    region: '',
  })

  const fetchPartenaires = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
    const data = await res.json()
    setPartenaires(data)
    setFiltered(data)
  }

  useEffect(() => {
    fetchPartenaires()
  }, [])

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

  const deletePartenaire = async (id: number) => {
    if (!confirm(t('confirm_delete'))) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires/${id}`, {
      method: 'DELETE',
    })
    fetchPartenaires()
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({ nom: '', pays: '', region: '' })
  }

  const paysOptions = Array.from(new Set(partenaires.map(p => p.part_pays)))
  const regionOptions = Array.from(new Set(partenaires.map(p => p.part_region)))

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">
            {t('partners_list_title')}
          </h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
          <p className="text-gray-600">{t('partners_list_description')}</p>
        </header>

        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-6">
          <button
            onClick={() => window.location.href = '/partenaires/creer'}
            className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium"
          >
            {t('create_partner')}
          </button>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#9F0F3A] mb-4">Filtres</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <input
              type="text"
              name="nom"
              value={filters.nom}
              onChange={handleFilterChange}
              placeholder="Rechercher par nom..."
              className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
            />

            <select
              name="pays"
              value={filters.pays}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
            >
              <option value="">Tous les pays</option>
              {paysOptions.map(pays => (
                <option key={pays} value={pays}>{pays}</option>
              ))}
            </select>

            <select
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
            >
              <option value="">Toutes les régions</option>
              {regionOptions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>

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
                      <Link
                        href={`/partenaires/${partenaire.part_id}/update`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t('edit')}
                      </Link>
                      <button
                        onClick={() => deletePartenaire(partenaire.part_id)}
                        className="text-sm text-gray-500 hover:text-red-600 hover:underline"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
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

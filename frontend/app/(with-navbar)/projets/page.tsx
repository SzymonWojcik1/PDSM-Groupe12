'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import ProjetFilters from '@/components/ProjetFilters'
import ProjetTable, { Projet } from '@/components/ProjetTable'
import '@/lib/i18n'

import useAuthGuard from '@/lib/hooks/useAuthGuard'
import { useApi } from '@/lib/hooks/useApi'

export default function ProjetsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { callApi } = useApi()

  // Secures access to this page (authentication + 2FA)
  useAuthGuard()

  // Main state for the list of all projects
  const [projets, setProjets] = useState<Projet[]>([])
  // Filtered list that is shown on the table
  const [filtered, setFiltered] = useState<Projet[]>([])
  // Filter input values
  const [filters, setFilters] = useState({
    search: '',
    dateDebut: '',
    dateFin: ''
  })

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        // Fetches all projects from the API
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/projets`)
        const data = await res.json()
        setProjets(data)
        setFiltered(data)
      } catch (err) {
        console.error('Erreur chargement projets', err)
      }
    }

    fetchProjets()
  }, [callApi])

  useEffect(() => {
    // Apply filters whenever input or original data changes
    let result = [...projets]
    if (filters.search) {
      // Filter by name
      result = result.filter(p =>
        p.pro_nom.toLowerCase().includes(filters.search.toLowerCase())
      )
    }
    if (filters.dateDebut) {
      // Filter by start date
      result = result.filter(p => p.pro_dateDebut >= filters.dateDebut)
    }
    if (filters.dateFin) {
      // Filter by end date
      result = result.filter(p => p.pro_dateFin <= filters.dateFin)
    }
    setFiltered(result)
  }, [filters, projets])

  // Deletes a project after confirmation
  const deleteProjet = async (id: number) => {
    if (!confirm(t('confirm_delete_project'))) return
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/projets/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        // Remove the deleted project from the state
        setProjets(prev => prev.filter(p => p.pro_id !== id))
      }
    } catch (err) {
      console.error('Erreur suppression projet', err)
    }
  }

  // Handle filter input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({ search: '', dateDebut: '', dateFin: '' })
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Page title and description */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('projects_management_title')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
          <p className="text-gray-600">{t('projects_management_description')}</p>
        </header>

        {/* Create project button */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <button
            onClick={() => router.push('/projets/creer')}
            className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium"
          >
            {t('create_project')}
          </button>
        </div>

        {/* Filters section */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('filter_projects')}</h2>
          <ProjetFilters filters={filters} onChange={handleFilterChange} onReset={resetFilters} />
        </div>

        {/* Projects table */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('projects_list')}</h2>
          <ProjetTable projets={filtered} onDelete={deleteProjet} />
        </section>
      </div>
    </main>
  )
}

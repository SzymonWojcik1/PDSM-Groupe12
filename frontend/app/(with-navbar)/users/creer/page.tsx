'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

import useAdminGuard from '@/lib/hooks/useAdminGuard'
import { useApi } from '@/lib/hooks/useApi'

/**
 * Type definitions for the component
 */
type Partenaire = { part_id: number; part_nom: string }
type EnumItem = { value: string; label: string }
type User = { id: number; nom: string; prenom: string; role: string }

/**
 * Create User Page Component
 * 
 * This component provides a form interface for creating new users in the system.
 * Features include:
 * - Form validation
 * - Role-based hierarchy for superiors
 * - Partner organization selection
 * - Internationalization support
 * - Protected admin access
 * 
 * The form collects:
 * - Basic user information (name, email, phone)
 * - Role assignment
 * - Superior selection (based on role hierarchy)
 * - Partner organization assignment
 */
export default function CreateUserPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const checked = useAdminGuard()
  
  const { callApi } = useApi()

  // State management for form data and metadata
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [roles, setRoles] = useState<EnumItem[]>([])
  const [superieurs, setSuperieurs] = useState<User[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  // Form data state
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', role: '', partenaire_id: '', superieur_id: ''
  })

  /**
   * Fetches metadata required for the form:
   * - List of partners
   * - Available roles
   * - Potential superiors
   */
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        // Fetch partners list
        const resPartenaires = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
        const partenairesData = await resPartenaires.json()
        setPartenaires(partenairesData)

        // Fetch roles with translations
        const resEnums = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/enums`)
        const enums = await resEnums.json()
        const rolesFromApi = enums.role || []
        const rolesWithLabels = rolesFromApi.map((role: any) => ({
          value: role.value,
          label:
            role.value === 'cn' ? 'Coordination nationale' :
            role.value === 'cr' ? 'Coordination régionale' :
            role.value === 'siege' ? 'Siège' :
            role.value === 'utilisateur' ? 'Utilisateur' : role.label
        }))
        setRoles(rolesWithLabels)

        // Fetch potential superiors
        const resUsers = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users`)
        const usersData = await resUsers.json()
        setSuperieurs(usersData)
      } catch (err: any) {
        setErrorMessage(t('error_loading_data') || err.message)
      }
    }

    fetchMetaData()
  }, [checked])

  /**
   * Handles form input changes
   * Updates form data and clears any error messages
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrorMessage('')
  }

  /**
   * Handles form submission
   * Creates a new user and redirects to users list on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || t('error_create_user'))
      router.push('/users')
    } catch (err: any) {
      setErrorMessage(err.message)
    }
  }

  /**
   * Filters superiors based on role hierarchy
   * Only shows superiors with higher roles than the selected role
   */
  const superieursFiltres = superieurs.filter((sup) => {
    const hierarchie = ['utilisateur', 'cn', 'cr', 'siege']
    const roleIndex = hierarchie.indexOf(formData.role)
    const supIndex = hierarchie.indexOf(sup.role)
    return supIndex > roleIndex
  })

  // Block access if not admin
  if (!checked) return null

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Page header with title and back button */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('create_user_title')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('create_user_description') || 'Remplissez les informations pour ajouter un nouvel utilisateur.'}</p>
            </div>
            <Link
              href="/users"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              Retour à la liste
            </Link>
          </div>
        </header>

        {/* User creation form */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Error message display */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded">
                {errorMessage}
              </div>
            )}

            {/* Basic information inputs */}
            <input
              type="text"
              name="nom"
              placeholder={t('input_lastname') || 'Nom'}
              value={formData.nom}
              onChange={handleChange}
              className="border p-2 rounded text-black"
              required
            />
            <input
              type="text"
              name="prenom"
              placeholder={t('input_firstname') || 'Prénom'}
              value={formData.prenom}
              onChange={handleChange}
              className="border p-2 rounded text-black"
              required
            />
            <input
              type="email"
              name="email"
              placeholder={t('input_email') || 'Email'}
              value={formData.email}
              onChange={handleChange}
              className="border p-2 rounded text-black"
              required
            />
            <input
              type="text"
              name="telephone"
              placeholder={t('input_phone') || 'Téléphone'}
              value={formData.telephone}
              onChange={handleChange}
              className="border p-2 rounded text-black"
            />

            {/* Role selection */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border p-2 rounded text-black"
              required
            >
              <option value="">{t('select_role')}</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            {/* Superior selection (filtered by role hierarchy) */}
            <select
              name="superieur_id"
              value={formData.superieur_id}
              onChange={handleChange}
              className="border p-2 rounded text-black"
            >
              <option value="">{t('select_superior')}</option>
              {superieursFiltres.map(s => (
                <option key={s.id} value={s.id}>{s.prenom} {s.nom} ({s.role})</option>
              ))}
            </select>

            {/* Partner selection */}
            <select
              name="partenaire_id"
              value={formData.partenaire_id}
              onChange={handleChange}
              className="border p-2 rounded text-black"
            >
              <option value="">{t('select_partner')}</option>
              {partenaires.map(p => (
                <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
              ))}
            </select>

            {/* Submit button */}
            <button
              type="submit"
              className="bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30] transition"
            >
              {t('create')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

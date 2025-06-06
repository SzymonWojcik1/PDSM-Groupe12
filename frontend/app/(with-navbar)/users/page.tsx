'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

import useAdminGuard from '@/lib/hooks/useAdminGuard'
import { useApi } from '@/lib/hooks/useApi'

/**
 * User type definition
 * Represents a user in the system with their associated data
 */
type User = {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  telephone?: string
  partenaire?: { part_nom: string }
  superieur?: { id: number; nom: string; prenom: string }
}

/**
 * EnumItem type definition
 * Used for dropdown options with value-label pairs
 */
type EnumItem = {
  value: string
  label: string
}

/**
 * Partner type definition
 * Represents a partner organization in the system
 */
type Partenaire = {
  part_id: number
  part_nom: string
}

/**
 * Users Management Page Component
 *
 * This component provides a complete user management interface including:
 * - User listing with filtering and search capabilities
 * - Role-based access control
 * - User creation, editing, and deletion
 * - Integration with partner and superior relationships
 *
 * Features:
 * - Advanced filtering (role, partner, superior)
 * - Real-time search
 * - Responsive table layout
 * - Internationalization support
 * - Protected admin access
 */
export default function UsersPage() {
  const { t } = useTranslation()
  const checked = useAdminGuard()

  const { callApi } = useApi()

  // State management for users and filters
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<EnumItem[]>([])
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [superieurs, setSuperieurs] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filter state management
  const [filters, setFilters] = useState({
    role: '',
    partenaire_id: '',
    superieur_id: '',
    search: '',
  })

  /**
   * Fetches users from the API with applied filters
   * Updates the users state with the fetched data
   */
  const fetchUsers = async () => {
    const params = new URLSearchParams()
    if (filters.role) params.append('role', filters.role)
    if (filters.partenaire_id) params.append('partenaire_id', filters.partenaire_id)
    if (filters.superieur_id) params.append('superieur_id', filters.superieur_id)

    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users?${params.toString()}`)
      if (!res.ok) throw new Error(t('error_loading_users'))
      const data: User[] = await res.json()
      setUsers(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    }
  }

  /**
   * Filters users locally based on search term
   * Updates filteredUsers state with matching results
   */
  const filterUsersLocally = () => {
    const term = filters.search.toLowerCase().trim()
    const result = users.filter(user =>
      user.nom.toLowerCase().includes(term) ||
      user.prenom.toLowerCase().includes(term)
    )
    setFilteredUsers(result)
  }

  /**
   * Deletes a user after confirmation
   * @param id - The ID of the user to delete
   */
  const deleteUser = async (id: number) => {
    if (!confirm(t('confirm_delete_user'))) return
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error(t('error_delete_user'))
      fetchUsers()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    }
  }

  /**
   * Resets all filters to their initial state
   */
  const resetFilters = () => {
    setFilters({ role: '', partenaire_id: '', superieur_id: '', search: '' })
  }

  // Fetch users when filter criteria change
  useEffect(() => {
    fetchUsers()
  }, [filters.role, filters.partenaire_id, filters.superieur_id])

  // Update filtered users when search term or users list changes
  useEffect(() => {
    filterUsersLocally()
  }, [users, filters.search])

  // Fetch metadata (roles, partners, superiors) on component mount
  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        // Fetch roles
        const resEnums = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/enums`)
        const enums = await resEnums.json()
        const rolesFromApi = enums.role || []
        type RoleApi = { value: string; label: string }
        const rolesWithLabels = rolesFromApi.map((role: RoleApi) => ({
          value: role.value,
          label:
            role.value === 'cn'
              ? t('coordination_nationale')
              : role.value === 'cr'
              ? t('coordination_regionale')
              : role.value === 'siege'
              ? t('siege')
              : role.value === 'utilisateur'
              ? t('utilisateur')
              : role.label,
        }))
        setRoles(rolesWithLabels)

        // Fetch partners
        const resPartenaires = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
        const partenairesData = await resPartenaires.json()
        setPartenaires(partenairesData)

        // Fetch superiors
        const resUsers = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users`)
        const usersData = await resUsers.json()
        setSuperieurs(usersData)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError(String(err))
        }
      }
    }

    fetchMetaData()
  }, [callApi, t])

  // Block access if not admin
  if (!checked) return null

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('user_management')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4" />
          <p className="text-gray-600">{t('user_management_description')}</p>
        </header>

        {/* Create user button */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-6">
          <Link href="/users/creer">
            <button className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium">
              {t('create_user')}
            </button>
          </Link>
        </div>

        {/* Filters section */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#9F0F3A] mb-4">{t('filters')}</h2>
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search input */}
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={t('search_by_name_firstname')}
              className="px-4 py-2 rounded text-sm bg-white border border-gray-300 text-black"
            />

            {/* Role filter */}
            <select
              className="px-4 py-2 rounded text-sm bg-white border border-gray-300 text-black"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">{t('filter_by_role')}</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            {/* Partner filter */}
            <select
              className="px-4 py-2 rounded text-sm bg-white border border-gray-300 text-black"
              value={filters.partenaire_id}
              onChange={(e) => setFilters({ ...filters, partenaire_id: e.target.value })}
            >
              <option value="">{t('filter_by_partner')}</option>
              {partenaires.map(p => (
                <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
              ))}
            </select>

            {/* Superior filter */}
            <select
              className="px-4 py-2 rounded text-sm bg-white border border-gray-300 text-black"
              value={filters.superieur_id}
              onChange={(e) => setFilters({ ...filters, superieur_id: e.target.value })}
            >
              <option value="">{t('filter_by_superior')}</option>
              {superieurs.map(s => (
                <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>
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

        {/* Error message display */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Users table section */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 text-sm text-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">{t('column_lastname')}</th>
                  <th className="p-2">{t('column_firstname')}</th>
                  <th className="p-2">{t('column_email')}</th>
                  <th className="p-2">{t('column_phone')}</th>
                  <th className="p-2">{t('column_role')}</th>
                  <th className="p-2">{t('column_partner')}</th>
                  <th className="p-2">{t('column_superior')}</th>
                  <th className="p-2">{t('column_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {/* User rows */}
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-t border-gray-200">
                    <td className="p-2">{user.nom}</td>
                    <td className="p-2">{user.prenom}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.telephone || '-'}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2">{user.partenaire?.part_nom || '-'}</td>
                    <td className="p-2">{user.superieur ? `${user.superieur.prenom} ${user.superieur.nom}` : '-'}</td>
                    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                      {/* Edit and delete actions */}
                      <Link
                        href={`/users/${user.id}/update`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t('edit')}
                      </Link>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-sm text-gray-500 hover:text-red-600 hover:underline"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
                {/* No results message */}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-4 text-gray-500">
                      {t('no_users_found')}
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

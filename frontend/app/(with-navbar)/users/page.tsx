'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

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

type EnumItem = {
  value: string
  label: string
}

type Partenaire = {
  part_id: number
  part_nom: string
}

export default function UsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<EnumItem[]>([])
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [superieurs, setSuperieurs] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ role: '', partenaire_id: '', superieur_id: '' })
  const [userRole, setUserRole] = useState('')
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'siege') {
      router.push('/')
      return
    }
    setUserRole(role || '')
  }, [])

  const fetchUsers = async () => {
    if (!token) return

    const params = new URLSearchParams()
    if (filters.role) params.append('role', filters.role)
    if (filters.partenaire_id) params.append('partenaire_id', filters.partenaire_id)
    if (filters.superieur_id) params.append('superieur_id', filters.superieur_id)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(t('error_loading_users'))
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm(t('confirm_delete_user'))) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error(t('error_delete_user'))
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filters])

  useEffect(() => {
    if (!token) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/enums`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const rolesFromApi = data.role || []
        const rolesWithLabels = rolesFromApi.map((role: any) => ({
          value: role.value,
          label:
            role.value === 'cn'
              ? 'Coordination nationale'
              : role.value === 'cr'
              ? 'Coordination régionale'
              : role.value === 'siege'
              ? 'Siège'
              : role.value === 'utilisateur'
              ? 'Utilisateur'
              : role.label
        }))
        setRoles(rolesWithLabels)
      })

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setPartenaires)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSuperieurs)
  }, [token])

  if (userRole !== 'siege') {
    return null
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('user_management')}</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select className="border p-2 rounded text-black" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">{t('filter_by_role')}</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>

        <select className="border p-2 rounded text-black" value={filters.partenaire_id} onChange={(e) => setFilters({ ...filters, partenaire_id: e.target.value })}>
          <option value="">{t('filter_by_partner')}</option>
          {partenaires.map(p => (
            <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
          ))}
        </select>

        <select className="border p-2 rounded text-black" value={filters.superieur_id} onChange={(e) => setFilters({ ...filters, superieur_id: e.target.value })}>
          <option value="">{t('filter_by_superior')}</option>
          {superieurs.map(s => (
            <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>
          ))}
        </select>

        <Link href="/users/creer">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {t('create_user')}
          </button>
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="w-full table-auto border border-gray-200 text-black">
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
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.nom}</td>
              <td className="p-2">{user.prenom}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.telephone || '-'}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">{user.partenaire?.part_nom || '-'}</td>
              <td className="p-2">{user.superieur ? `${user.superieur.prenom} ${user.superieur.nom}` : '-'}</td>
              <td className="p-2 flex gap-2">
                <Link href={`/users/${user.id}/update`}>
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    {t('edit')}
                  </button>
                </Link>
                <button onClick={() => deleteUser(user.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                  {t('delete')}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center p-4 text-gray-500">
                {t('no_users_found')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
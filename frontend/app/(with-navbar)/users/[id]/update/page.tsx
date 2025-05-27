'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

import useAdminGuard from '@/lib/hooks/useAdminGuard'
import { useApi } from '@/lib/hooks/useApi'

type Partenaire = { part_id: number; part_nom: string }
type EnumItem = { value: string; label: string }
type User = { id: number; nom: string; prenom: string; role: string }

export default function EditUserPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const router = useRouter()
  const checked = useAdminGuard()
  const { callApi } = useApi()

  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [roles, setRoles] = useState<EnumItem[]>([])
  const [superieurs, setSuperieurs] = useState<User[]>([])
  const [error, setError] = useState('')
  const [currentRole, setCurrentRole] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: '',
    partenaire_id: '',
    password: '',
    password_confirmation: '',
    superieur_id: ''
  })

  useEffect(() => {
    if (!checked || !id || Array.isArray(id)) return

    const fetchData = async () => {
      try {
        const resUser = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`)
        const data = await resUser.json()

        setFormData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
          telephone: data.telephone || '',
          role: data.role || '',
          partenaire_id: data.partenaire?.part_id?.toString() || '',
          password: '',
          password_confirmation: '',
          superieur_id: data.superieur?.id?.toString() || ''
        })
        setCurrentRole(data.role)

        const resPartenaires = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
        const partenairesData = await resPartenaires.json()
        setPartenaires(partenairesData)

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

        const resUsers = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users`)
        const usersData = await resUsers.json()
        setSuperieurs(usersData)
      } catch (err: any) {
        setError(err.message || t('error_loading_data'))
      }
    }

    fetchData()
  }, [checked, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'role') setCurrentRole(value)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || Array.isArray(id)) return

    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || t('error_update_user'))

      router.push('/users')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const superieursFiltres = superieurs.filter((sup) => {
    const hierarchie = ['utilisateur', 'cn', 'cr', 'siege']
    const roleIndex = hierarchie.indexOf(currentRole)
    const supIndex = hierarchie.indexOf(sup.role)
    return supIndex > roleIndex
  })

  if (!checked) return null

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('edit_user_title')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('edit_user_description') || 'Modifiez les informations de l’utilisateur.'}</p>
            </div>
            <Link
              href="/users"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              Retour à la liste
            </Link>
          </div>
        </header>

        <div className="bg-white border rounded-2xl shadow-sm p-6 w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded">
                {error}
              </div>
            )}

            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder={t('input_lastname')}
              className="border p-2 rounded text-black"
              required
            />
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder={t('input_firstname')}
              className="border p-2 rounded text-black"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('input_email')}
              className="border p-2 rounded text-black"
              required
            />
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder={t('input_phone')}
              className="border p-2 rounded text-black"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('input_password')}
              className="border p-2 rounded text-black"
            />
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder={t('input_password_confirm')}
              className="border p-2 rounded text-black"
            />

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

            <select
              name="superieur_id"
              value={formData.superieur_id}
              onChange={handleChange}
              className="border p-2 rounded text-black"
            >
              <option value="">{t('select_superior')}</option>
              {superieursFiltres.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.prenom} {sup.nom} ({sup.role})</option>
              ))}
            </select>

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

            <button
              type="submit"
              className="bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30] transition"
            >
              {t('save')}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

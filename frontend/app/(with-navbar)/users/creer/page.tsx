'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

type Partenaire = { part_id: number; part_nom: string }
type EnumItem = { value: string; label: string }
type User = { id: number; nom: string; prenom: string; role: string }

export default function CreateUserPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const [hasAccess, setHasAccess] = useState(false)
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [roles, setRoles] = useState<EnumItem[]>([])
  const [superieurs, setSuperieurs] = useState<User[]>([])
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', role: '', partenaire_id: '', superieur_id: ''
  })

  useEffect(() => {
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.role === 'siege') {
          setHasAccess(true)
        } else {
          router.push('/')
        }
      })
      .catch(() => router.push('/'))
  }, [token])

  useEffect(() => {
    if (!token || !hasAccess) return

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPartenaires(data))
      .catch(() => setError(t('error_fetch_partners')))

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/enums`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const rolesFromApi = data.role || []
        const rolesWithLabels = rolesFromApi.map((role: any) => ({
          value: role.value,
          label:
            role.value === 'cn' ? 'Coordination nationale' :
            role.value === 'cr' ? 'Coordination régionale' :
            role.value === 'siege' ? 'Siège' :
            role.value === 'utilisateur' ? 'Utilisateur' : role.label
        }))
        setRoles(rolesWithLabels)
      })
      .catch(() => setError(t('error_fetch_roles')))

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSuperieurs(data))
      .catch(() => setError(t('error_fetch_users')))
  }, [token, hasAccess])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || t('error_create_user'))
      router.push('/users')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const superieursFiltres = superieurs.filter((sup) => {
    const hierarchie = ['utilisateur', 'cn', 'cr', 'siege']
    const roleIndex = hierarchie.indexOf(formData.role)
    const supIndex = hierarchie.indexOf(sup.role)
    return supIndex > roleIndex
  })

  if (!hasAccess) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-black mb-4">{t('create_user_title')}</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
        <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder={t('input_lastname')} className="w-full p-2 border rounded text-black" required />
        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder={t('input_firstname')} className="w-full p-2 border rounded text-black" required />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('input_email')} className="w-full p-2 border rounded text-black" required />
        <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} placeholder={t('input_phone')} className="w-full p-2 border rounded text-black" />
        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded text-black" required>
          <option value="">{t('select_role')}</option>
          {roles.map(role => (<option key={role.value} value={role.value}>{role.label}</option>))}
        </select>
        <select name="superieur_id" value={formData.superieur_id} onChange={handleChange} className="w-full p-2 border rounded text-black">
          <option value="">{t('select_superior')}</option>
          {superieursFiltres.map(sup => (
            <option key={sup.id} value={sup.id}>{sup.prenom} {sup.nom} ({sup.role})</option>
          ))}
        </select>
        <select name="partenaire_id" value={formData.partenaire_id} onChange={handleChange} className="w-full p-2 border rounded text-black">
          <option value="">{t('select_partner')}</option>
          {partenaires.map(p => (
            <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{t('create')}</button>
      </form>
    </div>
  )
}
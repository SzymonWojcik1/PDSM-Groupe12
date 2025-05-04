'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Partenaire = {
  part_id: number
  part_nom: string
}

type EnumItem = {
  value: string
  label: string
}

export default function EditUserPage() {
  const { id } = useParams()
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [roles, setRoles] = useState<EnumItem[]>([])
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: '',
    partenaire_id: '',
    password: '',
    password_confirmation: ''
  })

  useEffect(() => {
    if (!token || !id || Array.isArray(id)) return

    // Récupération de l'utilisateur
    fetch(`http://localhost:8000/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setFormData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          email: data.email || '',
          telephone: data.telephone || '',
          role: data.role || '',
          partenaire_id: data.partenaire?.part_id?.toString() || '',
          password: '',
          password_confirmation: ''
        })
      })
      .catch(() => setError('Erreur lors du chargement de l’utilisateur'))

    // Récupération des partenaires
    fetch('http://localhost:8000/api/partenaires', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setPartenaires)
      .catch(() => setError('Erreur lors du chargement des partenaires'))

    // Récupération des rôles
    fetch('http://localhost:8000/api/enums', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const rolesWithLabels = (data.role || []).map((role: any) => ({
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
      .catch(() => setError('Erreur lors du chargement des rôles'))
  }, [token, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !id || Array.isArray(id)) return

    try {
      const res = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la mise à jour')

      router.push('/users')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-black mb-4">Modifier un utilisateur</h1>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}

        <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom"
          className="w-full p-2 border rounded text-black" required />

        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom"
          className="w-full p-2 border rounded text-black" required />

        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email"
          className="w-full p-2 border rounded text-black" required />

        <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone"
          className="w-full p-2 border rounded text-black" />

        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Nouveau mot de passe"
          className="w-full p-2 border rounded text-black" />

        <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange}
          placeholder="Confirmation du mot de passe"
          className="w-full p-2 border rounded text-black" />

        <select name="role" value={formData.role} onChange={handleChange}
          className="w-full p-2 border rounded text-black" required>
          <option value="">Sélectionner un rôle</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>

        <select name="partenaire_id" value={formData.partenaire_id} onChange={handleChange}
          className="w-full p-2 border rounded text-black">
          <option value="">Aucun partenaire</option>
          {partenaires.map(p => (
            <option key={p.part_id} value={p.part_id}>
              {p.part_nom}
            </option>
          ))}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Enregistrer
        </button>
      </form>
    </div>
  )
}

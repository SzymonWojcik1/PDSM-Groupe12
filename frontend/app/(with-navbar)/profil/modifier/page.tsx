'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type UserData = {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
}

export default function ModifierProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError("Non authentifié")
        return
      }

      try {
        const res = await fetch('http://localhost:8000/api/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Erreur lors du chargement')

        const data = await res.json()
        setUser(data)
        setNom(data.nom)
        setPrenom(data.prenom)
        setTelephone(data.telephone || '')
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
  
    const token = localStorage.getItem('token')
    if (!token || !user) return
  
    const payload: any = {
      nom,
      prenom,
      telephone,
    }
  
    if (password) {
      if (password !== passwordConfirm) {
        setError('Les mots de passe ne correspondent pas.')
        setLoading(false)
        return
      }
      payload.password = password
      payload.password_confirmation = passwordConfirm
    }
  
    try {
      const res = await fetch(`http://localhost:8000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        throw new Error(
          data.message ||
          data.errors?.nom?.[0] ||
          data.errors?.prenom?.[0] ||
          data.errors?.password?.[0] ||
          'Erreur de mise à jour'
        )
      }
  
      router.push('/profil')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  

  if (error) return <div className="p-6 text-red-600">Erreur : {error}</div>
  if (!user) return <div className="p-6">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Modifier mon profil</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 block w-full border px-3 py-2 rounded-md text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Prénom</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="mt-1 block w-full border px-3 py-2 rounded-md text-black"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Téléphone</label>
          <input
            type="text"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-1 block w-full border px-3 py-2 rounded-md text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border px-3 py-2 rounded-md text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Confirmer le mot de passe</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="mt-1 block w-full border px-3 py-2 rounded-md text-black"
          />
        </div>

        {success && <p className="text-green-600 text-sm">{success}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex items-center gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/profil')}
            className="text-gray-700 hover:underline"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

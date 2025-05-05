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

export default function ProfilPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError("Non authentifié")
        return
      }

      try {
        const res = await fetch('http://localhost:8000/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Erreur lors du chargement')

        const data = await res.json()
        setUser(data)
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchUser()
  }, [])

  if (error) return <div className="p-6 text-red-600">Erreur : {error}</div>
  if (!user) return <div className="p-6">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <div className="space-y-2">
        <p><strong>Nom :</strong> {user.nom}</p>
        <p><strong>Prénom :</strong> {user.prenom}</p>
        <p><strong>Email :</strong> {user.email}</p>
        {user.telephone && <p><strong>Téléphone :</strong> {user.telephone}</p>}
      </div>

      <button
        onClick={() => router.push('/profil/modifier')}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Modifier mes informations
      </button>
    </div>
  )
}

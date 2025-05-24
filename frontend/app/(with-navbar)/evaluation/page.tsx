'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Evaluation = {
  eva_id: number
  eva_use_id: number
  eva_statut: string
  eva_date_soumission?: string
}

type User = {
  id: number
  email: string
  role: string
  nom: string
  prenom: string
}

export default function EvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Utilisateur non connecté')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Échec de la récupération de l’utilisateur')

        const userData: User = await res.json()
        setUser(userData)

        if (userData.role === 'siege') {
          fetchAllEvaluations()
        } else {
          fetchUserEvaluations(userData.id)
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const fetchAllEvaluations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluations`)
      const data: Evaluation[] = await res.json()
      setEvaluations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement évaluations :', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserEvaluations = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mes-evaluations?user_id=${userId}`)
      const data: Evaluation[] = await res.json()
      setEvaluations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement évaluations utilisateur :', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Évaluations</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          {user?.role === 'siege' && (
            <Link
              href="/evaluation/creer"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              ➕ Nouvelle évaluation
            </Link>
          )}
        </header>

        {error && <p className="text-red-600">Erreur : {error}</p>}
        {loading ? (
          <p className="text-gray-400">Chargement...</p>
        ) : evaluations.length === 0 ? (
          <p className="text-gray-500">
            {user?.role === 'siege'
              ? 'Aucune évaluation disponible.'
              : 'Aucune évaluation à remplir pour le moment.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map((eva) => (
              <div
                key={eva.eva_id}
                className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition"
              >
                <p className="text-sm text-gray-600">ID : {eva.eva_id}</p>
                <p className="font-medium text-gray-800">Statut : {eva.eva_statut}</p>
                <p className="text-sm text-gray-600">
                  Utilisateur évalué : {eva.eva_use_id}
                </p>
                <Link
                  href={`/evaluation/${eva.eva_id}`}
                  className="inline-block mt-2 text-blue-600 text-sm underline"
                >
                  {user?.role === 'siege'
                    ? 'Voir l’évaluation →'
                    : 'Remplir cette évaluation →'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

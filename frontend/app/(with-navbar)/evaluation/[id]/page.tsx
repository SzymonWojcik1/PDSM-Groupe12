'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import useAuthGuard from '@/lib/hooks/useAuthGuard' // Protects the route with authentication
import { useApi } from '@/lib/hooks/useApi' // Custom hook for authenticated API calls
import Link from 'next/link'

// Define types for criteria, evaluation and user
type Critere = {
  label: string
  reussi: boolean
}

type Evaluation = {
  eva_id: number
  eva_statut: string
  eva_use_id: number
  criteres: Critere[]
}

type User = {
  id: number
  role: string
}

export default function EvaluationDetailPage() {
  useAuthGuard() // Enforce that only authenticated users can access
  const { t } = useTranslation()
  const { id } = useParams()
  const router = useRouter()
  const { callApi } = useApi()

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [reponses, setReponses] = useState<{ [index: number]: string }>({}) // Stores answers per criterion index
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch user and evaluation on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, evalRes] = await Promise.all([
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/me`),
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/evaluations/${id}`)
        ])

        if (!userRes.ok || !evalRes.ok) throw new Error('Échec requête API')

        const userData: User = await userRes.json()
        const evalData: Evaluation = await evalRes.json()

        setUser(userData)
        setEvaluation(evalData)

        // Prefill responses if user is "siege" and evaluation is already submitted
        if (
          evalData.criteres &&
          userData.role === 'siege' &&
          evalData.eva_statut === 'soumis'
        ) {
          const initial: { [index: number]: string } = {}
          evalData.criteres.forEach((c, i) => {
            initial[i] = c.reussi ? 'reussi' : 'non_reussi'
          })
          setReponses(initial)
        }
      } catch (err) {
        console.error(err)
        setError('Une erreur est survenue')
      }
    }

    fetchData()
  }, [id])

  // Handle answer selection change
  const handleChange = (index: number, value: string) => {
    setReponses({ ...reponses, [index]: value })
  }

  // Submit updated answers
  const handleSubmit = async () => {
    console.log('User:', user, 'Évaluation pour:', evaluation?.eva_use_id, 'Statut:', evaluation?.eva_statut)

    const formatted = evaluation?.criteres.map((c, i) => ({
      label: c.label,
      reussi: reponses[i] === 'reussi'
    }))

    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/evaluations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponses: formatted })
      })

      if (!res.ok) throw new Error('Erreur lors de la soumission')

      setSuccess(true)
      setTimeout(() => router.push('/evaluation'), 1500) // Redirect after short delay
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue')
    }
  }

  // Show error if fetch failed
  if (error) {
    return <p className="text-red-600 p-6">{t('error_prefix', 'Erreur :')} {error}</p>
  }

  // Show loading state
  if (!evaluation || !user) {
    return <p className="p-6 text-gray-500">{t('loading', 'Chargement...')}</p>
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Page title */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#9F0F3A] mb-2">
              {t('fill_evaluation_title', "Remplir l'évaluation")} #{evaluation.eva_id}
            </h1>
            <Link
              href="/evaluation"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              ← {t('back_to_list', 'Retour à la liste')}
            </Link>
          </div>
        </header>

        {/* Evaluation content */}
        <div className="bg-white shadow rounded p-6">
          {evaluation.criteres.map((critere, index) => (
            <div key={index} className="mb-4 p-4 border rounded bg-gray-50">
              <p className="text-gray-700 mb-2">{critere.label}</p>

              {/* If user is 'siege' and eval already submitted, show result only */}
              {user.role === 'siege' && evaluation.eva_statut === 'soumis' ? (
                <p className={`text-sm font-semibold ${critere.reussi ? 'text-green-600' : 'text-red-600'}`}>
                  {critere.reussi ? t('result_success', 'Réussi') : t('result_fail', 'Non réussi')}
                </p>
              ) : (
                // Otherwise show radio inputs for each criterion
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-1 text-green-700">
                    <input
                      type="radio"
                      name={`critere-${index}`}
                      value="reussi"
                      checked={reponses[index] === 'reussi'}
                      onChange={() => handleChange(index, 'reussi')}
                    />
                    {t('result_success', 'Réussi')}
                  </label>
                  <label className="flex items-center gap-1 text-red-700">
                    <input
                      type="radio"
                      name={`critere-${index}`}
                      value="non_reussi"
                      checked={reponses[index] === 'non_reussi'}
                      onChange={() => handleChange(index, 'non_reussi')}
                    />
                    {t('result_fail', 'Non réussi')}
                  </label>
                </div>
              )}
            </div>
          ))}

          {/* Show submit button only for regular users who are the target and if status is 'en_attente' */}
          {user.role !== 'siege' &&
            evaluation.eva_statut === 'en_attente' &&
            user.id === evaluation.eva_use_id && (
              <button
                onClick={handleSubmit}
                className="mt-4 bg-[#9F0F3A] text-white px-4 py-2 rounded hover:bg-[#7e0c2f]"
              >
                {t('submit', 'Soumettre')}
              </button>
          )}

          {/* Show confirmation after successful submission */}
          {success && (
            <p className="text-green-600 mt-4">
              {t('evaluation_submitted_success', 'Évaluation soumise avec succès !')}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

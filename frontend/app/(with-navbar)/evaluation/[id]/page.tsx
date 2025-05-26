'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next';

type Critere = {
  label: string
  reussi: boolean
}

type Evaluation = {
  eva_id: number
  eva_statut: string
  criteres: Critere[]
}

type User = {
  id: number
  role: string
}

export default function EvaluationDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams()
  const router = useRouter()
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [reponses, setReponses] = useState<{ [index: number]: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Non authentifié')
        return
      }

      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = await userRes.json()
        setUser(userData)

        const evalRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const evalData = await evalRes.json()
        setEvaluation(evalData)

        // Ne cocher que si soumis et utilisateur siege
        if (
          evalData.criteres &&
          userData.role === 'siege' &&
          evalData.eva_statut === 'soumis'
        ) {
          const initial: { [index: number]: string } = {}
          evalData.criteres.forEach((c: Critere, i: number) => {
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

  const handleChange = (index: number, value: string) => {
    setReponses({ ...reponses, [index]: value })
  }

  const handleSubmit = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const formatted = evaluation?.criteres.map((c, i) => ({
      label: c.label,
      reussi: reponses[i] === 'reussi',
    }))

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reponses: formatted }),
      })

      if (!res.ok) throw new Error("Erreur lors de la soumission")

      setSuccess(true)
      setTimeout(() => router.push('/evaluation'), 1500)
    } catch (err) {
      setError('Une erreur est survenue')
    }
  }

  if (error) {
    return <p className="text-red-600 p-6">{t('error_prefix', 'Erreur :')} {error}</p>
  }

  if (!evaluation || !user) {
    return <p className="p-6 text-gray-500">{t('loading', 'Chargement...')}</p>
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-2xl font-bold text-[#9F0F3A] mb-6">
        {t('fill_evaluation_title', 'Remplir l\'évaluation')} #{evaluation.eva_id}
      </h1>

      {/* Si besoin d'afficher le statut, ajouter :
      <p>{t('status', 'Statut')} : {t('status_' + evaluation.eva_statut, evaluation.eva_statut)}</p> */}

      {evaluation.criteres.map((critere, index) => (
        <div key={index} className="mb-4 p-4 border rounded bg-gray-50">
          <p className="text-gray-700 mb-2">{critere.label}</p>

          {user.role === 'siege' && evaluation.eva_statut === 'soumis' ? (
            <p className={`text-sm font-semibold ${critere.reussi ? 'text-green-600' : 'text-red-600'}`}>
              {critere.reussi ? t('result_success', '✅ Réussi') : t('result_fail', '❌ Non réussi')}
            </p>
          ) : (
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-1 text-green-700">
                <input
                  type="radio"
                  name={`critere-${index}`}
                  value="reussi"
                  checked={reponses[index] === 'reussi'}
                  onChange={() => handleChange(index, 'reussi')}
                />
                {t('result_success', '✅ Réussi')}
              </label>
              <label className="flex items-center gap-1 text-red-700">
                <input
                  type="radio"
                  name={`critere-${index}`}
                  value="non_reussi"
                  checked={reponses[index] === 'non_reussi'}
                  onChange={() => handleChange(index, 'non_reussi')}
                />
                {t('result_fail', '❌ Non réussi')}
              </label>
            </div>
          )}
        </div>
      ))}

      {user.role !== 'siege' && evaluation.eva_statut === 'en_attente' && (
        <button
          onClick={handleSubmit}
          className="mt-4 bg-[#9F0F3A] text-white px-4 py-2 rounded hover:bg-[#7e0c2f]"
        >
          {t('submit', 'Soumettre')}
        </button>
      )}

      {success && <p className="text-green-600 mt-4">{t('evaluation_submitted_success', '✅ Évaluation soumise avec succès !')}</p>}
    </div>
  )
}

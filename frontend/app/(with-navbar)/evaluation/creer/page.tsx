'use client' // Required for using React hooks and client-side logic in Next.js App Router

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' // Used to redirect the user after form submission
import { useTranslation } from 'react-i18next' // Internationalization hook
import useAuthGuard from '@/lib/hooks/useAuthGuard' // Custom hook to protect the page for authenticated users
import { useApi } from '@/lib/hooks/useApi' // Custom hook for authenticated API calls

// Define the partner type structure
type Partenaire = { part_id: number; part_nom: string }

export default function CreateEvaluationPage() {
  useAuthGuard() // Ensures the user is authenticated before rendering the page
  const { t } = useTranslation() // Access translations
  const { callApi } = useApi() // Custom API call function
  const router = useRouter() // Allows navigation after submission

  const [partenaires, setPartenaires] = useState<Partenaire[]>([]) // Store list of partners
  const [selectedPartenaireId, setSelectedPartenaireId] = useState<number | null>(null) // Selected partner ID
  const [critereInput, setCritereInput] = useState('') // Input value for new criterion
  const [criteres, setCriteres] = useState<string[]>([]) // List of added criteria
  const [loading, setLoading] = useState(false) // Loading state during form submission

  // Fetch partners from API on component mount
  useEffect(() => {
    const fetchPartenaires = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
        const data: Partenaire[] = await res.json()
        setPartenaires(data)
      } catch (err) {
        console.error('Erreur chargement partenaires :', err)
      }
    }
    fetchPartenaires()
  }, [callApi])

  // Add new criterion to the list
  const handleAddCritere = () => {
    if (critereInput.trim()) {
      setCriteres(prev => [...prev, critereInput.trim()])
      setCritereInput('')
    }
  }

  // Submit form and create evaluations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Check if form is complete
    if (!selectedPartenaireId || criteres.length === 0) {
      alert(t('create_eval_alert_missing', 'Veuillez choisir un partenaire et ajouter au moins un critère.'))
      return
    }

    setLoading(true)
    try {
      // Prepare request body
      const body = {
        part_id: selectedPartenaireId,
        criteres: criteres.map(label => ({
          label,
          reussi: false // Default to false for all criteria
        }))
      }

      // Send POST request to create evaluations
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      // Handle server-side errors
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || err.error)
      }

      // Success message and redirect
      alert(t('create_eval_success', 'Évaluations créées avec succès'))
      router.push('/evaluation')
    } catch (err) {
      console.error(err)
      alert(t('create_eval_error', 'Une erreur est survenue'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Page title */}
        <h1 className="text-3xl font-bold text-[#9F0F3A] mb-6">
          {t('create_eval_title', 'Créer une évaluation')}
        </h1>

        {/* Evaluation creation form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 border rounded shadow">
          
          {/* Partner selection dropdown */}
          <div>
            <label className="block font-semibold mb-1">{t('partner', 'Partenaire')}</label>
            <select
              value={selectedPartenaireId ?? ''}
              onChange={e => setSelectedPartenaireId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded p-2"
              required
            >
              <option value="">{t('choose_partner', '-- Choisir un partenaire --')}</option>
              {partenaires.map(p => (
                <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
              ))}
            </select>
          </div>

          {/* Criterion input and add button */}
          <div>
            <label className="block font-semibold mb-1">{t('add_criteria', 'Ajouter un critère')}</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={critereInput}
                onChange={e => setCritereInput(e.target.value)}
                placeholder={t('criteria_name_placeholder', 'Nom du critère')}
                className="flex-grow border border-gray-300 rounded p-2"
              />
              <button
                type="button"
                onClick={handleAddCritere}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('add', '➕ Ajouter')}
              </button>
            </div>
          </div>

          {/* List of added criteria */}
          {criteres.length > 0 && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2">{t('added_criteria', 'Critères ajoutés :')}</h2>
              <ul className="list-disc list-inside text-gray-700">
                {criteres.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30] transition"
          >
            {loading ? t('creating', 'Création...') : t('create_eval_submit', 'Créer les évaluations')}
          </button>
        </form>
      </div>
    </main>
  )
}

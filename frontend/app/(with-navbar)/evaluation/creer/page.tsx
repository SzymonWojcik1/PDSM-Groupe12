'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Partenaire = { part_id: number; part_nom: string }

export default function CreateEvaluationPage() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [selectedPartenaireId, setSelectedPartenaireId] = useState<number | null>(null)
  const [critereInput, setCritereInput] = useState('')
  const [criteres, setCriteres] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
      .then(res => res.json())
      .then(data => setPartenaires(data))
      .catch(err => console.error('Erreur chargement partenaires :', err))
  }, [])

  const handleAddCritere = () => {
    if (critereInput.trim()) {
      setCriteres(prev => [...prev, critereInput.trim()])
      setCritereInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPartenaireId || criteres.length === 0) {
      alert('Veuillez choisir un partenaire et ajouter au moins un critère.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part_id: selectedPartenaireId,
          criteres: criteres.map(label => ({
            label,
            reussi: false  // valeur initiale
          }))
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || err.error)
      }

      alert('✅ Évaluations créées avec succès')
      router.push('/evaluation')
    } catch (err) {
      console.error(err)
      alert('❌ Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#9F0F3A] mb-6">Créer une évaluation</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 border rounded shadow">

          {/* Sélection partenaire */}
          <div>
            <label className="block font-semibold mb-1">Partenaire</label>
            <select
              value={selectedPartenaireId ?? ''}
              onChange={e => setSelectedPartenaireId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded p-2"
              required
            >
              <option value="">-- Choisir un partenaire --</option>
              {partenaires.map(p => (
                <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
              ))}
            </select>
          </div>

          {/* Ajout de critères */}
          <div>
            <label className="block font-semibold mb-1">Ajouter un critère</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={critereInput}
                onChange={e => setCritereInput(e.target.value)}
                placeholder="Nom du critère"
                className="flex-grow border border-gray-300 rounded p-2"
              />
              <button
                type="button"
                onClick={handleAddCritere}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ➕ Ajouter
              </button>
            </div>
          </div>

          {/* Liste des critères */}
          {criteres.length > 0 && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Critères ajoutés :</h2>
              <ul className="list-disc list-inside text-gray-700">
                {criteres.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30] transition"
          >
            {loading ? 'Création...' : 'Créer les évaluations'}
          </button>
        </form>
      </div>
    </main>
  )
}

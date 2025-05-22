'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export type Activite = {
  act_id: number
  act_nom: string
  act_dateDebut: string
  act_dateFin: string
  partenaire?: { part_nom: string; part_id: number }
  projet?: { pro_nom: string; pro_id: number }
}

type ActiviteWithCount = Activite & {
  nbBeneficiaires: number
}

export default function LierActivitesPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const indicateurId = searchParams.get('ind')
  const router = useRouter()

  const [activites, setActivites] = useState<Activite[]>([])
  const [linkedActivites, setLinkedActivites] = useState<ActiviteWithCount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchAll, setSearchAll] = useState('')
  const [searchLinked, setSearchLinked] = useState('')

  const fetchActivites = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites`)
    const data = await res.json()
    setActivites(data)
  }

  const fetchLinkedActivites = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateur-activite`)
    const data = await res.json()

    const filtered = data.filter((item: any) => item.ind_id == indicateurId)

    const detailed: ActiviteWithCount[] = []
    for (const link of filtered) {
      const act = link.activite
      if (!act) continue
      const benRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites/${act.act_id}/beneficiaires`)
      const benList = await benRes.json()
      detailed.push({ ...act, nbBeneficiaires: benList.length })
    }

    setLinkedActivites(detailed)
  }

  const handleLink = async (actId: number) => {
    setIsLoading(true)
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateur-activite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ind_id: indicateurId, act_id: actId }),
    })
    await fetchLinkedActivites()
    setIsLoading(false)
  }

  const handleUnlink = async (actId: number) => {
    setIsLoading(true)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateur-activite`)
    const data = await res.json()
    const link = data.find((item: any) => item.ind_id == indicateurId && item.act_id == actId)

    if (link) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateur-activite/${link.id}`, {
        method: 'DELETE',
      })
      await fetchLinkedActivites()
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (indicateurId) {
      fetchActivites()
      fetchLinkedActivites()
    }
  }, [indicateurId])

  const availableActivites = activites
    .filter(act => !linkedActivites.some(linked => linked.act_id === act.act_id))
    .filter(act => act.act_nom.toLowerCase().includes(searchAll.toLowerCase()))

  const filteredLinkedActivites = linkedActivites.filter(act =>
    act.act_nom.toLowerCase().includes(searchLinked.toLowerCase())
  )

  const valeurReelle = linkedActivites.reduce((acc, curr) => acc + curr.nbBeneficiaires, 0)

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#9F0F3A]">Lier des activités à un indicateur</h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea]"
          >
            ← Retour
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Nombre total de bénéficiaires associés : <strong>{valeurReelle}</strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Activités disponibles */}
          <section className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#9F0F3A]">Toutes les activités</h2>
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchAll}
              onChange={e => setSearchAll(e.target.value)}
              className="mb-4 w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
            {availableActivites.length === 0 ? (
              <p className="text-gray-500">Aucune activité disponible</p>
            ) : (
              <ul className="space-y-2">
                {availableActivites.map(act => (
                  <li key={act.act_id} className="flex justify-between items-center">
                    <span>{act.act_nom}</span>
                    <button
                      onClick={() => handleLink(act.act_id)}
                      disabled={isLoading}
                      className="text-green-600 hover:underline disabled:text-gray-400"
                    >
                      Lier
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Activités liées */}
          <section className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#9F0F3A]">Activités liées</h2>
            <input
              type="text"
              placeholder="Rechercher une activité liée..."
              value={searchLinked}
              onChange={e => setSearchLinked(e.target.value)}
              className="mb-4 w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
            {filteredLinkedActivites.length === 0 ? (
              <p className="text-gray-500">Aucune activité liée</p>
            ) : (
              <ul className="space-y-2">
                {filteredLinkedActivites.map(act => (
                  <li key={act.act_id} className="flex justify-between items-center">
                    <span>{act.act_nom} – {act.nbBeneficiaires} bénéficiaire(s)</span>
                    <button
                      onClick={() => handleUnlink(act.act_id)}
                      disabled={isLoading}
                      className="text-red-600 hover:underline disabled:text-gray-400"
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import useAuthGuard from '@/lib/hooks/useAuthGuard'
import { useApi } from '@/lib/hooks/useApi'

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
  useAuthGuard()
  const { id } = useParams()
  const searchParams = useSearchParams()
  const indicateurId = searchParams.get('ind')
  const router = useRouter()
  const { t } = useTranslation()
  const { callApi } = useApi()

  const [activites, setActivites] = useState<Activite[]>([])
  const [linkedActivites, setLinkedActivites] = useState<ActiviteWithCount[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchAll, setSearchAll] = useState('')
  const [searchLinked, setSearchLinked] = useState('')

  const fetchActivites = async () => {
    try {
      const [allRes, linksRes] = await Promise.all([
        callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites`).then(async res => {
          if (!res.ok) throw new Error('Erreur chargement activités')
          return res.json()
        }),
        callApi(`${process.env.NEXT_PUBLIC_API_URL}/indicateur-activite/${indicateurId}/activites-with-count`).then(async res => {
          if (!res.ok) throw new Error('Erreur chargement activités liées')
          return res.json()
        }),
      ])
      setActivites(allRes)
      setLinkedActivites(linksRes)
    } catch (err) {
      console.error('Erreur fetch activités:', err)
    }
  }

  const handleLinkMany = async () => {
    if (!indicateurId) return
    setIsLoading(true)
    try {
      await callApi(`${process.env.NEXT_PUBLIC_API_URL}/indicateur-activite/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ind_id: indicateurId, act_ids: selectedIds })
      })
      setSelectedIds([])
      await fetchActivites()
    } catch (err) {
      console.error('Erreur lors du lien:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlink = async (actId: number) => {
    if (!indicateurId) return
    setIsLoading(true)
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/indicateur-activite`)
      if (!res.ok) throw new Error('Erreur récupération des liens')
      const data = await res.json()
      const link = data.find((item: any) => item.ind_id == indicateurId && item.act_id == actId)

      if (link) {
        await callApi(`${process.env.NEXT_PUBLIC_API_URL}/indicateur-activite/${link.id}`, {
          method: 'DELETE'
        })
        await fetchActivites()
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du lien:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (indicateurId) fetchActivites()
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
          <h1 className="text-3xl font-bold text-[#9F0F3A]">{t('link_activities_to_indicator')}</h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea]"
          >
            ← {t('back')}
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            {t('total_beneficiaries_linked')} : <strong>{valeurReelle}</strong>
          </p>
          <button
            onClick={handleLinkMany}
            disabled={isLoading || selectedIds.length === 0}
            className="px-4 py-2 bg-[#9F0F3A] text-white rounded hover:bg-[#800d30] disabled:bg-gray-300"
          >
            {isLoading ? t('linking') : t('link')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Activités disponibles */}
          <section className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#9F0F3A]">{t('all_activities')}</h2>
            <input
              type="text"
              placeholder={t('search_activity')}
              value={searchAll}
              onChange={e => setSearchAll(e.target.value)}
              className="mb-4 w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
            {availableActivites.length === 0 ? (
              <p className="text-gray-500">{t('no_available_activity')}</p>
            ) : (
              <ul className="space-y-2">
                {availableActivites.map(act => (
                  <li key={act.act_id} className="flex justify-between items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(act.act_id)}
                        onChange={e => {
                          setSelectedIds(prev =>
                            e.target.checked
                              ? [...prev, act.act_id]
                              : prev.filter(id => id !== act.act_id)
                          )
                        }}
                      />
                      {act.act_nom}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Activités liées */}
          <section className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#9F0F3A]">{t('linked_activities')}</h2>
            <input
              type="text"
              placeholder={t('search_linked_activity')}
              value={searchLinked}
              onChange={e => setSearchLinked(e.target.value)}
              className="mb-4 w-full border border-gray-300 rounded px-4 py-2 text-sm"
            />
            {filteredLinkedActivites.length === 0 ? (
              <p className="text-gray-500">{t('no_linked_activity')}</p>
            ) : (
              <ul className="space-y-2">
                {filteredLinkedActivites.map(act => (
                  <li key={act.act_id} className="flex justify-between items-center">
                    <span>{act.act_nom} – {act.nbBeneficiaires} {t('beneficiaries')}</span>
                    <button
                      onClick={() => handleUnlink(act.act_id)}
                      disabled={isLoading}
                      className="text-red-600 hover:underline disabled:text-gray-400"
                    >
                      {t('unlink')}
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

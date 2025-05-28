'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { useApi } from '@/lib/hooks/useApi'
import useAuthGuard from '@/lib/hooks/useAuthGuard'
import useAdminGuard from '@/lib/hooks/useAdminGuard'

/**
 * Logical Framework Dashboard Component
 * 
 * This component provides a comprehensive dashboard for monitoring logical framework indicators.
 * Features include:
 * - Protected route (requires authentication and admin rights)
 * - Global statistics overview
 * - Hierarchical indicator tracking
 * - Progress visualization
 * 
 * The dashboard displays:
 * - Total indicators count
 * - Sum of target values
 * - Sum of achieved values
 * - Global progress percentage
 * - Detailed table with progress bars for each indicator
 */
export default function DashboardCadreLogique() {
  useAuthGuard()
  const { id } = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const { callApi } = useApi()

  const checked = useAdminGuard()

  // State management for objectives and statistics
  const [objectifs, setObjectifs] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    totalCible: 0,
    totalValeur: 0,
    progressionGlobale: 0
  })

  /**
   * Fetches and processes logical framework data
   * Calculates global statistics and progress
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${id}/structure`)
        const data = await res.json()
        setObjectifs(data)

        let totalCible = 0
        let totalValeur = 0
        let totalIndicateurs = 0

        // Calculate totals by iterating through the hierarchical structure
        for (const obj of data) {
          for (const out of obj.outcomes || []) {
            for (const op of out.outputs || []) {
              for (const ind of op.indicateurs || []) {
                const valeur = Number(ind.valeurReelle || 0)
                const cible = Number(ind.ind_valeurCible || 0)
                totalValeur += valeur
                totalCible += cible
                totalIndicateurs++
              }
            }
          }
        }

        // Calculate global progress percentage
        const progressionGlobale = totalCible > 0
          ? Math.round((totalValeur / totalCible) * 100)
          : 0

        setStats({
          total: totalIndicateurs,
          totalCible,
          totalValeur,
          progressionGlobale
        })
      } catch (err) {
        console.error('Erreur chargement indicateurs dashboard :', err)
      }
    }

    fetchData()
  }, [id])

  // Block access if not admin
  if (!checked) return null

  return (
    <main className="min-h-screen px-6 py-10 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto">
        {/* Page header with title and back button */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-[#9F0F3A]">
              {t('dashboard_title', 'Dashboard - Suivi des indicateurs')}
            </h1>
            <button
              onClick={() => router.back()}
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea]">
              ← {t('back', 'Retour')}
            </button>
          </div>
          <div className="h-1 w-20 bg-[#9F0F3A] mt-2 rounded" />
        </div>

        {/* Statistics cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {/* Total indicators card */}
          <div className="bg-white shadow border rounded-xl p-4">
            <p className="text-sm text-gray-500">{t('dashboard_total_indicators')}</p>
            <p className="text-2xl font-bold text-[#9F0F3A]">{stats.total}</p>
          </div>
          {/* Target sum card */}
          <div className="bg-white shadow border rounded-xl p-4">
            <p className="text-sm text-gray-500">{t('dashboard_target_sum')}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalCible}</p>
          </div>
          {/* Achieved sum card */}
          <div className="bg-white shadow border rounded-xl p-4">
            <p className="text-sm text-gray-500">{t('dashboard_achieved_sum')}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalValeur}</p>
          </div>
          {/* Global progress card */}
          <div className="bg-white shadow border rounded-xl p-4">
            <p className="text-sm text-gray-500">{t('dashboard_global_progress')}</p>
            <p className="text-2xl font-bold text-green-600">{stats.progressionGlobale}%</p>
          </div>
        </div>

        {/* Objectives and indicators tables */}
        {objectifs.map((obj, i) => (
          <div key={obj.obj_id} className="mb-10">
            <h2 className="text-2xl font-bold text-[#9F0F3A] mb-4">
              Objectif {i + 1} : {obj.obj_nom}
            </h2>
            <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
              <table className="w-full text-sm">
                {/* Table header */}
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">{t('outcome')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('output')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('code')}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t('indicator')}</th>
                    <th className="px-4 py-3 text-center font-semibold">{t('target')}</th>
                    <th className="px-4 py-3 text-center font-semibold">{t('achieved')}</th>
                    <th className="px-4 py-3 text-center font-semibold">{t('progress')}</th>
                  </tr>
                </thead>
                {/* Table body with hierarchical data */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {obj.outcomes.map((out: any) =>
                    out.outputs.map((op: any) =>
                      op.indicateurs.map((ind: any) => {
                        const valeur = Number(ind.valeurReelle || 0)
                        const cible = Number(ind.ind_valeurCible || 0)
                        const percent = cible > 0 ? Math.round((valeur / cible) * 100) : 0
                        return (
                          <tr key={ind.ind_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-700">{out.out_nom}</td>
                            <td className="px-4 py-3 text-gray-700">{op.opu_nom}</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-700">{ind.ind_code}</td>
                            <td className="px-4 py-3 text-gray-800">{ind.ind_nom}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{cible}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{valeur}</td>
                            {/* Progress bar cell */}
                            <td className="px-4 py-3">
                              <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="absolute top-0 left-0 h-full bg-[#9F0F3A] text-white text-xs flex items-center justify-center transition-all duration-300 ease-out"
                                  style={{ width: `${Math.min(percent, 100)}%` }}
                                >
                                  {percent}%
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

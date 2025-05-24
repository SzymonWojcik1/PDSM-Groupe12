'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

type Cadre = {
  cad_id: number
  cad_nom: string
  cad_dateDebut: string
  cad_dateFin: string
}

export default function CadreLogiquePage() {
  const { t } = useTranslation()
  const [cadres, setCadres] = useState<Cadre[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique`)
      .then(res => res.json())
      .then(setCadres)
      .catch(err => console.error('Erreur fetch cadres logiques:', err))
  }, [])

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('fr-CH')
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('logframes_title')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('logframes_description')}</p>
            </div>
            <Link
              href="/cadre-logique/creer"
              className="text-sm text-white bg-[#9F0F3A] px-4 py-2 rounded hover:bg-[#800d30] transition"
            >
              {t('logframes_create')}
            </Link>
          </div>
        </header>

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          {cadres.length === 0 ? (
            <p className="text-gray-600">{t('logframes_none')}</p>
          ) : (
            <table className="w-full table-auto text-sm text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-500">
                  <th className="px-2 py-1">{t('column_name')}</th>
                  <th className="px-2 py-1">{t('column_start_date')}</th>
                  <th className="px-2 py-1">{t('column_end_date')}</th>
                  <th className="px-2 py-1">{t('column_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {cadres.map(cadre => (
                  <tr key={cadre.cad_id} className="bg-gray-50 rounded">
                    <td className="px-2 py-2">{cadre.cad_nom}</td>
                    <td className="px-2 py-2">{formatDate(cadre.cad_dateDebut)}</td>
                    <td className="px-2 py-2">{formatDate(cadre.cad_dateFin)}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => router.push(`/cadre-logique/${cadre.cad_id}/creer`)}
                          className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-3 py-1 rounded hover:bg-[#f4e6ea] transition"
                        >
                          {t('fill')}
                        </button>
                        <button
                          onClick={() => router.push(`/cadre-logique/${cadre.cad_id}/update`)}
                          className="text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => router.push(`/cadre-logique/${cadre.cad_id}/dashboard`)}
                          className="text-sm text-gray-700 border border-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t('confirm_delete_logframe', { name: cadre.cad_nom }))) {
                              fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${cadre.cad_id}`, {
                                method: 'DELETE'
                              }).then(() =>
                                setCadres(prev => prev.filter(c => c.cad_id !== cadre.cad_id))
                              )
                            }
                          }}
                          className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  )
}

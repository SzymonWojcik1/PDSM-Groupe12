'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

import useAdminGuard from '@/lib/hooks/useAdminGuard'
import { useApi } from '@/lib/hooks/useApi'

export default function LogsPage() {
  const { t } = useTranslation()
  const checked = useAdminGuard()
  const { callApi } = useApi()

  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLogs = async () => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/logs`)
      if (!res.ok) throw new Error('Erreur lors du chargement des logs')
      const data = await res.json()
      setLogs(data)
      setFilteredLogs(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const applyFilters = () => {
    let results = [...logs]

    if (search.trim() !== '') {
      const term = search.toLowerCase()
      results = results.filter(
        log =>
          log.action?.toLowerCase().includes(term) ||
          log.message?.toLowerCase().includes(term) ||
          log.level?.toLowerCase().includes(term)
      )
    }

    if (startDate) {
      const start = new Date(startDate)
      results = results.filter(log => new Date(log.created_at) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      results = results.filter(log => new Date(log.created_at) <= end)
    }

    setFilteredLogs(results)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [search, startDate, endDate, logs])

  if (!checked) return null

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('Logs')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4" />
          <p className="text-gray-600">Historique des actions importantes effectuées dans l’application</p>
        </header>

        <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <input
              type="text"
              placeholder="Recherche..."
              className="px-4 py-2 border border-gray-300 rounded text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-col text-sm">
              <label htmlFor="start-date" className="text-gray-600">Date début</label>
              <input
                id="start-date"
                type="date"
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label htmlFor="end-date" className="text-gray-600">Date fin</label>
              <input
                id="end-date"
                type="date"
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 text-sm text-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Utilisateur</th>
                  <th className="p-2">Niveau</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Message</th>
                  <th className="p-2">Contexte</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500">
                      Aucun log trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-2">{log.user_id || '-'}</td>
                      <td className="p-2">{log.level}</td>
                      <td className="p-2">{log.action}</td>
                      <td className="p-2">{log.message}</td>
                      <td className="p-2">
                        <pre className="whitespace-pre-wrap break-words max-w-xs">
                          {typeof log.context === 'string' ? log.context : JSON.stringify(log.context, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

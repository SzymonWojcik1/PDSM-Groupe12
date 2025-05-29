'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

import useAdminGuard from '@/lib/hooks/useAdminGuard' // Protects this page for admin only
import { useApi } from '@/lib/hooks/useApi' // Custom hook for API calls with auth headers

export default function LogsPage() {
  const { t } = useTranslation()
  const checked = useAdminGuard() // Check if the user is an admin
  const { callApi } = useApi()

  const [logs, setLogs] = useState<any[]>([]) // All logs fetched from the backend
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]) // Logs after filtering
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('') // Search input
  const [startDate, setStartDate] = useState('') // Start date for filtering
  const [endDate, setEndDate] = useState('') // End date for filtering

  // Fetch logs on initial mount
  const fetchLogs = async () => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/logs`)
      if (!res.ok) throw new Error('Erreur lors du chargement des logs')
      const data = await res.json()
      setLogs(data)
      setFilteredLogs(data) // Initialize both lists
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Filter logs based on search and date range
  const applyFilters = () => {
    let results = [...logs]

    // Search term filter
    if (search.trim() !== '') {
      const term = search.toLowerCase()
      results = results.filter(
        log =>
          log.action?.toLowerCase().includes(term) ||
          log.message?.toLowerCase().includes(term) ||
          log.level?.toLowerCase().includes(term)
      )
    }

    // Start date filter
    if (startDate) {
      const start = new Date(startDate)
      results = results.filter(log => new Date(log.created_at) >= start)
    }

    // End date filter
    if (endDate) {
      const end = new Date(endDate)
      results = results.filter(log => new Date(log.created_at) <= end)
    }

    setFilteredLogs(results)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Re-apply filters when inputs change
  useEffect(() => {
    applyFilters()
  }, [search, startDate, endDate, logs])

  if (!checked) return null // Block access if not admin

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('logs_title')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4" />
          <p className="text-gray-600">{t('logs_description')}</p>
        </header>

        {/* Filter bar */}
        <div className="bg-white border rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <input
              type="text"
              placeholder={t('logs_search_placeholder')}
              className="px-4 py-2 border border-gray-300 rounded text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-col text-sm">
              <label htmlFor="start-date" className="text-gray-600">{t('logs_start_date')}</label>
              <input
                id="start-date"
                type="date"
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col text-sm">
              <label htmlFor="end-date" className="text-gray-600">{t('logs_end_date')}</label>
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

        {/* Error message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Logs table */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 text-sm text-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">{t('logs_date')}</th>
                  <th className="p-2">{t('logs_user')}</th>
                  <th className="p-2">{t('logs_level')}</th>
                  <th className="p-2">{t('logs_action')}</th>
                  <th className="p-2">{t('logs_message')}</th>
                  <th className="p-2">{t('logs_context')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500">
                      {t('logs_none_found')}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-2">
                        {log.user_nom && log.user_prenom
                          ? `${log.user_prenom} ${log.user_nom}`
                          : log.user && log.user.prenom && log.user.nom
                            ? `${log.user.prenom} ${log.user.nom}`
                            : log.user_id || '-'}
                      </td>
                      <td className="p-2">{log.level}</td>
                      <td className="p-2">{log.action}</td>
                      <td className="p-2">{log.message}</td>
                      <td className="p-2">
                        <pre className="whitespace-pre-wrap break-words max-w-xs">
                          {typeof log.context === 'string'
                            ? log.context
                            : JSON.stringify(log.context, null, 2)}
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

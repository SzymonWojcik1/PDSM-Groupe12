'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';

// Define the shape of an activity
type Activite = {
  act_id: number;
  act_nom: string;
  act_dateDebut: string;
  act_dateFin: string;
  partenaire: { part_nom: string; part_id: number };
};

// Define the shape of a partner
type Partenaire = {
  part_id: number;
  part_nom: string;
};

export default function DashboardActivitesPage() {
  const { t } = useTranslation(); // Used for translation
  useAuthGuard(); // Protects the page (requires authentication)
  const { callApi } = useApi(); // Custom hook to call the API

  // State variables
  const [activites, setActivites] = useState<Activite[]>([]);
  const [filteredActivites, setFilteredActivites] = useState<Activite[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [filters, setFilters] = useState({
    partenaire: '',
    periode: '',
    dateDebut: '',
    dateFin: '',
  });

  // Fetch all activities and partners on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actRes, partRes] = await Promise.all([
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites`),
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`),
        ]);
        const [actData, partData] = await Promise.all([
          actRes.json(),
          partRes.json(),
        ]);
        setActivites(actData);
        setPartenaires(partData);
        setFilteredActivites(actData);
      } catch (error) {
        console.error('Erreur chargement données', error);
      }
    };

    fetchData();
  }, [callApi]);

  // Apply filters every time filters or activities change
  useEffect(() => {
    let result = [...activites];
    const today = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD

    // Filter by partner
    if (filters.partenaire) {
      result = result.filter(a => a.partenaire?.part_id.toString() === filters.partenaire);
    }

    // Filter by time period
    if (filters.periode === 'passee') {
      result = result.filter(a => a.act_dateFin < today);
    } else if (filters.periode === 'encours') {
      result = result.filter(a =>
        a.act_dateDebut <= today && a.act_dateFin >= today
      );
    } else if (filters.periode === 'avenir') {
      result = result.filter(a => a.act_dateDebut > today);
    }

    // Filter by start and end date
    if (filters.dateDebut) {
      result = result.filter(a => a.act_dateDebut >= filters.dateDebut);
    }
    if (filters.dateFin) {
      result = result.filter(a => a.act_dateFin <= filters.dateFin);
    }

    setFilteredActivites(result);
  }, [filters, activites]);

  // Today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Count activities per period
  const countByPeriode = {
    passees: filteredActivites.filter(a => a.act_dateFin < today).length,
    encours: filteredActivites.filter(a =>
      a.act_dateDebut <= today && a.act_dateFin >= today
    ).length,
    aVenir: filteredActivites.filter(a => a.act_dateDebut > today).length,
  };

  // Prepare data for pie chart
  const periodeData = [
    { name: t('past'), value: countByPeriode.passees },
    { name: t('ongoing'), value: countByPeriode.encours },
    { name: t('upcoming'), value: countByPeriode.aVenir },
  ];
  const periodeColors = ['#16a34a', '#eab308', '#2563eb']; // Colors for each period

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('activities_dashboard')}</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
          >
            {t('back_to_list')}
          </button>
        </header>

        {/* Summary statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">{filteredActivites.length}</p>
            <p className="text-sm text-gray-600 mt-1">{t('filtered_activities')}</p>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{countByPeriode.passees}</p>
            <p className="text-sm text-gray-600 mt-1">{t('past')}</p>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{countByPeriode.encours}</p>
            <p className="text-sm text-gray-600 mt-1">{t('ongoing')}</p>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{countByPeriode.aVenir}</p>
            <p className="text-sm text-gray-600 mt-1">{t('upcoming')}</p>
          </div>
        </div>

        {/* Filter section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Partner filter */}
          <select
            name="partenaire"
            value={filters.partenaire}
            onChange={e => setFilters(prev => ({ ...prev, partenaire: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">{t('all_partners')}</option>
            {partenaires.map(p => (
              <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
            ))}
          </select>

          {/* Period filter */}
          <select
            name="periode"
            value={filters.periode}
            onChange={e => setFilters(prev => ({ ...prev, periode: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">{t('all_periods')}</option>
            <option value="passee">{t('past')}</option>
            <option value="encours">{t('ongoing')}</option>
            <option value="avenir">{t('upcoming')}</option>
          </select>

          {/* Date range filter */}
          <div className="flex gap-2">
            <input
              type="date"
              name="dateDebut"
              value={filters.dateDebut}
              onChange={e => setFilters(prev => ({ ...prev, dateDebut: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <input
              type="date"
              name="dateFin"
              value={filters.dateFin}
              onChange={e => setFilters(prev => ({ ...prev, dateFin: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Reset filters */}
        <div className="mb-6">
          <button
            onClick={() =>
              setFilters({ partenaire: '', periode: '', dateDebut: '', dateFin: '' })
            }
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
          >
            {t('reset_filters')}
          </button>
        </div>

        {/* Pie chart showing distribution by period */}
        <section className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#9F0F3A] mb-4">{t('period_distribution')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={periodeData}
                cx="50%"
                cy="50%"
                label
                outerRadius={90}
                dataKey="value"
              >
                {periodeData.map((_, i) => (
                  <Cell key={i} fill={periodeColors[i % periodeColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        {/* Activities table */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('activities_list')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">{t('table_name')}</th>
                  <th className="px-4 py-2">{t('table_start')}</th>
                  <th className="px-4 py-2">{t('table_end')}</th>
                  <th className="px-4 py-2">{t('table_partner')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivites.map(a => (
                  <tr key={a.act_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{a.act_nom}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{a.act_dateDebut}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{a.act_dateFin}</td>
                    <td className="px-4 py-2">{a.partenaire?.part_nom}</td>
                  </tr>
                ))}
                {filteredActivites.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center px-4 py-6 text-gray-500">
                      {t('no_activities_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

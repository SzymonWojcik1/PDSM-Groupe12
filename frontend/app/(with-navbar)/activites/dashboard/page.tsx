'use client';

import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

type Activite = {
  act_id: number;
  act_nom: string;
  act_dateDebut: string;
  act_dateFin: string;
  partenaire: { part_nom: string; part_id: number };
};

type Partenaire = {
  part_id: number;
  part_nom: string;
};

export default function DashboardActivitesPage() {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [filteredActivites, setFilteredActivites] = useState<Activite[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [filters, setFilters] = useState({
    partenaire: '',
    periode: '',
    dateDebut: '',
    dateFin: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [actRes, partRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites`),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
    ]);
    const [actData, partData] = await Promise.all([
      actRes.json(),
      partRes.json()
    ]);
    setActivites(actData);
    setPartenaires(partData);
    setFilteredActivites(actData);
  };

  useEffect(() => {
    let result = [...activites];
    const today = new Date().toISOString().split('T')[0];

    if (filters.partenaire) {
      result = result.filter(a => a.partenaire?.part_id.toString() === filters.partenaire);
    }

    if (filters.periode === 'passee') {
      result = result.filter(a => a.act_dateFin < today);
    } else if (filters.periode === 'encours') {
      result = result.filter(a =>
        a.act_dateDebut <= today && a.act_dateFin >= today
      );
    } else if (filters.periode === 'avenir') {
      result = result.filter(a => a.act_dateDebut > today);
    }

    if (filters.dateDebut) {
      result = result.filter(a => a.act_dateDebut >= filters.dateDebut);
    }
    if (filters.dateFin) {
      result = result.filter(a => a.act_dateFin <= filters.dateFin);
    }

    setFilteredActivites(result);
  }, [filters, activites]);

  const today = new Date().toISOString().split('T')[0];

  const countByPeriode = {
    passees: filteredActivites.filter(a => a.act_dateFin < today).length,
    encours: filteredActivites.filter(a =>
      a.act_dateDebut <= today && a.act_dateFin >= today
    ).length,
    aVenir: filteredActivites.filter(a => a.act_dateDebut > today).length,
  };

  const periodeData = [
    { name: 'Passées', value: countByPeriode.passees },
    { name: 'En cours', value: countByPeriode.encours },
    { name: 'À venir', value: countByPeriode.aVenir },
  ];
  const periodeColors = ['#16a34a', '#eab308', '#2563eb'];

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Dashboard des activités</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
          >
            ← Retour à la liste
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">{filteredActivites.length}</p>
            <p className="text-sm text-gray-600 mt-1">Activités filtrées</p>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{countByPeriode.passees}</p>
            <p className="text-sm text-gray-600 mt-1">Passées</p>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{countByPeriode.encours}</p>
            <p className="text-sm text-gray-600 mt-1">En cours</p>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{countByPeriode.aVenir}</p>
            <p className="text-sm text-gray-600 mt-1">À venir</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            name="partenaire"
            value={filters.partenaire}
            onChange={e => setFilters(prev => ({ ...prev, partenaire: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Tous les partenaires</option>
            {partenaires.map(p => (
              <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
            ))}
          </select>

          <select
            name="periode"
            value={filters.periode}
            onChange={e => setFilters(prev => ({ ...prev, periode: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">Toutes les périodes</option>
            <option value="passee">Passées</option>
            <option value="encours">En cours</option>
            <option value="avenir">À venir</option>
          </select>

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

        <div className="mb-6">
          <button
            onClick={() =>
              setFilters({ partenaire: '', periode: '', dateDebut: '', dateFin: '' })
            }
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
          >
            Réinitialiser les filtres
          </button>
        </div>

        {/* GRAPHIQUE PIE */}
        <section className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#9F0F3A] mb-4">Répartition par période</h2>
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

        {/* TABLE */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">Liste des activités</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Début</th>
                  <th className="px-4 py-2">Fin</th>
                  <th className="px-4 py-2">Partenaire</th>
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
                      Aucune activité trouvée.
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

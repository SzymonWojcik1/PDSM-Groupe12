'use client';

import { useEffect, useState } from 'react';

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
    fetchActivites();
    fetchPartenaires();
  }, []);

  const fetchActivites = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites`);
    const data = await res.json();
    setActivites(data);
    setFilteredActivites(data);
  };

  const fetchPartenaires = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`);
    const data = await res.json();
    setPartenaires(data);
  };

  useEffect(() => {
    let result = [...activites];
    const today = new Date().toISOString().split('T')[0];

    if (filters.partenaire) {
      result = result.filter(
        a => a.partenaire?.part_id.toString() === filters.partenaire
      );
    }

    if (filters.periode === 'passee') {
      result = result.filter(a => a.act_dateFin < today);
    } else if (filters.periode === 'encours') {
      result = result.filter(
        a => a.act_dateDebut <= today && a.act_dateFin >= today
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

  const countByPeriode = {
    passees: activites.filter(a => a.act_dateFin < new Date().toISOString().split('T')[0]).length,
    encours: activites.filter(a =>
      a.act_dateDebut <= new Date().toISOString().split('T')[0] &&
      a.act_dateFin >= new Date().toISOString().split('T')[0]
    ).length,
    aVenir: activites.filter(a => a.act_dateDebut > new Date().toISOString().split('T')[0]).length,
  };

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <h1 className="text-3xl font-bold mb-6">Dashboard Activités</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-100 p-4 rounded shadow text-center">
          <p className="text-2xl font-bold">{activites.length}</p>
          <p className="text-sm text-gray-600">Activités totales</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <p className="text-2xl font-bold">{countByPeriode.passees}</p>
          <p className="text-sm text-gray-600">Passées</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <p className="text-2xl font-bold">{countByPeriode.encours}</p>
          <p className="text-sm text-gray-600">En cours</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <p className="text-2xl font-bold">{countByPeriode.aVenir}</p>
          <p className="text-sm text-gray-600">À venir</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          name="partenaire"
          value={filters.partenaire}
          onChange={e => setFilters(prev => ({ ...prev, partenaire: e.target.value }))}
          className="border p-2 rounded text-gray-800"
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
          className="border p-2 rounded text-gray-800"
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
            className="border p-2 rounded text-gray-800"
            placeholder="Date début"
          />
          <input
            type="date"
            name="dateFin"
            value={filters.dateFin}
            onChange={e => setFilters(prev => ({ ...prev, dateFin: e.target.value }))}
            className="border p-2 rounded text-gray-800"
            placeholder="Date fin"
          />
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setFilters({ partenaire: '', periode: '', dateDebut: '', dateFin: '' })}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          Réinitialiser tous les filtres
        </button>
      </div>

      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nom</th>
            <th className="p-2">Début</th>
            <th className="p-2">Fin</th>
            <th className="p-2">Partenaire</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivites.map(a => (
            <tr key={a.act_id} className="border-t">
              <td className="p-2">{a.act_nom}</td>
              <td className="p-2">{a.act_dateDebut}</td>
              <td className="p-2">{a.act_dateFin}</td>
              <td className="p-2">{a.partenaire?.part_nom}</td>
            </tr>
          ))}
          {filteredActivites.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-4 text-gray-500">
                Aucune activité trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaFileExport } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

type Activite = {
  act_id: number;
  act_nom: string;
  act_dateDebut: string;
  act_dateFin: string;
  partenaire: { part_nom: string; part_id: number };
  projet: { pro_nom: string; pro_id: number };
};

type Partenaire = {
  part_id: number;
  part_nom: string;
};

type Projet = {
  pro_id: number;
  pro_nom: string;
};

export default function ActivitesPage() {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [filteredActivites, setFilteredActivites] = useState<Activite[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    partenaire: '',
    projet: '',
  });

  const fetchPartenaires = async () => {
    const res = await fetch('http://localhost:8000/api/partenaires');
    const data = await res.json();
    setPartenaires(data);
  };

  const fetchProjets = async () => {
    const res = await fetch('http://localhost:8000/api/projets');
    const data = await res.json();
    setProjets(data);
  };

  const fetchActivites = async () => {
    const res = await fetch('http://localhost:8000/api/activites');
    const data = await res.json();
    setActivites(data);
    setFilteredActivites(data);
  };

  const deleteActivite = async (id: number) => {
    await fetch(`http://localhost:8000/api/activites/${id}`, {
      method: 'DELETE',
    });
    fetchActivites();
  };

  useEffect(() => {
    fetchActivites();
    fetchPartenaires();
    fetchProjets();
  }, []);

  useEffect(() => {
    let result = [...activites];
    if (filters.search) {
      result = result.filter(a =>
        a.act_nom.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.partenaire) {
      result = result.filter(a =>
        a.partenaire?.part_id.toString() === filters.partenaire
      );
    }
    if (filters.projet) {
      result = result.filter(a =>
        a.projet?.pro_id.toString() === filters.projet
      );
    }
    setFilteredActivites(result);
  }, [filters, activites]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      partenaire: '',
      projet: '',
    });
  };

  const handleExport = () => {
    const dataToExport = filteredActivites.map(a => ({
      Nom: a.act_nom,
      'Date de début': a.act_dateDebut,
      'Date de fin': a.act_dateFin,
      Partenaire: a.partenaire?.part_nom || '',
      Projet: a.projet?.pro_nom || ''
    }));

    type ExportRow = {
      Nom: string;
      'Date de début': string;
      'Date de fin': string;
      Partenaire: string;
      Projet: string;
    };

    const headers = ['Nom', 'Date de début', 'Date de fin', 'Partenaire', 'Projet'] as const;
    const csv = [
      headers.join(','),
      ...dataToExport.map(row => headers.map(header => (row as ExportRow)[header]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'activites.csv';
    link.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/api/activites/import', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.status === 207 && result.fichier_erreurs) {
      alert(result.message + '\\nUn fichier d’erreurs sera téléchargé.');
      window.open(result.fichier_erreurs, '_blank');
    } else if (response.ok) {
      alert(result.message);
    } else {
      alert(result.message || 'Erreur lors de l’import.');
    }

    fetchActivites();
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Liste des activités</h1>

      <div className="flex gap-4 mb-4">
        <Link href="/activites/creer">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Créer une activité
          </button>
        </Link>

        <button
          onClick={handleExport}
          className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-600 inline-flex items-center shadow-sm font-medium text-sm"
        >
          <FaFileExport className="mr-2 text-lg" />
          Exporter
        </button>

        <button
          onClick={() => window.open('http://localhost:8000/modele-import-activites', '_blank')}
          className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 inline-flex items-center shadow-sm font-medium text-sm"
        >
          Télécharger modèle de base
        </button>

        <input
          type="file"
          accept=".csv"
          id="import-file"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => document.getElementById('import-file')?.click()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 inline-flex items-center shadow-sm font-medium text-sm"
        >
          Importer un fichier CSV
        </button>

        <Link href="/activites/dashboard">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Accéder au dashboard
          </button>
        </Link>
        
      </div>

      <div className="w-full max-w-4xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            name="search"
            placeholder="Rechercher par nom..."
            value={filters.search}
            onChange={handleFilterChange}
            className="border p-2 rounded text-gray-800 placeholder-gray-500"
          />

          <select
            name="partenaire"
            value={filters.partenaire}
            onChange={handleFilterChange}
            className="border p-2 rounded text-gray-800"
          >
            <option value="" className="text-gray-800">Tous les partenaires</option>
            {partenaires.map(p => (
              <option key={p.part_id} value={p.part_id} className="text-gray-800">
                {p.part_nom}
              </option>
            ))}
          </select>

          <select
            name="projet"
            value={filters.projet}
            onChange={handleFilterChange}
            className="border p-2 rounded text-gray-800"
          >
            <option value="" className="text-gray-800">Tous les projets</option>
            {projets.map(p => (
              <option key={p.pro_id} value={p.pro_id} className="text-gray-800">
                {p.pro_nom}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <table className="w-full max-w-4xl border border-gray-200 text-black">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nom</th>
            <th className="p-2">Début</th>
            <th className="p-2">Fin</th>
            <th className="p-2">Partenaire</th>
            <th className="p-2">Projet</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivites.map((a) => (
            <tr key={a.act_id} className="border-t">
              <td className="p-2">{a.act_nom}</td>
              <td className="p-2">{a.act_dateDebut}</td>
              <td className="p-2">{a.act_dateFin}</td>
              <td className="p-2">{a.partenaire?.part_nom}</td>
              <td className="p-2">{a.projet?.pro_nom}</td>
              <td className="p-2 flex gap-2">
                <Link href={`/activites/${a.act_id}/ajouter-beneficiaire`}>
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    Ajouter Bénéficiaires
                  </button>
                </Link>
                <Link href={`/activites/${a.act_id}/update`}>
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    Modifier
                  </button>
                </Link>
                <button
                  onClick={() => deleteActivite(a.act_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {filteredActivites.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center p-4 text-gray-500">
                Aucune activité trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
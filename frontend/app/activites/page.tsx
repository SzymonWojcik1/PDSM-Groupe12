'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Activite = {
  act_id: number;
  act_nom: string;
  act_dateDebut: string;
  act_dateFin: string;
  partenaire: { part_nom: string };
  projet: { pro_nom: string };
};

export default function ActivitesPage() {
  const [activites, setActivites] = useState<Activite[]>([]);

  const fetchActivites = async () => {
    const res = await fetch('http://localhost:8000/api/activites');
    const data = await res.json();
    setActivites(data);
  };

  const deleteActivite = async (id: number) => {
    await fetch(`http://localhost:8000/api/activites/${id}`, {
      method: 'DELETE',
    });
    fetchActivites();
  };

  useEffect(() => {
    fetchActivites();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Liste des activités</h1>

      <Link href="/activites/creer">
        <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Créer une activité
        </button>
      </Link>

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
          {activites.map((a) => (
            <tr key={a.act_id} className="border-t">
              <td className="p-2">{a.act_nom}</td>
              <td className="p-2">{a.act_dateDebut}</td>
              <td className="p-2">{a.act_dateFin}</td>
              <td className="p-2">{a.partenaire?.part_nom}</td>
              <td className="p-2">{a.projet?.pro_nom}</td>
              <td className="p-2 flex gap-2">
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
          {activites.length === 0 && (
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

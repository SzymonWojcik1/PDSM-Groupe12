'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CadreLogique = {
  cad_id: number;
  cad_nom: string;
  cad_dateDebut: string;
  cad_dateFin: string;
};

export default function CadreLogiquePage() {
  const [cadres, setCadres] = useState<CadreLogique[]>([]);
  const router = useRouter();

  const fetchCadresLogiques = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique`)
      .then(res => res.json())
      .then(setCadres)
      .catch(err => console.error('Erreur fetch cadre logique:', err));
  };

  useEffect(() => {
    fetchCadresLogiques();
  }, []);

  const handleDelete = async (id: number, nom: string) => {
    if (confirm(`Veux-tu vraiment supprimer le cadre logique "${nom}" ?`)) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${id}`, {
        method: 'DELETE',
      });

      fetchCadresLogiques(); // Recharge la liste après suppression
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Attention : janvier = 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <main className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          onClick={() => router.push('/cadre-logique/creer')}
        >
          Ajouter un cadre logique
        </button>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
          onClick={() => router.push('/activite-indicateur/lier')}
        >
          Lier activité à indicateur
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">Liste des cadres logiques</h1>

      {cadres.length === 0 ? (
        <p>Aucun cadre logique trouvé.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Nom</th>
                <th className="border px-2 py-1">Date de début</th>
                <th className="border px-2 py-1">Date de fin</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cadres.map((cadre) => (
                <tr key={cadre.cad_id}>
                  <td className="border px-2 py-1">{cadre.cad_nom}</td>
                  <td className="border px-2 py-1">{formatDate(cadre.cad_dateDebut)}</td>
                  <td className="border px-2 py-1">{formatDate(cadre.cad_dateFin)}</td>
                  <td className="border px-2 py-1 text-center space-x-2">
                    <button
                      onClick={() => router.push(`/cadre-logique/${cadre.cad_id}/objectif-general`)}
                      className="text-green-600 hover:underline"
                    >
                      Objectif général
                    </button>
                    
                    <button
                      onClick={() => router.push(`/cadre-logique/${cadre.cad_id}/update`)}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDelete(cadre.cad_id, cadre.cad_nom)}
                      className="text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
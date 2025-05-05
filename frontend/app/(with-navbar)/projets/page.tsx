'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Projet = {
  pro_id: number;
  pro_nom: string;
  pro_dateDebut: string;
  pro_dateFin: string;
  partenaire: {
    part_nom: string;
  };
};

export default function ProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([]);

  const fetchProjets = async () => {
    const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/projets');
    const data = await res.json();
    setProjets(data);
  };

  const deleteProjet = async (id: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projets/${id}`, {
      method: 'DELETE',
    });
    fetchProjets();
  };

  useEffect(() => {
    fetchProjets();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold mb-4 text-black">Liste des projets</h1>

        <Link href="/projets/creer">
          <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Créer un projet
          </button>
        </Link>

        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left text-black">Nom</th>
              <th className="p-2 text-left text-black">Début</th>
              <th className="p-2 text-left text-black">Fin</th>
              <th className="p-2 text-left text-black">Partenaire</th>
              <th className="p-2 text-left text-black">Action</th>
            </tr>
          </thead>
          <tbody>
            {projets.map((projet) => (
              <tr key={projet.pro_id} className="border-t">
                <td className="p-2 text-black">{projet.pro_nom}</td>
                <td className="p-2 text-black">{projet.pro_dateDebut}</td>
                <td className="p-2 text-black">{projet.pro_dateFin}</td>
                <td className="p-2 text-black">{projet.partenaire?.part_nom}</td>
                <td className="p-2 flex gap-2">
                    <button onClick={() => deleteProjet(projet.pro_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Supprimer
                    </button>
                    <Link href={`/projets/${projet.pro_id}/update`}>
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                        Modifier
                        </button>
                    </Link>
                </td>
              </tr>
            ))}
            {projets.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  Aucun projet trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

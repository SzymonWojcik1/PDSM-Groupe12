'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Partenaire = {
  part_id: number;
  part_nom: string;
  part_pays: string;
  part_region: string;
};

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);

  //Récupérer les partenaires depuis le backend
  const fetchPartenaires = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`);
    const data = await res.json();
    setPartenaires(data);
  };

  //Supprimer un partenaire
  const deletePartenaire = async (id: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires/${id}`, {
      method: 'DELETE',
    });
    fetchPartenaires(); //Recharger la liste
  };

  useEffect(() => {
    fetchPartenaires();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-black">Liste des partenaires</h1>

        <Link href="/partenaires/creer">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Créer un partenaire
            </button>
        </Link>

        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 text-black">Nom</th>
              <th className="text-left p-2 text-black">Pays</th>
              <th className="text-left p-2 text-black">Région</th>
              <th className="text-left p-2 text-black">Action</th>
            </tr>
          </thead>
          <tbody>
            {partenaires.map((partenaire) => (
              <tr key={partenaire.part_id} className="border-t">
                <td className="p-2 text-black">{partenaire.part_nom}</td>
                <td className="p-2 text-black">{partenaire.part_pays}</td>
                <td className="p-2 text-black">{partenaire.part_region}</td>
                <td className="p-2 text-black">
                    <div className="flex gap-2">
                        <button
                        onClick={() => deletePartenaire(partenaire.part_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Supprimer
                        </button>
                        <Link href={`/partenaires/${partenaire.part_id}/update`}>
                            <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-yellow-600 ml-2">
                                Modifier
                            </button>
                        </Link>
                    </div>
                    </td>

              </tr>
            ))}
            {partenaires.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  Aucun partenaire trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

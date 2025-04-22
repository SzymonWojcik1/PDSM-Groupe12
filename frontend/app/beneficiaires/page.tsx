'use client';

import { enumsShow } from '@/lib/enumsShow'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Beneficiaire = {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string;
  region: string;
  pays: string;
  type: string;
  type_autre: string | null;
  zone: string;
  sexe: string;
  sexe_autre: string | null;
  genre: string | null;
  genre_autre: string | null;
  ethnicite: string;
};

type EnumMap = Record<string, { value: string; label: string }[]>;

export default function BeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [enums, setEnums] = useState<EnumMap>({});
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/beneficiaires')
      .then((res) => res.json())
      .then(setBeneficiaires)
      .catch((err) => console.error('Erreur fetch bénéficiaires:', err));
  }, []);
  useEffect(() => {
    fetch('http://localhost:8000/api/enums?locale=en')
      .then((res) => res.json())
      .then(setEnums)
      .catch((err) => console.error('Erreur fetch enums:', err));
  }, []);

  return (
    <main className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          onClick={() => router.push('/beneficiaires/add')}
        >
          Ajouter un bénéficiaire
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
          onClick={() => router.push('/beneficiaires/delete')}
        >
          Supprimer un bénéficiaire
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">Liste des bénéficiaires</h1>

      {beneficiaires.length === 0 ? (
        <p>Aucun bénéficiaire trouvé.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Prénom</th>
              <th className="border px-2 py-1">Nom</th>
              <th className="border px-2 py-1">Naissance</th>
              <th className="border px-2 py-1">Région</th>
              <th className="border px-2 py-1">Pays</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Zone</th>
              <th className="border px-2 py-1">Sexe</th>
              <th className="border px-2 py-1">Genre</th>
              <th className="border px-2 py-1">Ethnicité</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaires.map((b) => (
              <tr key={b.id}>
                <td className="border px-2 py-1">{b.prenom}</td>
                <td className="border px-2 py-1">{b.nom}</td>
                <td className="border px-2 py-1">{b.date_naissance}</td>
                <td className="border px-2 py-1">{b.region}</td>
                <td className="border px-2 py-1">{b.pays}</td>
                <td className="border px-2 py-1">
                  {b.type === 'other' ? b.type_autre || '-' : enumsShow(enums, 'type', b.type)}
                </td>
                <td className="border px-2 py-1">{enumsShow(enums, 'zone', b.zone)}</td>
                <td className="border px-2 py-1">
                  {b.sexe === 'other' ? b.sexe_autre || '-' : enumsShow(enums, 'sexe', b.sexe)}
                </td>
                <td className="border px-2 py-1">
                  {b.genre === 'other' ? b.genre_autre || '-' : enumsShow(enums, 'genre', b.genre || '')}
                </td>
                <td className="border px-2 py-1">{b.ethnicite}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
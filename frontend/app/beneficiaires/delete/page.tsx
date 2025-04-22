'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enumsShow } from '@/lib/enumsShow';

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

export default function SupprimerBeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enums, setEnums] = useState<EnumMap>({});
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/beneficiaires')
      .then((res) => res.json())
      .then(setBeneficiaires)
      .catch((err) => console.error('Erreur chargement:', err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/api/enums?locale=en')
      .then((res) => res.json())
      .then(setEnums)
      .catch((err) => console.error('Erreur enums:', err));
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    const confirmed = confirm('Confirmer la suppression des bénéficiaires sélectionnés ?');
    if (!confirmed) return;

    for (const id of selectedIds) {
      await fetch(`http://localhost:8000/api/beneficiaires/${id}`, {
        method: 'DELETE',
      });
    }

    setBeneficiaires((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
    setSelectedIds([]);
  };

  return (
    <main className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 rounded text-white ${
            selectedIds.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Supprimer la sélection
        </button>
        <button
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-800"
          onClick={() => router.push('/beneficiaires')}
        >
          Retour
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">Supprimer des bénéficiaires</h1>

      {beneficiaires.length === 0 ? (
        <p>Aucun bénéficiaire trouvé.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">X</th>
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
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(b.id)}
                      onChange={() => toggleSelection(b.id)}
                    />
                  </td>
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
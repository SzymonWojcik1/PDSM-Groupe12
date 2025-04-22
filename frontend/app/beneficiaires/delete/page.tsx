'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enumsShow } from '@/lib/enumsShow';

type Beneficiaire = {
  ben_id: string;
  ben_prenom: string;
  ben_nom: string;
  ben_date_naissance: string;
  ben_region: string;
  ben_pays: string;
  ben_type: string;
  ben_type_autre: string | null;
  ben_zone: string;
  ben_sexe: string;
  ben_sexe_autre: string | null;
  ben_genre: string | null;
  ben_genre_autre: string | null;
  ben_ethnicite: string;
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

    setBeneficiaires((prev) => prev.filter((b) => !selectedIds.includes(b.ben_id)));
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
                <tr key={b.ben_id}>
                  <td className="border px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(b.ben_id)}
                      onChange={() => toggleSelection(b.ben_id)}
                    />
                  </td>
                  <td className="border px-2 py-1">{b.ben_prenom}</td>
                  <td className="border px-2 py-1">{b.ben_nom}</td>
                  <td className="border px-2 py-1">{b.ben_date_naissance}</td>
                  <td className="border px-2 py-1">{b.ben_region}</td>
                  <td className="border px-2 py-1">{b.ben_pays}</td>
                  <td className="border px-2 py-1">
                    {b.ben_type === 'other'
                      ? b.ben_type_autre || '-'
                      : enumsShow(enums, 'type', b.ben_type)}
                  </td>
                  <td className="border px-2 py-1">{enumsShow(enums, 'zone', b.ben_zone)}</td>
                  <td className="border px-2 py-1">
                    {b.ben_sexe === 'other'
                      ? b.ben_sexe_autre || '-'
                      : enumsShow(enums, 'sexe', b.ben_sexe)}
                  </td>
                  <td className="border px-2 py-1">
                    {b.ben_genre === 'other'
                      ? b.ben_genre_autre || '-'
                      : enumsShow(enums, 'genre', b.ben_genre || '')}
                  </td>
                  <td className="border px-2 py-1">{b.ben_ethnicite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
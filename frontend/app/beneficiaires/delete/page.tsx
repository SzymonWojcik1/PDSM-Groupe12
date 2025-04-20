'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Beneficiaire = {
  id: string;
  nom: string;
  prenom: string;
  pays: string;
  zone_label: string;
};

export default function SupprimerBeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/beneficiaires')
      .then(res => res.json())
      .then(setBeneficiaires)
      .catch((err) => console.error('Erreur chargement:', err));
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
      <h1 className="text-xl font-bold mb-4">Supprimer des bénéficiaires</h1>

      <div className="flex gap-4 mb-4">
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
          onClick={()=> router.push('/beneficiaires')}
        >
          Back
        </button>
      </div>

      {beneficiaires.length === 0 ? (
        <p>Aucun bénéficiaire trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {beneficiaires.map((b) => (
            <li key={b.id} className="border p-4 rounded flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.includes(b.id)}
                onChange={() => toggleSelection(b.id)}
              />
              <div>
                <p><strong>Nom :</strong> {b.nom}</p>
                <p><strong>Prénom :</strong> {b.prenom}</p>
                <p><strong>Pays :</strong> {b.pays}</p>
                <p><strong>Zone :</strong> {b.zone_label}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

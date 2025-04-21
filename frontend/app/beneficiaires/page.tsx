'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'

type Beneficiaire = {
  id: string;
  nom: string;
  prenom: string;
  pays: string;
  zone_label: string;
};

export default function BeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/beneficiaires')
      .then((res) => res.json())
      .then(setBeneficiaires)
      .catch((err) => console.error('Erreur fetch bénéficiaires:', err));
  }, []);

  return (
    <main className="p-4">
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
          Supprimer un bénéficiiaire
        </button>
      </div>

      <h1 className="text-xl font-semibold mb-4">Liste des bénéficiaires</h1>
      {beneficiaires.length === 0 ? (
        <p>Aucun bénéficiaire trouvé.</p>
      ) : (
        <ul>
          {beneficiaires.map((b) => (
            <li key={b.id} className="mb-3 border p-3 rounded">
              <p><strong>Nom :</strong> {b.nom}</p>
              <p><strong>Prénom :</strong> {b.prenom}</p>
              <p><strong>Pays :</strong> {b.pays}</p>
              <p><strong>Zone :</strong> {b.zone_label}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
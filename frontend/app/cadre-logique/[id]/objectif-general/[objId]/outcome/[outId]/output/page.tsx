'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Output = {
  opu_id: number;
  out_id: number;
  opu_code: string;
  opu_nom: string;
  created_at: string;
  updated_at: string;
};

type Outcome = {
  out_id: number;
  out_nom: string;
};

export default function OutputPage() {
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;
  const objId = params?.objId;
  const outId = params?.outId;

  const fetchOutputs = () => {
    fetch(`http://localhost:8000/api/outputs?out_id=${outId}`)
      .then(res => res.json())
      .then(setOutputs)
      .catch(err => console.error('Erreur fetch outputs:', err));
  };

  useEffect(() => {
    fetchOutputs();

    // Récupérer les informations de l'outcome
    fetch(`http://localhost:8000/api/outcomes/${outId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Réponse API outcome:', data);
        if (data && typeof data === 'object') {
          setOutcome(data);
        } else {
          console.error('Format de données invalide pour l\'outcome:', data);
        }
      })
      .catch(err => {
        console.error('Erreur fetch outcome:', err);
        setOutcome(null);
      });
  }, [outId]);

  const handleDelete = async (id: number, nom: string) => {
    if (confirm(`Voulez-vous vraiment supprimer l'output "${nom}" ?`)) {
      await fetch(`http://localhost:8000/api/outputs/${id}`, {
        method: 'DELETE',
      });

      fetchOutputs(); // Recharge la liste après suppression
    }
  };

  return (
    <main className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outId}/output/creer`)}
        >
          Ajouter un output
        </button>
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome`)}
        >
          Retour aux outcomes
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        Liste des outputs {outcome && `/ ${outcome.out_nom}`}
      </h1>

      {outputs.length === 0 ? (
        <p>Aucun output trouvé.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Code</th>
                <th className="border px-2 py-1">Nom</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outputs.map((output) => (
                <tr key={output.opu_id}>
                  <td className="border px-2 py-1">{output.opu_code}</td>
                  <td className="border px-2 py-1">{output.opu_nom}</td>
                  <td className="border px-2 py-1 text-center space-x-2">
                    
                    <button
                      onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outId}/output/${output.opu_id}/update`)}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(output.opu_id, output.opu_nom)}
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
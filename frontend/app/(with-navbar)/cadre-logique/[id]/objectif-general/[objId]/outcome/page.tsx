'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Outcome = {
  out_id: number;
  out_nom: string;
  obj_id: number;
};

type ObjectifGeneral = {
  obj_id: number;
  obj_nom: string;
};

type Indicateur = {
  ind_id: number;
  out_id: number;
  opu_id: number | null;
  ind_code: string;
  ind_nom: string;
  ind_valeurCible: string;
  beneficiaireCount?: number;
};

export default function OutcomePage() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [objectifGeneral, setObjectifGeneral] = useState<ObjectifGeneral | null>(null);
  const [indicateurs, setIndicateurs] = useState<{ [key: number]: Indicateur[] }>({});
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;
  const objId = params?.objId;

  const fetchOutcomes = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/outcomes?obj_id=${objId}`)
      .then(res => res.json())
      .then(data => {
        setOutcomes(data);
        data.forEach((outcome: Outcome) => {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateurs?out_id=${outcome.out_id}`)
            .then(res => res.json())
            .then(async (indData) => {
              const indicateursWithCounts = await Promise.all(
                indData.map(async (ind: Indicateur) => {
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateur/${ind.ind_id}/beneficiaires-count`);
                    const json = await res.json();
                    return { ...ind, beneficiaireCount: json.count };
                  } catch (err) {
                    console.error("Erreur fetch count bénéficiaires :", err);
                    return { ...ind, beneficiaireCount: 0 };
                  }
                })
              );

              setIndicateurs(prev => ({
                ...prev,
                [outcome.out_id]: indicateursWithCounts
              }));
            })
            .catch(err => console.error('Erreur fetch indicateurs:', err));
        });
      })
      .catch(err => console.error('Erreur fetch outcomes:', err));
  };

  useEffect(() => {
    fetchOutcomes();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/objectifs-generaux/${objId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object') {
          setObjectifGeneral(data);
        } else {
          console.error("Format de données invalide pour l'objectif général:", data);
        }
      })
      .catch(err => {
        console.error('Erreur fetch objectif général:', err);
        setObjectifGeneral(null);
      });
  }, [objId]);

  const handleDelete = async (id: number, nom: string) => {
    if (confirm(`Voulez-vous vraiment supprimer l'outcome "${nom}" ?`)) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outcomes/${id}`, {
        method: 'DELETE',
      });
      fetchOutcomes();
    }
  };

  const handleDeleteIndicateur = async (indId: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet indicateur ?")) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateurs/${indId}`, {
        method: 'DELETE',
      });
      fetchOutcomes();
    }
  };

  return (
    <main className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/creer`)}
        >
          Ajouter un outcome
        </button>
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general`)}
        >
          Retour aux objectifs généraux
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        Liste des outcomes {objectifGeneral && `/ ${objectifGeneral.obj_nom}`}
      </h1>

      {outcomes.length === 0 ? (
        <p>Aucun outcome trouvé.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Nom</th>
                <th className="border px-2 py-1">Indicateur</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map((outcome) => (
                <tr key={outcome.out_id}>
                  <td className="border px-2 py-1">{outcome.out_nom}</td>
                  <td className="border px-2 py-1">
                    {indicateurs[outcome.out_id]
                      ?.filter(ind => ind.opu_id === null)
                      .map((indicateur) => (
                        <div key={indicateur.ind_id} className="mb-2">
                          <div className="font-semibold">{indicateur.ind_code}</div>
                          <div>{indicateur.ind_nom}</div>
                          <div className="text-sm text-gray-600">
                            Valeur cible : {indicateur.ind_valeurCible}
                            {typeof indicateur.beneficiaireCount === 'number' && (
                              <span className="ml-4">
                                Bénéficiaires liés : <strong>{indicateur.beneficiaireCount}</strong>
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outcome.out_id}/indicateur/${indicateur.ind_id}/update`)
                            }
                            className="text-blue-600 hover:underline text-sm mt-1"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteIndicateur(indicateur.ind_id)}
                            className="text-red-600 hover:underline text-sm mt-1 ml-2"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outcome.out_id}/indicateur/creer`)}
                      className="text-green-600 hover:underline mt-2 block"
                    >
                      Créer un indicateur
                    </button>
                  </td>
                  <td className="border px-2 py-1 text-center space-x-2">
                    <button
                      onClick={() =>
                        router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outcome.out_id}/output`)
                      }
                      className="text-purple-600 hover:underline"
                    >
                      Output
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outcome.out_id}/update`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(outcome.out_id, outcome.out_nom)}
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

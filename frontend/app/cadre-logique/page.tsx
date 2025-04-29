'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Indicateur = {
  ind_id: number;
  ind_reference: string;
  ind_nom: string;
  ind_valeurCible2028: number;
};

type Output = {
  opu_id: number;
  opu_nom: string;
  opu_code: string;
  indicateurs: Indicateur[];
};

type Outcome = {
  out_id: number;
  out_nom: string;
  outputs: Output[];
  indicateurs: Indicateur[];
};

type Objectif = {
  obj_id: number;
  obj_nom: string;
  outcomes: Outcome[];
};

type CadreLogique = {
  cad_id: number;
  cad_nom: string;
  cad_dateDebut: string;
  cad_dateFin: string;
  objectifs_generaux: Objectif[];
};

export default function CadreLogiquePage() {
  const [cadres, setCadres] = useState<CadreLogique[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCadres = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8000/api/cadre-logique');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Format de données invalide');
        }
        setCadres(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Erreur lors du chargement des cadres logiques:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCadres();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Cadres logiques</h1>
        <div className="text-center">Chargement en cours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Cadres logiques</h1>
        <div className="text-red-600">Erreur: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Cadres logiques</h1>

      <button
        onClick={() => router.push('/cadre-logique/creer')}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Créer un cadre logique
      </button>

      {cadres.length === 0 ? (
        <div className="text-center text-gray-600">
          Aucun cadre logique n'a été créé.
        </div>
      ) : (
        cadres.map((cadre) => (
          <div key={cadre.cad_id} className="border p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{cadre.cad_nom}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => router.push(`/cadre-logique/${cadre.cad_id}/update`)}
                  className="text-blue-600"
                >
                  Modifier
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {formatDate(cadre.cad_dateDebut)} → {formatDate(cadre.cad_dateFin)}
            </p>

            {cadre.objectifs_generaux?.map((obj) => (
              <div key={obj.obj_id} className="ml-4 mt-4 border-l-2 pl-4 border-gray-400">
                <div className="flex justify-between">
                  <h3 className="font-bold">🎯 {obj.obj_nom}</h3>
                  <button
                    onClick={() =>
                      router.push(`/cadre-logique/${cadre.cad_id}/objectifs/${obj.obj_id}/update`)
                    }
                    className="text-blue-500 text-sm"
                  >
                    Modifier
                  </button>
                </div>

                <div className="mt-2 ml-4">
                  {obj.outcomes?.map((out) => (
                    <div key={out.out_id} className="mb-4">
                      <div className="flex justify-between">
                        <p className="font-semibold">✅ Outcome : {out.out_nom}</p>
                        <button
                          onClick={() =>
                            router.push(
                              `/cadre-logique/${cadre.cad_id}/objectifs/${obj.obj_id}/outcomes/${out.out_id}/update`
                            )
                          }
                          className="text-blue-500 text-sm"
                        >
                          Modifier
                        </button>
                      </div>
                      {out.indicateurs?.map((ind) => (
                        <p key={ind.ind_id} className="ml-4 text-sm text-gray-700">
                          📌 {ind.ind_reference} – {ind.ind_nom} ({ind.ind_valeurCible2028})
                        </p>
                      ))}
                      <button
                        onClick={() =>
                          router.push(
                            `/cadre-logique/${cadre.cad_id}/objectifs/${obj.obj_id}/outcomes/${out.out_id}/indicateurs/creer`
                          )
                        }
                        className="ml-4 text-green-600 text-sm"
                      >
                        + Ajouter indicateur outcome
                      </button>

                      {out.outputs?.map((op) => (
                        <div key={op.opu_id} className="ml-4 mt-2 mb-2">
                          <div className="flex justify-between">
                            <p className="font-semibold">
                              📤 Output : {op.opu_code} – {op.opu_nom}
                            </p>
                            <button
                              onClick={() =>
                                router.push(
                                  `/cadre-logique/${cadre.cad_id}/objectifs/${obj.obj_id}/outcomes/${out.out_id}/outputs/${op.opu_id}/update`
                                )
                              }
                              className="text-blue-500 text-sm"
                            >
                              Modifier
                            </button>
                          </div>
                          {op.indicateurs?.map((ind) => (
                            <p key={ind.ind_id} className="ml-4 text-sm text-gray-700">
                              📌 {ind.ind_reference} – {ind.ind_nom} ({ind.ind_valeurCible2028})
                            </p>
                          ))}
                          <button
                            onClick={() =>
                              router.push(
                                `/cadre-logique/${cadre.cad_id}/objectifs/${obj.obj_id}/outcomes/${out.out_id}/outputs/${op.opu_id}/indicateurs/creer`
                              )
                            }
                            className="ml-4 text-green-600 text-sm"
                          >
                            + Ajouter indicateur output
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          router.push(
                            `/cadre-logique/${cadre.cad_id}/objectifs/${obj.obj_id}/outcomes/${out.out_id}/outputs/creer`
                          )
                        }
                        className="ml-4 mt-2 text-green-600 text-sm"
                      >
                        + Ajouter un output
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      router.push(`/cadre-logique/${cadre.cad_id}/objectifs/${obj.obj_id}/outcomes/creer`)
                    }
                    className="text-green-600 text-sm"
                  >
                    + Ajouter un outcome
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => router.push(`/cadre-logique/${cadre.cad_id}/objectifs/creer`)}
              className="mt-4 text-green-700 text-sm"
            >
              + Ajouter un objectif général
            </button>
          </div>
        ))
      )}
    </div>
  );
}
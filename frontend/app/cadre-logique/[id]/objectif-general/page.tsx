'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type ObjectifGeneral = {
  obj_id: number;
  obj_nom: string;
  cad_id: number;
};

type CadreLogique = {
  cad_id: number;
  cad_nom: string;
};

export default function ObjectifGeneralPage() {
  const [objectifs, setObjectifs] = useState<ObjectifGeneral[]>([]);
  const [cadreLogique, setCadreLogique] = useState<CadreLogique | null>(null);
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;

  const fetchObjectifsGeneraux = () => {
    fetch(`http://localhost:8000/api/objectifs-generaux?cad_id=${cadId}`)
      .then(res => res.json())
      .then(setObjectifs)
      .catch(err => console.error('Erreur fetch objectifs généraux:', err));
  };

  useEffect(() => {
    fetchObjectifsGeneraux();
    
    // Récupérer les informations du cadre logique
    fetch(`http://localhost:8000/api/cadre-logique/${cadId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Réponse API cadre logique:', data);
        if (data && typeof data === 'object') {
          setCadreLogique(data);
        } else {
          console.error('Format de données invalide pour le cadre logique:', data);
        }
      })
      .catch(err => {
        console.error('Erreur fetch cadre logique:', err);
        setCadreLogique(null);
      });

    // Améliorer aussi la récupération des objectifs
    fetch(`http://localhost:8000/api/objectifs-generaux?cad_id=${cadId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Réponse API objectifs:', data);
        if (Array.isArray(data)) {
          setObjectifs(data);
        } else {
          console.error('Format de données invalide pour les objectifs:', data);
          setObjectifs([]);
        }
      })
      .catch(err => {
        console.error('Erreur fetch objectifs généraux:', err);
        setObjectifs([]);
      });
  }, [cadId]);

  const handleDelete = async (id: number, nom: string) => {
    if (confirm(`Voulez-vous vraiment supprimer l'objectif général "${nom}" ?`)) {
      await fetch(`http://localhost:8000/api/objectifs-generaux/${id}`, {
        method: 'DELETE',
      });

      fetchObjectifsGeneraux(); // Recharge la liste après suppression
    }
  };

  return (
    <main className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/creer`)}
        >
          Ajouter un objectif général
        </button>
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={() => router.push('/cadre-logique')}
        >
          Retour aux cadres logiques
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        Liste des objectifs généraux {cadreLogique && `/ ${cadreLogique.cad_nom}`}
      </h1>

      {objectifs.length === 0 ? (
        <p>Aucun objectif général trouvé.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Nom</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {objectifs.map((objectif) => (
                <tr key={objectif.obj_id}>
                  <td className="border px-2 py-1">{objectif.obj_nom}</td>
                  <td className="border px-2 py-1 text-center space-x-2">
                    <button
                      onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objectif.obj_id}/outcome`)}
                      className="text-purple-600 hover:underline"
                    >
                      Outcome
                    </button>
                    <button
                      onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objectif.obj_id}/update`)}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(objectif.obj_id, objectif.obj_nom)}
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function UpdateOutcome() {
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;
  const objId = params?.objId;
  const outId = params?.outId;
  const [outNom, setOutNom] = useState('');

  useEffect(() => {
    if (outId) {
      fetch(`http://localhost:8000/api/outcomes/${outId}`)
        .then((response) => response.json())
        .then((data) => {
          setOutNom(data.out_nom);
        });
    }
  }, [outId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
  
    await fetch(`http://localhost:8000/api/outcomes/${outId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        out_nom: outNom,
        obj_id: objId,
      }),
    });
  
    router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Modifier l'Outcome</h1>
      <form onSubmit={handleUpdate} className="flex flex-col space-y-4">
        <input
          type="text"
          value={outNom}
          onChange={(e) => setOutNom(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <div className="flex gap-4">
          <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome`)}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
} 
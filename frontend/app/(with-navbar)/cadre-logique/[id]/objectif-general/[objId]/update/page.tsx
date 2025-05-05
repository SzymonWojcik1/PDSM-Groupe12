'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function UpdateObjectifGeneral() {
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;
  const objId = params?.objId;
  const [objNom, setObjNom] = useState('');

  useEffect(() => {
    if (objId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/objectifs-generaux/${objId}`)
        .then((response) => response.json())
        .then((data) => {
          setObjNom(data.obj_nom);
        });
    }
  }, [objId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
  
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/objectifs-generaux/${objId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obj_nom: objNom,
        cad_id: cadId,
      }),
    });
  
    router.push(`/cadre-logique/${cadId}/objectif-general`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Modifier l'Objectif Général</h1>
      <form onSubmit={handleUpdate} className="flex flex-col space-y-4">
        <input
          type="text"
          value={objNom}
          onChange={(e) => setObjNom(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <div className="flex gap-4">
          <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general`)}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
} 
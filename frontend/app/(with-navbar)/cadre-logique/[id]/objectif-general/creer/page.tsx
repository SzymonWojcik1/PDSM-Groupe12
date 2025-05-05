'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CreateObjectifGeneral() {
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;
  const [objNom, setObjNom] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/objectifs-generaux`, {
      method: 'POST',
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
      <h1 className="text-2xl font-bold mb-4">Créer un Objectif Général</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Nom de l'objectif général"
          value={objNom}
          onChange={(e) => setObjNom(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <div className="flex gap-4">
          <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
            Créer
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

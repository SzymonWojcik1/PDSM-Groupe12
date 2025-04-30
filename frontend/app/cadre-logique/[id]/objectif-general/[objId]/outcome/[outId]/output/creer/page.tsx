'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CreateOutput() {
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;
  const objId = params?.objId;
  const outId = params?.outId;
  const [opuCode, setOpuCode] = useState('');
  const [opuNom, setOpuNom] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    await fetch('http://localhost:8000/api/outputs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opu_code: opuCode,
        opu_nom: opuNom,
        out_id: outId,
      }),
    });
  
    router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outId}/output`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Créer un Output</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Code de l'output"
          value={opuCode}
          onChange={(e) => setOpuCode(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nom de l'output"
          value={opuNom}
          onChange={(e) => setOpuNom(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <div className="flex gap-4">
          <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded">
            Créer
          </button>
          <button
            type="button"
            onClick={() => router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outId}/output`)}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
} 
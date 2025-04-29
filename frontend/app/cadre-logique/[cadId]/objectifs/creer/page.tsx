'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CreerObjectif() {
  const [nom, setNom] = useState('');
  const router = useRouter();
  const { cadId } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('http://localhost:8000/api/objectifs-generaux', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obj_nom: nom,
        cad_id: cadId,
      }),
    });

    if (res.ok) {
      router.push('/cadre-logique');
    } else {
      const err = await res.json();
      alert(err.message || 'Erreur lors de la création');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Créer un objectif général</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <textarea
          placeholder="Nom de l’objectif général"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="w-full border p-2 rounded"
          rows={4}
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Créer
        </button>
      </form>
    </div>
  );
}
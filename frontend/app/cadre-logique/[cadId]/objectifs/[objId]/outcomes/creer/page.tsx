'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CreateOutcome() {
  const router = useRouter();
  const params = useParams();
  const [outNom, setOutNom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          out_nom: outNom,
          obj_id: Number(params.objId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue lors de la création de l\'outcome');
      }

      router.push('/cadre-logique');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ajouter un Outcome</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'outcome
          </label>
          <input
            id="nom"
            type="text"
            placeholder="Nom de l'outcome"
            value={outNom}
            onChange={(e) => setOutNom(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className={`${
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white py-2 rounded transition-colors`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Création en cours...' : 'Créer'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/cadre-logique')}
          className="text-gray-600 hover:text-gray-800 text-center"
        >
          Retour
        </button>
      </form>
    </div>
  );
}

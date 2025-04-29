'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CreateIndicateurOutcome() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    ind_reference: '',
    ind_nom: '',
    ind_valeurCible2028: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/indicateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ind_type: 'outcome',
          ind_valeurCible2028: parseInt(formData.ind_valeurCible2028),
          out_id: Number(params.outId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue lors de la création de l\'indicateur');
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
      <h1 className="text-2xl font-bold mb-4">Ajouter un Indicateur d'Outcome</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="ind_reference" className="block text-sm font-medium text-gray-700 mb-1">
            Référence de l'indicateur
          </label>
          <input
            id="ind_reference"
            name="ind_reference"
            type="text"
            placeholder="Référence"
            value={formData.ind_reference}
            onChange={handleChange}
            required
            maxLength={50}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="ind_nom" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'indicateur
          </label>
          <input
            id="ind_nom"
            name="ind_nom"
            type="text"
            placeholder="Nom de l'indicateur"
            value={formData.ind_nom}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="ind_valeurCible2028" className="block text-sm font-medium text-gray-700 mb-1">
            Valeur cible 2028
          </label>
          <input
            id="ind_valeurCible2028"
            name="ind_valeurCible2028"
            type="number"
            placeholder="Valeur cible"
            value={formData.ind_valeurCible2028}
            onChange={handleChange}
            required
            min="0"
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

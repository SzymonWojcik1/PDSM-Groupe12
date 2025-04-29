'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CreateOutput() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    opu_nom: '',
    opu_code: '',
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
      const response = await fetch('http://localhost:8000/api/outputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          out_id: Number(params.outId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue lors de la création de l\'output');
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
      <h1 className="text-2xl font-bold mb-4">Ajouter un Output</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="opu_code" className="block text-sm font-medium text-gray-700 mb-1">
            Code de l'output
          </label>
          <input
            id="opu_code"
            name="opu_code"
            type="text"
            placeholder="Code (max 20 caractères)"
            value={formData.opu_code}
            onChange={handleChange}
            required
            maxLength={20}
            className="border p-2 rounded w-full"
          />
          <p className="mt-1 text-sm text-gray-500">
            Maximum 20 caractères
          </p>
        </div>

        <div>
          <label htmlFor="opu_nom" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'output
          </label>
          <input
            id="opu_nom"
            name="opu_nom"
            type="text"
            placeholder="Nom de l'output"
            value={formData.opu_nom}
            onChange={handleChange}
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
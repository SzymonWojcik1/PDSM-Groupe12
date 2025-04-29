'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCadreLogique() {
  const router = useRouter();
  const [cadNom, setCadNom] = useState('');
  const [cadDateDebut, setCadDateDebut] = useState('');
  const [cadDateFin, setCadDateFin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
  
    try {
      // Vérification des dates
      if (new Date(cadDateDebut) >= new Date(cadDateFin)) {
        setError("La date de début doit être strictement inférieure à la date de fin.");
        return;
      }
  
      const response = await fetch('http://localhost:8000/api/cadre-logique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cad_nom: cadNom,
          cad_dateDebut: cadDateDebut,
          cad_dateFin: cadDateFin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setError(data.message);
        } else {
          throw new Error(data.message || 'Une erreur est survenue');
        }
        return;
      }
  
      router.push('/cadre-logique');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Créer un Cadre Logique</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
            Nom du cadre logique
          </label>
          <input
            id="nom"
            type="text"
            placeholder="Nom"
            value={cadNom}
            onChange={(e) => setCadNom(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            id="dateDebut"
            type="date"
            value={cadDateDebut}
            onChange={(e) => setCadDateDebut(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            id="dateFin"
            type="date"
            value={cadDateFin}
            onChange={(e) => setCadDateFin(e.target.value)}
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
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 text-center"
        >
          Retour
        </button>
      </form>
    </div>
  );
}
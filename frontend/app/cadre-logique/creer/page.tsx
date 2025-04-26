'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCadreLogique() {
  const router = useRouter();
  const [cadNom, setCadNom] = useState('');
  const [cadDateDebut, setCadDateDebut] = useState('');
  const [cadDateFin, setCadDateFin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Vérification des dates
    if (new Date(cadDateDebut) >= new Date(cadDateFin)) {
      alert("La date de début doit être strictement inférieure à la date de fin.");
      return; // bloque l'envoi
    }
  
    await fetch('http://localhost:8000/api/cadre-logique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cad_nom: cadNom,
        cad_dateDebut: cadDateDebut,
        cad_dateFin: cadDateFin,
      }),
    });
  
    router.push('/cadre-logique');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Créer un Cadre Logique</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Nom"
          value={cadNom}
          onChange={(e) => setCadNom(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={cadDateDebut}
          onChange={(e) => setCadDateDebut(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={cadDateFin}
          onChange={(e) => setCadDateFin(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white py-2 rounded">Créer</button>
      </form>
    </div>
  );
}
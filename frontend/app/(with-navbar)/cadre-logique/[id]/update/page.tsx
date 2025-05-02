'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function UpdateCadreLogique() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [cadNom, setCadNom] = useState('');
  const [cadDateDebut, setCadDateDebut] = useState('');
  const [cadDateFin, setCadDateFin] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/api/cadre-logique/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setCadNom(data.cad_nom);
          setCadDateDebut(data.cad_dateDebut);
          setCadDateFin(data.cad_dateFin);
        });
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Vérification des dates
    if (new Date(cadDateDebut) >= new Date(cadDateFin)) {
      alert("La date de début doit être strictement inférieure à la date de fin.");
      return; // bloque l'envoi
    }
  
    await fetch(`http://localhost:8000/api/cadre-logique/${id}`, {
      method: 'PUT',
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
      <h1 className="text-2xl font-bold mb-4">Modifier le Cadre Logique</h1>
      <form onSubmit={handleUpdate} className="flex flex-col space-y-4">
        <input
          type="text"
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
        <button type="submit" className="bg-green-500 text-white py-2 rounded">Mettre à jour</button>
      </form>
    </div>
  );
}
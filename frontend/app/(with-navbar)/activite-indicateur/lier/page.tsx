'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Import

export default function LierActiviteIndicateurPage() {
  const router = useRouter(); // ✅ Init
  const [activites, setActivites] = useState([]);
  const [indicateurs, setIndicateurs] = useState([]);
  const [selectedActivite, setSelectedActivite] = useState('');
  const [selectedIndicateur, setSelectedIndicateur] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites`)
      .then(res => res.json())
      .then(setActivites);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateurs`)
      .then(res => res.json())
      .then(setIndicateurs);
  }, []);

  const handleSubmit = async () => {
    if (!selectedActivite || !selectedIndicateur) return alert("Choisis une activité et un indicateur");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activite-indicateurs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        act_id: selectedActivite,
        ind_id: selectedIndicateur
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Lien créé avec succès !');
      router.push('/cadre-logique');
    } else {
      alert(data.message || 'Erreur lors de la création du lien');
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Lier une activité à un indicateur</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1">Activité :</label>
          <select value={selectedActivite} onChange={e => setSelectedActivite(e.target.value)} className="w-full border p-2 rounded">
            <option value="">-- Choisir une activité --</option>
            {activites.map((a: any) => (
              <option key={a.act_id} value={a.act_id}>{a.act_nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Indicateur :</label>
          <select value={selectedIndicateur} onChange={e => setSelectedIndicateur(e.target.value)} className="w-full border p-2 rounded">
            <option value="">-- Choisir un indicateur --</option>
            {indicateurs.map((i: any) => (
              <option key={i.ind_id} value={i.ind_id}>{i.ind_nom}</option>
            ))}
          </select>
        </div>

        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Lier
        </button>
      </div>
    </main>
  );
}

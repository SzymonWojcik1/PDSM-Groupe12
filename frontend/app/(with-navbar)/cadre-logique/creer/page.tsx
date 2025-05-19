'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateCadreLogique() {
  const router = useRouter();
  const [cadNom, setCadNom] = useState('');
  const [cadDateDebut, setCadDateDebut] = useState('');
  const [cadDateFin, setCadDateFin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cadNom || !cadDateDebut || !cadDateFin) {
      alert("Tous les champs sont requis.");
      return;
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cad_nom: cadNom,
          cad_dateDebut: cadDateDebut,
          cad_dateFin: cadDateFin,
        }),
      });

      router.push('/cadre-logique');
    } catch (err) {
      console.error('Erreur lors de la création du cadre logique:', err);
      alert("Échec de la création.");
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year)) {
      const debut = `${year}-01-01`;
      const fin = `${year + 3}-12-31`;
      setCadDateDebut(debut);
      setCadDateFin(fin);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Créer un cadre logique</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          <Link
            href="/cadre-logique"
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
          >
            Retour à la liste
          </Link>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-1">Nom du cadre</label>
              <input
                type="text"
                value={cadNom}
                onChange={(e) => setCadNom(e.target.value)}
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Année de début</label>
              <input
                type="number"
                placeholder="Ex: 2025"
                onChange={handleYearChange}
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Date de début automatique</label>
              <input
                type="date"
                value={cadDateDebut}
                readOnly
                className="w-full border border-gray-300 rounded p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Date de fin automatique</label>
              <input
                type="date"
                value={cadDateFin}
                readOnly
                className="w-full border border-gray-300 rounded p-2 bg-gray-100"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30] transition"
            >
              Créer
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

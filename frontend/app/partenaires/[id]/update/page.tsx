'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function UpdatePartenaire() {
  const { id } = useParams();
  const router = useRouter();

  const [partenaire, setPartenaire] = useState({
    part_nom: '',
    part_pays: '',
    part_region: '',
  });

  // Charger les données existantes
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:8000/api/partenaires/${id}`);
      const data = await res.json();
      setPartenaire(data);
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartenaire({ ...partenaire, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`http://localhost:8000/api/partenaires/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partenaire),
    });
    router.push('/partenaires');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <h1 className="text-xl font-bold text-black">Modifier le partenaire</h1>

        <input
          type="text"
          name="part_nom"
          value={partenaire.part_nom}
          onChange={handleChange}
          placeholder="Nom"
          className="border p-2 w-full text-black"
        />
        <input
          type="text"
          name="part_pays"
          value={partenaire.part_pays}
          onChange={handleChange}
          placeholder="Pays"
          className="border p-2 w-full text-black"
        />
        <input
          type="text"
          name="part_region"
          value={partenaire.part_region}
          onChange={handleChange}
          placeholder="Région"
          className="border p-2 w-full text-black"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}

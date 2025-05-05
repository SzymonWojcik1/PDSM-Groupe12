'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Partenaire = {
  part_id: number;
  part_nom: string;
};

export default function CreateProjetPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    pro_nom: '',
    pro_dateDebut: '',
    pro_dateFin: '',
    pro_part_id: '',
  });

  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchPartenaires = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`);
      const data = await res.json();
      setPartenaires(data);
    };

    fetchPartenaires();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const debut = new Date(formData.pro_dateDebut);
    const fin = new Date(formData.pro_dateFin);
    const now = new Date();

    if (debut > fin) {
      setErrorMessage("La date de début ne peut pas être après la date de fin.");
      return;
    }

    if (debut < now || fin < now) {
      setErrorMessage("Les dates du projet ne peuvent pas être dans le passé.");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.message || 'Une erreur est survenue');
      return;
    }

    router.push('/projets');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Créer un projet</h1>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded">
            {errorMessage}
          </div>
        )}

        <input
          type="text"
          name="pro_nom"
          value={formData.pro_nom}
          onChange={handleChange}
          placeholder="Nom du projet"
          className="w-full p-2 border rounded text-black"
          required
        />

        <input
          type="date"
          name="pro_dateDebut"
          value={formData.pro_dateDebut}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
          required
        />

        <input
          type="date"
          name="pro_dateFin"
          value={formData.pro_dateFin}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
          required
        />

        <select
          name="pro_part_id"
          value={formData.pro_part_id}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
          required
        >
          <option value="">Sélectionner un partenaire</option>
          {partenaires.map((p) => (
            <option key={p.part_id} value={p.part_id}>
              {p.part_nom}
            </option>
          ))}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Créer
        </button>
      </form>
    </div>
  );
}
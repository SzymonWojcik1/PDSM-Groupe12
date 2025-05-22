'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Créer un projet</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">Complétez le formulaire ci-dessous pour enregistrer un nouveau projet.</p>
            </div>
            <Link
              href="/projets"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              Retour à la liste
            </Link>
          </div>
        </header>

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet</label>
              <input
                type="text"
                name="pro_nom"
                value={formData.pro_nom}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input
                  type="date"
                  name="pro_dateDebut"
                  value={formData.pro_dateDebut}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  name="pro_dateFin"
                  value={formData.pro_dateFin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partenaire</label>
              <select
                name="pro_part_id"
                value={formData.pro_part_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Sélectionner un partenaire</option>
                {partenaires.map((p) => (
                  <option key={p.part_id} value={p.part_id}>
                    {p.part_nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="bg-[#9F0F3A] text-white px-6 py-2 rounded hover:bg-[#800d30] transition"
              >
                Créer
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

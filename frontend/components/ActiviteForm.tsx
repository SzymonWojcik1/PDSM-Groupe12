'use client';

import { useEffect, useState } from 'react';

type Partenaire = { part_id: number; part_nom: string };
type Projet = { pro_id: number; pro_nom: string };

interface ActiviteFormProps {
  initialData?: {
    act_nom: string;
    act_dateDebut: string;
    act_dateFin: string;
    act_part_id: string;
    act_pro_id: string;
  };
  onSubmit: (data: {
    act_nom: string;
    act_dateDebut: string;
    act_dateFin: string;
    act_part_id: string;
    act_pro_id: string;
  }) => Promise<void>;
  submitLabel: string;
}

export default function ActiviteForm({
  initialData,
  onSubmit,
  submitLabel,
}: ActiviteFormProps) {
  const [formData, setFormData] = useState({
    act_nom: '',
    act_dateDebut: '',
    act_dateFin: '',
    act_part_id: '',
    act_pro_id: '',
  });

  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    const fetchData = async () => {
      const [partsRes, projetsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projets`),
      ]);
      const [parts, projets] = await Promise.all([partsRes.json(), projetsRes.json()]);
      setPartenaires(parts);
      setProjets(projets);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const debut = new Date(formData.act_dateDebut);
    const fin = new Date(formData.act_dateFin);

    if (debut > fin) {
      setErrorMessage("La date de début ne peut pas être après la date de fin.");
      return;
    }

    if (debut < now || fin < now) {
      setErrorMessage("Les dates ne peuvent pas être dans le passé.");
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{errorMessage}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'activité</label>
        <input
          type="text"
          name="act_nom"
          value={formData.act_nom}
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
            name="act_dateDebut"
            value={formData.act_dateDebut}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
          <input
            type="date"
            name="act_dateFin"
            value={formData.act_dateFin}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Partenaire</label>
        <select
          name="act_part_id"
          value={formData.act_part_id}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Projet</label>
        <select
          name="act_pro_id"
          value={formData.act_pro_id}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="">Sélectionner un projet</option>
          {projets.map((p) => (
            <option key={p.pro_id} value={p.pro_id}>
              {p.pro_nom}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="bg-[#9F0F3A] text-white px-6 py-2 rounded hover:bg-[#800d30] transition"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

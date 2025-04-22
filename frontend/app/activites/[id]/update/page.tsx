'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Partenaire = { part_id: number; part_nom: string };
type Projet = { pro_id: number; pro_nom: string };

export default function UpdateActivitePage() {
  const { id } = useParams();
  const router = useRouter();

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
    const fetchData = async () => {
      const [partRes, projRes, actRes] = await Promise.all([
        fetch('http://localhost:8000/api/partenaires'),
        fetch('http://localhost:8000/api/projets'),
        fetch(`http://localhost:8000/api/activites/${id}`),
      ]);

      const partenairesData = await partRes.json();
      const projetsData = await projRes.json();
      const activiteData = await actRes.json();

      setPartenaires(partenairesData);
      setProjets(projetsData);

      setFormData({
        act_nom: activiteData.act_nom,
        act_dateDebut: activiteData.act_dateDebut,
        act_dateFin: activiteData.act_dateFin,
        act_part_id: activiteData.act_part_id,
        act_pro_id: activiteData.act_pro_id,
      });
    };

    fetchData();
  }, [id]);

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

    const res = await fetch(`http://localhost:8000/api/activites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.message || 'Erreur lors de la modification.');
      return;
    }

    router.push('/activites');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-black mb-4">Modifier l’activité</h1>

        {errorMessage && <div className="bg-red-100 text-red-700 p-2 rounded">{errorMessage}</div>}

        <input
          type="text"
          name="act_nom"
          value={formData.act_nom}
          onChange={handleChange}
          placeholder="Nom"
          className="w-full p-2 border rounded text-black"
          required
        />

        <input
          type="date"
          name="act_dateDebut"
          value={formData.act_dateDebut}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
          required
        />

        <input
          type="date"
          name="act_dateFin"
          value={formData.act_dateFin}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
          required
        />

        <select
          name="act_part_id"
          value={formData.act_part_id}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
          required
        >
          <option value="">Sélectionner un partenaire</option>
          {partenaires.map(p => (
            <option key={p.part_id} value={p.part_id}>
              {p.part_nom}
            </option>
          ))}
        </select>

        <select
          name="act_pro_id"
          value={formData.act_pro_id}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
          required
        >
          <option value="">Sélectionner un projet</option>
          {projets.map(p => (
            <option key={p.pro_id} value={p.pro_id}>
              {p.pro_nom}
            </option>
          ))}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}

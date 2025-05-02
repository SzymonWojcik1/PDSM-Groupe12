'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';

export default function BeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [enums, setEnums] = useState<EnumMap>({});
  const [filters, setFilters] = useState({
    region: '',
    pays: '',
    zone: '',
    type: '',
    sexe: '',
    genre: '',
    search: '',
  });

  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:8000/api/enums?locale=en')
      .then(res => res.json())
      .then(setEnums)
      .catch(err => console.error('Erreur fetch enums:', err));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    fetch(`http://localhost:8000/api/beneficiaires?${query.toString()}`)
      .then(res => res.json())
      .then(setBeneficiaires)
      .catch(err => console.error('Erreur fetch bénéficiaires:', err));
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleDelete = async (id: string) => {
    const confirmed = confirm("Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?");
    if (!confirmed) return;

    try {
      await fetch(`http://localhost:8000/api/beneficiaires/${id}`, {
        method: 'DELETE',
      });

      setBeneficiaires(prev => prev.filter(b => b.ben_id !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  const handleRegionChange = (region: string) => {
    setFilters(prev => ({ ...prev, region, pays: '' }));
  };

  const resetFilters = () => {
    setFilters({
      region: '',
      pays: '',
      zone: '',
      type: '',
      sexe: '',
      genre: '',
      search: '',
    });
  };

  const handleUpdate = (id: string) => {
    router.push(`/beneficiaires/${id}/update`);
  };

  return (
    <main className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          onClick={() => router.push('/beneficiaires/add')}
        >
          Ajouter un bénéficiaire
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
          onClick={() => router.push('/beneficiaires/delete')}
        >
          Supprimer bénéficiaire(s)
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push('/beneficiaires/dashboard')}
        >
          Accéder au dashboard
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => router.push('/beneficiaires/export')}
        >
          Exporter les bénéficiaires
        </button>
      </div>

      {/* Filtres */}
      <BeneficiaireFilters
        filters={filters}
        onChange={handleChange}
        onRegionChange={handleRegionChange}
        onReset={resetFilters}
        enums={enums}
      />

      <h1 className="text-2xl font-semibold mb-4">Liste des bénéficiaires</h1>

      {/* Afficher les bénéficiaires */}
      {beneficiaires.length === 0 ? (
        <p>Aucun bénéficiaire trouvé.</p>
      ) : (
        <BeneficiaireTable
          beneficiaires={beneficiaires}
          enums={enums}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
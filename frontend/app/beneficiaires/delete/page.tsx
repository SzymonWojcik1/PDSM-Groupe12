'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';

export default function SupprimerBeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const idsAffiches = beneficiaires.map(b => b.ben_id);
    const allSelected = idsAffiches.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !idsAffiches.includes(id)));
    } else {
      setSelectedIds(prev => [
        ...prev,
        ...idsAffiches.filter(id => !prev.includes(id)),
      ]);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?');
    if (!confirmed) return;

    try {
      await fetch(`http://localhost:8000/api/beneficiaires/${id}`, { method: 'DELETE' });
      setBeneficiaires(prev => prev.filter(b => b.ben_id !== id));
      setSelectedIds(prev => prev.filter(x => x !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Une erreur est survenue.');
    }
  };

  const deleteSelected = async () => {
    const confirmed = confirm('Confirmer la suppression des bénéficiaires sélectionnés ?');
    if (!confirmed) return;

    for (const id of selectedIds) {
      await fetch(`http://localhost:8000/api/beneficiaires/${id}`, {
        method: 'DELETE',
      });
    }

    setBeneficiaires(prev => prev.filter(b => !selectedIds.includes(b.ben_id)));
    setSelectedIds([]);
  };

  return (
    <main className="p-6">
      <div className="flex gap-4 flex-wrap items-center mb-6">
        <button
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 rounded text-white ${
            selectedIds.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Supprimer la sélection
        </button>

        <button
          onClick={toggleSelectAll}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
        >
          {beneficiaires.every(b => selectedIds.includes(b.ben_id))
            ? 'Tout désélectionner'
            : 'Tout sélectionner'}
        </button>

        <button
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-800"
          onClick={() => router.push('/beneficiaires')}
        >
          Retour
        </button>

        {selectedIds.length > 0 && (
          <span className="text-sm text-gray-700">
            {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <BeneficiaireFilters
        filters={filters}
        onChange={handleChange}
        onRegionChange={handleRegionChange}
        onReset={resetFilters}
        enums={enums}
      />

      <h1 className="text-2xl font-semibold mb-4">Supprimer des bénéficiaires</h1>

      {beneficiaires.length === 0 ? (
        <p>Aucun bénéficiaire trouvé.</p>
      ) : (
        <BeneficiaireTable
          beneficiaires={beneficiaires}
          enums={enums}
          selectable
          selectedIds={selectedIds}
          toggleSelection={toggleSelection}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
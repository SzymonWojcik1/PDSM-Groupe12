'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';

export default function SupprimerBeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enums, setEnums] = useState<EnumMap>({});
  const [filters, setFilters] = useState({
    region: '', pays: '', zone: '', type: '', sexe: '', genre: '', search: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/enums?locale=en`)
      .then(res => res.json())
      .then(setEnums)
      .catch(err => console.error('Erreur fetch enums:', err));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires?${query.toString()}`)
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
    setFilters({ region: '', pays: '', zone: '', type: '', sexe: '', genre: '', search: '' });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const idsAffiches = beneficiaires.map(b => b.ben_id);
    const allSelected = idsAffiches.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !idsAffiches.includes(id)));
    } else {
      setSelectedIds(prev => [...prev, ...idsAffiches.filter(id => !prev.includes(id))]);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?');
    if (!confirmed) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`, { method: 'DELETE' });
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`, { method: 'DELETE' });
    }
    setBeneficiaires(prev => prev.filter(b => !selectedIds.includes(b.ben_id)));
    setSelectedIds([]);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Supprimer des bénéficiaires</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">Sélectionnez les bénéficiaires à supprimer en utilisant les filtres.</p>
            </div>
            <Link
              href="/beneficiaires"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              Retour à la liste
            </Link>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200 flex flex-wrap gap-3 items-center">
          <button
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              selectedIds.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            Supprimer la sélection
          </button>

          <button
            onClick={toggleSelectAll}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
          >
            {beneficiaires.every(b => selectedIds.includes(b.ben_id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <BeneficiaireFilters
            filters={filters}
            onChange={handleChange}
            onRegionChange={handleRegionChange}
            onReset={resetFilters}
            enums={enums}
          />
        </div>

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          {beneficiaires.length === 0 ? (
            <p className="text-gray-600">Aucun bénéficiaire trouvé.</p>
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
        </section>
      </div>
    </main>
  );
}
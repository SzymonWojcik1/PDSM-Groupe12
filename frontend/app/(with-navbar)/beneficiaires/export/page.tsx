'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';

export default function ExportBeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enums, setEnums] = useState<EnumMap>({});
  const [filters, setFilters] = useState({ region: '', pays: '', zone: '', type: '', sexe: '', genre: '', search: '' });

  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/enums?locale=en`)
      .then(res => res.json())
      .then(setEnums);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires?${query.toString()}`)
      .then(res => res.json())
      .then(setBeneficiaires);
  }, [filters]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === beneficiaires.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(beneficiaires.map(b => b.ben_id));
    }
  };

  const exportSelected = () => {
    const selectedBeneficiaires = beneficiaires.filter(b => selectedIds.includes(b.ben_id));
    if (selectedBeneficiaires.length === 0) {
      alert('Aucun bénéficiaire sélectionné.');
      return;
    }

    const headers = Object.keys(selectedBeneficiaires[0]);
    const rows = selectedBeneficiaires.map(b => headers.map(h => JSON.stringify((b as Beneficiaire)[h as keyof Beneficiaire] ?? '')).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'beneficiaires_selection.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Exporter des bénéficiaires</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">Sélectionnez les bénéficiaires à exporter et filtrez selon vos critères.</p>
            </div>
            <Link
              href="/beneficiaires"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              Retour à la liste
            </Link>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200 flex flex-wrap gap-3">
          <button
            onClick={exportSelected}
            disabled={selectedIds.length === 0}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              selectedIds.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#9F0F3A] text-white hover:bg-[#800d30]'
            }`}
          >
            Exporter la sélection
          </button>

          <button
            onClick={toggleSelectAll}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
          >
            {selectedIds.length === beneficiaires.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <BeneficiaireFilters
            filters={filters}
            onChange={(e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            onRegionChange={(region) => setFilters(prev => ({ ...prev, region, pays: '' }))}
            onReset={() => setFilters({ region: '', pays: '', zone: '', type: '', sexe: '', genre: '', search: '' })}
            enums={enums}
          />
        </div>

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <BeneficiaireTable
            beneficiaires={beneficiaires}
            enums={enums}
            selectable
            selectedIds={selectedIds}
            toggleSelection={toggleSelection}
          />
        </section>
      </div>
    </main>
  );
}
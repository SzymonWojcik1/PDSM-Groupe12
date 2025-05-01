'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';

export default function ExportBeneficiairesPage() {
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
      .then(setEnums);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    fetch(`http://localhost:8000/api/beneficiaires?${query.toString()}`)
      .then(res => res.json())
      .then(setBeneficiaires);
  }, [filters]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === beneficiaires.length) {
      setSelectedIds([]); // deselect
    } else {
      setSelectedIds(beneficiaires.map(b => b.ben_id)); // select
    }
  };

  const exportSelected = () => {
    const selectedBeneficiaires = beneficiaires.filter(b =>
      selectedIds.includes(b.ben_id)
    );

    if (selectedBeneficiaires.length === 0) {
      alert('Aucun bénéficiaire sélectionné.');
      return;
    }

    const headers = Object.keys(selectedBeneficiaires[0]);
    const rows = selectedBeneficiaires.map(b =>
      headers.map(h => JSON.stringify((b as Beneficiaire)[h as keyof Beneficiaire] ?? '')).join(',')
    );

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
    <main className="p-6">
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={exportSelected}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 rounded text-white ${
            selectedIds.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Exporter la sélection
        </button>

        <button
          onClick={toggleSelectAll}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          {selectedIds.length === beneficiaires.length ? 'Tout désélectionner' : 'Tout sélectionner'}
        </button>

        <button
          className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-800"
          onClick={() => router.push('/beneficiaires')}
        >
          Retour
        </button>
      </div>

      <BeneficiaireFilters
        filters={filters}
        onChange={(e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))}
        onRegionChange={(region) => setFilters(prev => ({ ...prev, region, pays: '' }))}
        onReset={() =>
          setFilters({
            region: '',
            pays: '',
            zone: '',
            type: '',
            sexe: '',
            genre: '',
            search: '',
          })
        }
        enums={enums}
      />

      <h1 className="text-2xl font-semibold mb-4">Exporter des bénéficiaires</h1>

      <BeneficiaireTable
        beneficiaires={beneficiaires}
        enums={enums}
        selectable
        selectedIds={selectedIds}
        toggleSelection={toggleSelection}
      />
    </main>
  );
}
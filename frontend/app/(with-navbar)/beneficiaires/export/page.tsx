'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';

export default function ExportBeneficiairesPage() {
  useAuthGuard(); // Protect the page for authenticated users only
  const { t } = useTranslation(); // Translation hook
  const { callApi } = useApi(); // Custom API hook

  // State for the list of beneficiaries
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  // State for selected beneficiary IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // State for enums (for filters)
  const [enums, setEnums] = useState<EnumMap>({});
  // State for filter values
  const [filters, setFilters] = useState({
    region: '',
    pays: '',
    zone: '',
    type: '',
    sexe: '',
    genre: '',
    search: '',
  });

  // Fetch enums (for dropdowns/filters) on mount
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/enums?locale=en`);
        const data = await res.json();
        setEnums(data);
      } catch (err) {
        console.error('Erreur chargement enums', err);
      }
    };

    fetchEnums();
  }, [callApi]);

  // Fetch beneficiaries whenever filters change
  useEffect(() => {
    const fetchBeneficiaires = async () => {
      try {
        // Build query string from filters
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) query.append(key, value);
        });

        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires?${query.toString()}`);
        const data = await res.json();
        setBeneficiaires(data);
      } catch (err) {
        console.error('Erreur chargement bénéficiaires', err);
      }
    };

    fetchBeneficiaires();
  }, [filters, callApi]);

  // Toggle selection of a single beneficiary
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle selection of all beneficiaries
  const toggleSelectAll = () => {
    if (selectedIds.length === beneficiaires.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(beneficiaires.map(b => b.ben_id));
    }
  };

  // Export selected beneficiaries as CSV
  const exportSelected = () => {
    const selected = beneficiaires.filter(b => selectedIds.includes(b.ben_id));
    if (selected.length === 0) {
      alert(t('no_beneficiaries_selected'));
      return;
    }

    // Prepare CSV headers and rows
    const headers = Object.keys(selected[0]);
    const rows = selected.map(b =>
      headers.map(h => JSON.stringify(h in b ? b[h as keyof Beneficiaire] : '')).join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create and trigger download
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
        {/* Page header with title and back button */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('export_beneficiaries_title')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('export_beneficiaries_description')}</p>
            </div>
            <Link
              href="/beneficiaires"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              {t('back_to_list')}
            </Link>
          </div>
        </header>

        {/* Export and select all/deselect all buttons */}
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
            {t('export_selection')}
          </button>

          <button
            onClick={toggleSelectAll}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
          >
            {selectedIds.length === beneficiaires.length
              ? t('deselect_all')
              : t('select_all')}
          </button>
        </div>

        {/* Filters section */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">
            {t('filter_beneficiaries')}
          </h2>
          <BeneficiaireFilters
            filters={filters}
            enums={enums}
            onChange={e =>
              setFilters(prev => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
            onRegionChange={region =>
              setFilters(prev => ({
                ...prev,
                region,
                pays: '',
              }))
            }
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
          />
        </div>

        {/* Beneficiaries table section */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('beneficiaries_list')}</h2>
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

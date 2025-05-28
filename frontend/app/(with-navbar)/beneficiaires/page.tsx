'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ImportExcel from '@/components/ImportExcel';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';

// Main page component for managing beneficiaries
export default function BeneficiairesPage() {
  // Protect the page with authentication guard
  useAuthGuard();
  const { t } = useTranslation();
  const { callApi } = useApi();
  const router = useRouter();

  // State for beneficiaries list
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  // State for enums (type, zone, etc.)
  const [enums, setEnums] = useState<EnumMap>({});
  // State for filter fields
  const [filters, setFilters] = useState({
    region: '',
    pays: '',
    zone: '',
    type: '',
    sexe: '',
    genre: '',
    search: '',
  });

  // Ref for triggering file input in ImportExcel
  const importRef = useRef<HTMLInputElement>(null);

  // Fetch enums (type, zone, sexe, genre, etc.) on mount
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/enums?locale=en`);
        const data = await res.json();
        setEnums(data);
      } catch (err) {
        console.error('Erreur fetch enums:', err);
      }
    };

    fetchEnums();
  }, [callApi]);

  // Fetch beneficiaries list when filters change
  useEffect(() => {
    const fetchBeneficiaires = async () => {
      try {
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) query.append(key, value);
        });

        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires?${query.toString()}`);
        const data = await res.json();
        setBeneficiaires(data);
      } catch (err) {
        console.error('Erreur fetch bénéficiaires:', err);
      }
    };

    fetchBeneficiaires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Handle change for filter fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle region change and reset country filter
  const handleRegionChange = (region: string) => {
    setFilters(prev => ({ ...prev, region, pays: '' }));
  };

  // Reset all filters to default values
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

  // Navigate to update page for a beneficiary
  const handleUpdate = (id: string) => {
    router.push(`/beneficiaires/${id}/update`);
  };

  // Delete a beneficiary after confirmation
  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete_beneficiary'))) return;

    try {
      await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`, {
        method: 'DELETE',
      });
      setBeneficiaires(prev => prev.filter(b => b.ben_id !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert(t('error_deleting_beneficiary'));
    }
  };

  // Trigger the file input for importing beneficiaries
  const triggerImport = () => {
    importRef.current?.click();
  };

  // Handle import of beneficiaries from Excel
  const handleImport = async (rows: Record<string, unknown>[]) => {
    for (const [index, row] of rows.entries()) {
      try {
        // Check for duplicate beneficiary before import
        const duplicateCheck = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/check-duplicate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ben_nom: row.ben_nom,
            ben_prenom: row.ben_prenom,
            ben_date_naissance: row.ben_date_naissance,
            ben_sexe: row.ben_sexe,
          }),
        });

        const duplicateResult = await duplicateCheck.json();

        // If duplicate found, ask user for confirmation
        if (duplicateResult.exists) {
          const confirmAdd = window.confirm(
            `Possible duplicate detected:\n\nNom : ${duplicateResult.beneficiaire.nom}\nPrénom : ${duplicateResult.beneficiaire.prenom}\nCréé le : ${duplicateResult.beneficiaire.created_at}\n\nDo you want to add anyway?`
          );
          if (!confirmAdd) {
            console.log(`Ligne ${index + 1} ignorée (doublon refusé)`);
            continue;
          }
        }

        // Import the beneficiary
        const response = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
        });

        const json = await response.json();

        if (!response.ok) {
          console.error(`Ligne ${index + 1} échouée :`, json.errors || json.message || json);
        } else {
          console.log(`Ligne ${index + 1} importée avec succès :`, json);
        }
      } catch (err) {
        console.error(`Ligne ${index + 1} : erreur inattendue`, err);
      }
    }

    // Reload the page after import
    location.reload();
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('beneficiaries_management_title')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
          <p className="text-gray-600">{t('beneficiaries_management_description')}</p>
        </header>

        {/* Action buttons for add, delete, import, export, template download, dashboard */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/beneficiaires/add')}
              className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium"
            >
              {t('add_beneficiary')}
            </button>

            <button
              onClick={() => router.push('/beneficiaires/delete')}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('delete_beneficiaries')}
            </button>

            <button
              onClick={triggerImport}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('import_file')}
            </button>

            {/* ImportExcel component for importing beneficiaries from Excel */}
            <ImportExcel
              ref={importRef}
              fromCol={0}
              toCol={13}
              dateFields={['ben_date_naissance']}
              onPreview={handleImport}
            />

            <button
              onClick={() => router.push('/beneficiaires/export')}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('export_data')}
            </button>

            {/* Download Excel template for beneficiaries */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL_WITHOUT_API}beneficiaires/template`}
              download
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('download_excel_template')}
            </a>

            <button
              onClick={() => router.push('/beneficiaires/dashboard')}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('view_dashboard')}
            </button>
          </div>
        </div>

        {/* Filters for beneficiaries */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('filter_beneficiaries')}</h2>
          <BeneficiaireFilters
            filters={filters}
            onChange={handleChange}
            onRegionChange={handleRegionChange}
            onReset={resetFilters}
            enums={enums}
          />
        </div>

        {/* Table of beneficiaries */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('beneficiaries_list')}</h2>

          {beneficiaires.length === 0 ? (
            <p className="text-gray-600">{t('no_beneficiaries_found')}</p>
          ) : (
            <BeneficiaireTable
              beneficiaires={beneficiaires}
              enums={enums}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>
    </main>
  );
}

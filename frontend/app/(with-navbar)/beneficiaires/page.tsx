'use client';

import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ImportExcel from '@/components/ImportExcel';
import { useRouter } from 'next/navigation';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';

export default function BeneficiairesPage() {
  const { t } = useTranslation();
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

  const handleDelete = async (id: string) => {
    const confirmed = confirm(t('confirm_delete_beneficiary'));
    if (!confirmed) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`, {
        method: 'DELETE',
      });
      setBeneficiaires(prev => prev.filter(b => b.ben_id !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert(t('error_deleting_beneficiary'));
    }
  };

  const importRef = useRef<HTMLInputElement>(null);

  const triggerImport = () => {
    importRef.current?.click();
  };

  const handleImport = async (rows: Record<string, unknown>[]) => {
    let successCount = 0;
    let errorCount = 0;

    for (const [index, row] of rows.entries()) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(row),
        });

        const json = await response.json();

        if (!response.ok) {
          errorCount++;
          console.error(`Ligne ${index + 1} échouée :`, json.errors || json.message || json);
        } else {
          successCount++;
          console.log(`Ligne ${index + 1} importée avec succès :`, json);
        }
      } catch (err) {
        errorCount++;
        console.error(`Ligne ${index + 1} : erreur inattendue`, err);
      }
    }

    alert(t('import_completed', { success: successCount, error: errorCount }));
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

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BeneficiaireForm from '@/components/beneficiaireForm';
import type { BeneficiaireFormData } from '@/components/beneficiaireForm';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';

// Page component for updating a beneficiary
export default function UpdateBeneficiairePage() {
  // Protect the page with authentication guard
  useAuthGuard();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { callApi } = useApi();

  // State for initial form data
  const [initialData, setInitialData] = useState<BeneficiaireFormData | undefined>(undefined);
  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // Fetch beneficiary data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`);
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        setInitialData(data);
      } catch (err) {
        console.error('Erreur fetch bénéficiaire:', err);
        alert(t('error_loading_beneficiary'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t, callApi]);

  // Handle form submission for updating beneficiary
  const handleSubmit = async (formData: BeneficiaireFormData) => {
    try {
      const response = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/beneficiaires');
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la mise à jour', errorData);
        alert(t('error_updating_beneficiary'));
      }
    } catch (err) {
      console.error('Erreur réseau ou serveur:', err);
      alert(t('error_updating_beneficiary'));
    }
  };

  // Show loading indicator while fetching data
  if (loading) return <p className="text-center mt-10">{t('loading')}</p>;

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('update_beneficiary')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('update_beneficiary_description')}</p>
            </div>
            {/* Link to go back to the beneficiaries list */}
            <Link
              href="/beneficiaires"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              {t('back_to_list')}
            </Link>
          </div>
        </header>

        {/* Beneficiary form for editing */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <BeneficiaireForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel={t('update_beneficiary_button')}
          />
        </div>
      </div>
    </main>
  );
}
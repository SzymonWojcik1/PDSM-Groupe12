'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BeneficiaireForm from '@/components/beneficiaireForm';
import type { BeneficiaireFormData } from '@/components/beneficiaireForm';
import { useParams, useRouter } from 'next/navigation';

export default function UpdateBeneficiairePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<BeneficiaireFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`)
      .then((res) => res.json())
      .then(setInitialData)
      .catch((err) => {
        console.error('Erreur fetch bénéficiaire:', err);
        alert(t('error_loading_beneficiary'));
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  const handleSubmit = async (formData: BeneficiaireFormData) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`, {
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
  };

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
            <Link
              href="/beneficiaires"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              {t('back_to_list')}
            </Link>
          </div>
        </header>

        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <BeneficiaireForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel={t('update_beneficiary_button')}
          />
        </div>
      </div>
    </main>
  );
}

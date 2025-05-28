'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import BeneficiaireForm from '@/components/beneficiaireForm';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';

// Page component for adding a new beneficiary
export default function AddBeneficiaire() {
  // Protect the page with authentication guard
  useAuthGuard();
  const router = useRouter();
  const { t } = useTranslation();
  const { callApi } = useApi();

  // Interface for beneficiary form data
  interface BeneficiaireData {
    ben_nom: string;
    ben_prenom: string;
    ben_date_naissance: string;
    ben_sexe: string;
    ben_genre: string;
    ben_genre_autre?: string | null;
    ben_zone: string;
    ben_type: string;
    ben_type_autre?: string | null;
    ben_statut?: string;
    ben_region?: string;
    ben_pays?: string;
  }

  // Check for duplicate beneficiary before creation
  const checkDuplicate = async (data: BeneficiaireData) => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ben_nom: data.ben_nom,
          ben_prenom: data.ben_prenom,
          ben_date_naissance: data.ben_date_naissance,
          ben_sexe: data.ben_sexe,
        }),
      });

      if (!res.ok) throw new Error('Échec de la vérification des doublons');
      return await res.json();
    } catch (err) {
      console.error('Erreur duplication:', err);
      return { exists: false };
    }
  };

  // Handle form submission for creating a beneficiary
  const handleSubmit = async (data: BeneficiaireData) => {
    const result = await checkDuplicate(data);

    // If duplicate exists, ask user for confirmation
    if (result.exists) {
      const confirm = window.confirm(
        t('duplicate_beneficiary_message', {
          firstname: result.beneficiaire?.prenom || '',
          lastname: result.beneficiaire?.nom || '',
          date: result.beneficiaire?.created_at || '',
        })
      );
      if (!confirm) return;
    }

    try {
      const response = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Échec de la création');
      router.push('/beneficiaires');
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      alert(t('error_creating_beneficiary'));
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('add_beneficiary')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('add_beneficiary_description')}</p>
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

        {/* Beneficiary form for creation */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <BeneficiaireForm
            onSubmit={handleSubmit}
            submitLabel={t('create_beneficiary')}
          />
        </div>
      </div>
    </main>
  );
}

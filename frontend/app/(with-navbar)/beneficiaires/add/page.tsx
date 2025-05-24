'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import BeneficiaireForm from '@/components/beneficiaireForm';
import { useRouter } from 'next/navigation';

export default function AddBeneficiaire() {
  const router = useRouter();
  const { t } = useTranslation();

  interface BeneficiaireData {
    ben_nom: string;
    ben_prenom: string;
    ben_date_naissance: string;
    ben_sexe: string;
  }

  const checkDuplicate = async (data: BeneficiaireData) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ben_nom: data.ben_nom,
        ben_prenom: data.ben_prenom,
        ben_date_naissance: data.ben_date_naissance,
        ben_sexe: data.ben_sexe,
      }),
    });

    return await res.json();
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
            onSubmit={async (data) => {
              const result = await checkDuplicate(data);

              if (result.exists) {
                const confirm = window.confirm(
                  t('duplicate_beneficiary_message', {
                    firstname: result.beneficiaire.prenom,
                    lastname: result.beneficiaire.nom,
                    date: result.beneficiaire.created_at
                  })
                );

                if (!confirm) return;
              }

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });

              if (response.ok) {
                router.push('/beneficiaires');
              } else {
                const errorData = await response.json();
                console.error('Erreur lors de la création', errorData);
                alert(t('error_creating_beneficiary'));
              }
            }}
            submitLabel={t('create_beneficiary')}
          />
        </div>
      </div>
    </main>
  );
}
'use client';

import Link from 'next/link';
import ActiviteForm from '@/components/ActiviteForm';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function CreateActivitePage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('create_activity_title')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('create_activity_description')}</p>
            </div>
            <Link
              href="/activites"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              {t('back_to_list')}
            </Link>
          </div>
        </header>

        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <ActiviteForm
            submitLabel={t('create_activity_button')}
            onSubmit={async (data) => {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });

              if (res.ok) {
                router.push('/activites');
              } else {
                const err = await res.json();
                alert(err.message || 'Erreur lors de la création');
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}

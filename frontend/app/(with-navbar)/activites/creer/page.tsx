'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import ActiviteForm from '@/components/ActiviteForm';
import useAuthGuard from '@/lib/hooks/useAuthGuard';
import { useApi } from '@/lib/hooks/useApi';

type ActivityCreate = {
  act_nom: string;
  act_dateDebut: string;
  act_dateFin: string;
  act_part_id: string;
  act_pro_id: string;
};

export default function CreateActivitePage() {
  useAuthGuard(); // Protect the page with an authentication guard
  const { callApi } = useApi(); // Custom hook to make API calls
  const { t } = useTranslation(); // i18n translation hook
  const router = useRouter(); // Router instance for navigation
  const [loading, setLoading] = useState(false); // Loading state for the form

  // Handle the form submission
  const handleSubmit = async (data: ActivityCreate) => {
    setLoading(true);
    try {
      // Send a POST request to create a new activity
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // If creation is successful, redirect to activity list
      if (res.ok) {
        router.push('/activites');
      } else {
        // Otherwise, display the error message
        const err = await res.json();
        alert(err.message || t('error_creating_activity'));
      }
    } catch (err) {
      console.error('Erreur création activité', err);
      alert(t('error_creating_activity'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Page header with title and back button */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('create_activity_title')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('create_activity_description')}</p>
            </div>
            {/* Link to go back to the list of activities */}
            <Link
              href="/activites"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              {t('back_to_list')}
            </Link>
          </div>
        </header>

        {/* Activity form section */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <ActiviteForm
            submitLabel={loading ? t('creating') + '...' : t('create_activity_button')}
            onSubmit={handleSubmit}
            callApi={callApi}
          />
        </div>
      </div>
    </main>
  );
}

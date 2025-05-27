'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import ActiviteForm from '@/components/ActiviteForm';
import useAuthGuard from '@/lib/hooks/useAuthGuard';
import { useApi } from '@/lib/hooks/useApi';

export default function UpdateActivitePage() {
  useAuthGuard();
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const { callApi } = useApi();

  const [initialData, setInitialData] = useState<null | {
    act_nom: string;
    act_dateDebut: string;
    act_dateFin: string;
    act_part_id: string;
    act_pro_id: string;
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites/${id}`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }

        const data = await res.json();
        setInitialData({
          act_nom: data.act_nom,
          act_dateDebut: data.act_dateDebut,
          act_dateFin: data.act_dateFin,
          act_part_id: data.act_part_id,
          act_pro_id: data.act_pro_id,
        });
      } catch (err) {
        console.error('Erreur chargement activité', err);
        alert(t('load_error') || 'Erreur lors du chargement de l’activité.');
      }
    };

    fetchData();
    // ⚠️ Ne surtout pas inclure `callApi` ou `t` ici pour éviter les appels en boucle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (data: any) => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/activites');
      } else {
        const err = await res.json();
        alert(err.message || t('update_error'));
      }
    } catch (err) {
      console.error('Erreur modification activité', err);
      alert(t('update_error'));
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('edit_activity')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">{t('edit_activity_description')}</p>
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
          {initialData && (
            <ActiviteForm
              initialData={initialData}
              submitLabel={t('save_changes')}
              onSubmit={handleUpdate}
              callApi={callApi}
            />
          )}
        </div>
      </div>
    </main>
  );
}

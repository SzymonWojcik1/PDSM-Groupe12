'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';

type Beneficiaire = {
  ben_id: string;
  ben_prenom: string;
  ben_nom: string;
  ben_date_naissance: string;
};

export default function AjouterBeneficiaire() {
  useAuthGuard();
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const { callApi } = useApi();

  const [activity, setActivity] = useState<any>(null);
  const [allBeneficiaires, setAllBeneficiaires] = useState<Beneficiaire[]>([]);
  const [activityBeneficiaires, setActivityBeneficiaires] = useState<Beneficiaire[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActivity = async () => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites/${id}`);
      const data = await res.json();
      setActivity(data);
    } catch (err) {
      console.error('Erreur chargement activité', err);
    }
  };

  const fetchAllBeneficiaires = async () => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires?search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setAllBeneficiaires(data);
    } catch (err) {
      console.error('Erreur chargement bénéficiaires', err);
    }
  };

  const fetchActivityBeneficiaires = async () => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites/${id}/beneficiaires`);
      const data = await res.json();
      setActivityBeneficiaires(data);
    } catch (err) {
      console.error('Erreur chargement bénéficiaires activité', err);
    }
  };

  const handleAddMany = async () => {
    setIsLoading(true);
    try {
      await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites/${id}/beneficiaires/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ben_ids: selectedIds }),
      });
      await fetchActivityBeneficiaires();
      setSelectedIds([]);
    } catch (err) {
      console.error('Erreur ajout multiple', err);
    }
    setIsLoading(false);
  };

  const handleRemove = async (benId: string) => {
    setIsLoading(true);
    try {
      await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites/${id}/beneficiaires/${benId}`, {
        method: 'DELETE',
      });
      await fetchActivityBeneficiaires();
    } catch (err) {
      console.error('Erreur suppression', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchActivity();
    fetchActivityBeneficiaires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchAllBeneficiaires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const availableBeneficiaires = allBeneficiaires.filter(
    b => !activityBeneficiaires.some(ab => ab.ben_id === b.ben_id)
  );

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('add_beneficiaries')}</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
            <p className="text-gray-600">
              {t('activity')} : <strong>{activity?.act_nom || t('loading')}</strong>
            </p>
          </div>
          <button
            onClick={() => router.push('/activites')}
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
          >
            ← {t('back_to_list')}
          </button>
        </header>

        {/* Zone de recherche et bouton d’ajout */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder={t('search_beneficiary')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-sm max-w-md"
          />
          <button
            onClick={handleAddMany}
            disabled={selectedIds.length === 0 || isLoading}
            className="ml-4 px-4 py-2 bg-[#9F0F3A] text-white rounded hover:bg-[#800d30] disabled:bg-gray-300"
          >
            {isLoading ? t('adding') : t('add')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bénéficiaires disponibles */}
          <section className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#9F0F3A] mb-4">{t('available_beneficiaries')}</h2>
            {availableBeneficiaires.length === 0 ? (
              <p className="text-gray-500">{t('no_beneficiaries_to_add')}</p>
            ) : (
              <ul className="space-y-2">
                {availableBeneficiaires.map(b => (
                  <li key={b.ben_id} className="flex justify-between items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(b.ben_id)}
                        onChange={(e) =>
                          setSelectedIds(prev =>
                            e.target.checked
                              ? [...prev, b.ben_id]
                              : prev.filter(id => id !== b.ben_id)
                          )
                        }
                      />
                      {b.ben_prenom} {b.ben_nom} – {b.ben_date_naissance}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Bénéficiaires inscrits */}
          <section className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#9F0F3A] mb-4">{t('registered_beneficiaries')}</h2>
            {activityBeneficiaires.length === 0 ? (
              <p className="text-gray-500">{t('no_registered_beneficiaries')}</p>
            ) : (
              <ul className="space-y-2">
                {activityBeneficiaires.map(b => (
                  <li key={b.ben_id} className="flex justify-between items-center">
                    <span>{b.ben_prenom} {b.ben_nom} – {b.ben_date_naissance}</span>
                    <button
                      onClick={() => handleRemove(b.ben_id)}
                      disabled={isLoading}
                      className="text-red-600 hover:underline disabled:text-gray-400"
                    >
                      {t('remove')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

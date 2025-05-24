'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getActivityById,
  fetchBeneficiaires,
  getActivityBeneficiaires,
  addBeneficiaireToActivity,
  removeBeneficiaireFromActivity,
} from '@/lib/api';

type Beneficiaire = {
  ben_id: string;
  ben_prenom: string;
  ben_nom: string;
  ben_date_naissance: string;
};

export default function AjouterBeneficiaire() {
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<any>(null);
  const [allBeneficiaires, setAllBeneficiaires] = useState<Beneficiaire[]>([]);
  const [activityBeneficiaires, setActivityBeneficiaires] = useState<Beneficiaire[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getActivityById(id as string);
        setActivity(data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'activité:', error);
      }
    };
    fetchActivity();
  }, [id]);

  useEffect(() => {
    const loadBeneficiaires = async () => {
      try {
        const data = await fetchBeneficiaires(searchTerm);
        setAllBeneficiaires(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des bénéficiaires:', error);
      }
    };
    loadBeneficiaires();
  }, [searchTerm]);

  const loadActivityBeneficiaires = async () => {
    try {
      const data = await getActivityBeneficiaires(id as string);
      setActivityBeneficiaires(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des bénéficiaires de l\'activité:', error);
    }
  };

  useEffect(() => {
    loadActivityBeneficiaires();
  }, [id]);

  const handleAddBeneficiaire = async (beneficiaireId: string) => {
    setIsLoading(true);
    try {
      await addBeneficiaireToActivity(id as string, beneficiaireId);
      await loadActivityBeneficiaires();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bénéficiaire:', error);
    }
    setIsLoading(false);
  };

  const handleRemoveBeneficiaire = async (beneficiaireId: string) => {
    setIsLoading(true);
    try {
      await removeBeneficiaireFromActivity(id as string, beneficiaireId);
      await loadActivityBeneficiaires();
    } catch (error) {
      console.error('Erreur lors de la suppression du bénéficiaire:', error);
    }
    setIsLoading(false);
  };

  const availableBeneficiaires = allBeneficiaires.filter(
    b => !activityBeneficiaires.some(ab => ab.ben_id === b.ben_id)
  );

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">
                {t('add_beneficiaries')}
              </h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">
                {t('activity')} : <strong>{activity?.act_nom || t('loading')}</strong>
              </p>
            </div>
            <button
              onClick={() => router.push('/activites')}
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              {t('back_to_list')}
            </button>
          </div>
        </header>

        {/* Barre de recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder={t('search_beneficiary')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bénéficiaires disponibles */}
          <section className="bg-white border rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('available_beneficiaries')}</h2>
            {availableBeneficiaires.length === 0 ? (
              <p className="text-gray-600">{t('no_beneficiaries_to_add')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="px-4 py-2">{t('firstname')}</th>
                      <th className="px-4 py-2">{t('lastname')}</th>
                      <th className="px-4 py-2">{t('birthdate')}</th>
                      <th className="px-4 py-2">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableBeneficiaires.map((b) => (
                      <tr key={b.ben_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{b.ben_prenom}</td>
                        <td className="px-4 py-2">{b.ben_nom}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{b.ben_date_naissance}</td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => handleAddBeneficiaire(b.ben_id)}
                            disabled={isLoading}
                            className="text-green-600 hover:underline disabled:text-gray-400"
                          >
                            {t('add')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Bénéficiaires déjà inscrits */}
          <section className="bg-white border rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('registered_beneficiaries')}</h2>
            {activityBeneficiaires.length === 0 ? (
              <p className="text-gray-600">{t('no_registered_beneficiaries')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="px-4 py-2">{t('firstname')}</th>
                      <th className="px-4 py-2">{t('lastname')}</th>
                      <th className="px-4 py-2">{t('birthdate')}</th>
                      <th className="px-4 py-2">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityBeneficiaires.map((b) => (
                      <tr key={b.ben_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{b.ben_prenom}</td>
                        <td className="px-4 py-2">{b.ben_nom}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{b.ben_date_naissance}</td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => handleRemoveBeneficiaire(b.ben_id)}
                            disabled={isLoading}
                            className="text-red-600 hover:underline disabled:text-gray-400"
                          >
                            {t('remove')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

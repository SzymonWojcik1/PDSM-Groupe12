'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  getActivityById, 
  fetchBeneficiaires, 
  getActivityBeneficiaires,
  addBeneficiaireToActivity,
  removeBeneficiaireFromActivity
} from '@/lib/api';

type Beneficiaire = {
  ben_id: string;
  ben_prenom: string;
  ben_nom: string;
  ben_date_naissance: string;
};

export default function AjouterBeneficiaire() {
  const { id } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<any>(null);
  const [allBeneficiaires, setAllBeneficiaires] = useState<Beneficiaire[]>([]);
  const [activityBeneficiaires, setActivityBeneficiaires] = useState<Beneficiaire[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Charger l'activité
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

  // Charger tous les bénéficiaires
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

  // Charger les bénéficiaires de l'activité
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

  // Filtrer les bénéficiaires qui ne sont pas déjà dans l'activité
  const availableBeneficiaires = allBeneficiaires.filter(
    b => !activityBeneficiaires.some(ab => ab.ben_id === b.ben_id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Ajouter Bénéficiaire - {activity?.act_nom || 'Chargement...'}
        </h1>
        <button
          onClick={() => router.push('/activites')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <span>← Retour aux activités</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un bénéficiaire..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bénéficiaires disponibles */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Bénéficiaires disponibles</h2>
          <div className="overflow-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Prénom</th>
                  <th className="border px-4 py-2">Nom</th>
                  <th className="border px-4 py-2">Date de naissance</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {availableBeneficiaires.map((b) => (
                  <tr key={b.ben_id}>
                    <td className="border px-4 py-2">{b.ben_prenom}</td>
                    <td className="border px-4 py-2">{b.ben_nom}</td>
                    <td className="border px-4 py-2">{b.ben_date_naissance}</td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleAddBeneficiaire(b.ben_id)}
                        disabled={isLoading}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:bg-gray-400"
                      >
                        Ajouter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bénéficiaires inscrits */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Bénéficiaires inscrits</h2>
          <div className="overflow-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Prénom</th>
                  <th className="border px-4 py-2">Nom</th>
                  <th className="border px-4 py-2">Date de naissance</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activityBeneficiaires.map((b) => (
                  <tr key={b.ben_id}>
                    <td className="border px-4 py-2">{b.ben_prenom}</td>
                    <td className="border px-4 py-2">{b.ben_nom}</td>
                    <td className="border px-4 py-2">{b.ben_date_naissance}</td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleRemoveBeneficiaire(b.ben_id)}
                        disabled={isLoading}
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:bg-gray-400"
                      >
                        Retirer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
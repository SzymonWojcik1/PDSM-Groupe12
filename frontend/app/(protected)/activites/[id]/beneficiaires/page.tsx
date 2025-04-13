'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../../hooks/useTranslation';

export default function AjouterBeneficiaires({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeneficiaires, setSelectedBeneficiaires] = useState<string[]>([]);

  // TODO: Remplacer par les vraies données de l'API
  const activite = {
    id: params.id,
    nom: 'Formation Excel',
    dateDebut: '2024-03-01',
    dateFin: '2024-03-15',
    projet: 'Projet A'
  };

  const beneficiaires = [
    { id: '1', nom: 'Dupont', prenom: 'Jean', pays: 'France' },
    { id: '2', nom: 'Martin', prenom: 'Marie', pays: 'Belgique' },
    { id: '3', nom: 'Smith', prenom: 'John', pays: 'Royaume-Uni' },
  ];

  const handleToggleBeneficiaire = (beneficiaireId: string) => {
    setSelectedBeneficiaires(prev =>
      prev.includes(beneficiaireId)
        ? prev.filter(id => id !== beneficiaireId)
        : [...prev, beneficiaireId]
    );
  };

  const handleSubmit = async () => {
    // TODO: Envoyer les données à l'API
    console.log('Bénéficiaires ajoutés:', selectedBeneficiaires);
    router.push('/activites');
  };

  const filteredBeneficiaires = beneficiaires.filter(beneficiaire =>
    `${beneficiaire.nom} ${beneficiaire.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter des bénéficiaires</h1>
          <p className="mt-1 text-sm text-gray-500">
            Activité : {activite.nom}
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="max-w-lg w-full lg:max-w-xs">
        <label htmlFor="search" className="sr-only">
          Rechercher un bénéficiaire
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Rechercher un bénéficiaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des bénéficiaires */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBeneficiaires.map((beneficiaire) => (
            <li key={beneficiaire.id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={selectedBeneficiaires.includes(beneficiaire.id)}
                    onChange={() => handleToggleBeneficiaire(beneficiaire.id)}
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {beneficiaire.prenom} {beneficiaire.nom}
                    </p>
                    <p className="text-sm text-gray-500">{beneficiaire.pays}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => router.back()}
        >
          Annuler
        </button>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleSubmit}
        >
          Ajouter les bénéficiaires sélectionnés
        </button>
      </div>
    </div>
  );
} 
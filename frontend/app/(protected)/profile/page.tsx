'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // TODO: Récupérer les informations de l'utilisateur depuis l'API
    // Simulation des données utilisateur
    setUser({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
  }, []);

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <button
          onClick={() => {
            // TODO: Implémenter la déconnexion
            window.location.href = '/auth/login';
          }}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Se déconnecter
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Prénom</p>
              <p className="text-lg font-medium">{user.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="text-lg font-medium">{user.lastName}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            onClick={() => {
              // TODO: Implémenter la modification du profil
              console.log('Modifier le profil');
            }}
          >
            Modifier le profil
          </button>
        </div>
      </div>
    </div>
  );
} 
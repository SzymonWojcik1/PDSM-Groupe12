'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';

export default function Register() {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    password_confirmation: '',
    telephone: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        const messages = Object.values(data.errors || {}).flat().join('\n');
        throw new Error(messages || data.message || 'Erreur lors de l’inscription');
      }

      // Stocker le token reçu
      localStorage.setItem('token', data.token);

      // Rediriger vers le profil
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <p className="text-sm text-gray-600">
      Déjà un compte ?{' '}
      <Link
        href="/auth/login"
        className="font-medium text-indigo-600 hover:text-indigo-500"
      >
        Se connecter
      </Link>
    </p>
  );

  return (
    <AuthForm
      title="Créer un compte"
      error={error}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText="S'inscrire"
      footer={footer}
    >
      <div>
        <label htmlFor="prenom" className="sr-only">
          Prénom
        </label>
        <input
          id="prenom"
          name="prenom"
          type="text"
          required
          placeholder="Prénom"
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          value={formData.prenom}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="nom" className="sr-only">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          placeholder="Nom"
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          value={formData.nom}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Adresse email"
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="telephone" className="sr-only">
          Téléphone
        </label>
        <input
          id="telephone"
          name="telephone"
          type="text"
          placeholder="Téléphone (facultatif)"
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          value={formData.telephone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Mot de passe"
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="password_confirmation" className="sr-only">
          Confirmer le mot de passe
        </label>
        <input
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          required
          placeholder="Confirmer le mot de passe"
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          value={formData.password_confirmation}
          onChange={handleChange}
        />
      </div>
    </AuthForm>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '../../components/AuthForm';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implémenter la logique de connexion
      console.log('Email:', email, 'Password:', password);
      
      // Simuler une erreur pour test@error.com
      if (email === 'test@error.com') {
        throw new Error('Identifiants invalides');
      }

      // Simuler une connexion réussie
      // TODO: Remplacer par votre vraie logique d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation d'un délai réseau
      
      // Redirection vers la page profil
      router.push('/profile');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <p className="text-sm text-gray-600">
      Pas encore de compte ?{' '}
      <Link 
        href="/auth/register" 
        className="font-medium text-indigo-600 hover:text-indigo-500"
      >
        S'inscrire
      </Link>
    </p>
  );

  return (
    <AuthForm
      title="Connexion"
      error={error}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText="Se connecter"
      footer={footer}
    >
      <div>
        <label htmlFor="email" className="sr-only">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link 
            href="/auth/forgot-password" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </AuthForm>
  );
} 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthForm from '../../components/AuthForm';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.message || Object.values(data.errors || {}).flat().join('\n');
        throw new Error(errorMessage || 'Erreur lors de l’envoi du lien');
      }

      setSuccess('Un email de réinitialisation a été envoyé à votre adresse.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <Link
      href="/auth/login"
      className="font-medium text-indigo-600 hover:text-indigo-500"
    >
      Retour à la connexion
    </Link>
  );

  return (
    <AuthForm
      title="Mot de passe oublié"
      subtitle="Entrez votre adresse email pour recevoir un lien de réinitialisation"
      error={error}
      success={success}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText="Envoyer le lien"
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
          className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
    </AuthForm>
  );
}

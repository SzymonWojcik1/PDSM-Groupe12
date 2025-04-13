'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const t = searchParams.get('token');
    const e = searchParams.get('email');
    if (t && e) {
      setToken(t);
      setEmail(e);
    } else {
      setError("Lien invalide ou incomplet.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation
        })
      });

      const data = await res.json();

      if (!res.ok) {
        let message = 'Erreur lors de la réinitialisation.';

        if (data.errors) {
          const errors = Object.entries(data.errors)
            .map(([key, val]) => `• ${key} : ${(val as string[]).join(', ')}`)
            .join('\n');
          message = errors;
        } else if (data.message) {
          message = data.message;
        }

        throw new Error(message);
      }

      setSuccess('Votre mot de passe a été réinitialisé avec succès.');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Nouveau mot de passe"
      subtitle="Saisissez et confirmez votre nouveau mot de passe"
      error={error}
      success={success}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText="Réinitialiser"
    >
      <div>
        <label htmlFor="password" className="sr-only">Nouveau mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Nouveau mot de passe"
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="passwordConfirmation" className="sr-only">Confirmation</label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          required
          placeholder="Confirmer le mot de passe"
          className="appearance-none rounded-b relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
      </div>
    </AuthForm>
  );
}

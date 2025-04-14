'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TwoFactorAuthPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:8000/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Code invalide');
      }

      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Vérification en deux étapes</h2>
      <p className="text-gray-600 mb-6">Un code de vérification vous a été envoyé par e-mail.</p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Entrez le code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500"
        >
          {isLoading ? 'Vérification...' : 'Vérifier'}
        </button>
      </form>
    </div>
  );
}

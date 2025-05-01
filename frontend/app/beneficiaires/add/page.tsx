'use client';

import BeneficiaireForm from '@/components/beneficiaireForm';
import { useRouter } from 'next/navigation';

export default function AddBeneficiaire() {
  const router = useRouter();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="w-full font-semibold py-2 rounded bg-blue-600 text-white hover:bg-blue-800"
      >
        Retour
      </button>

      <h1 className="text-3xl font-bold mb-8 text-center">Ajouter un bénéficiaire</h1>

      <BeneficiaireForm
        onSubmit={async (data) => {
          const response = await fetch('http://localhost:8000/api/beneficiaires', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            router.push('/beneficiaires');
          } else {
            const errorData = await response.json();
            console.error('Erreur lors de la création', errorData);
            alert('Erreur lors de la création du bénéficiaire.');
          }
        }}
        submitLabel="Créer le bénéficiaire"
      />
    </main>
  );
}
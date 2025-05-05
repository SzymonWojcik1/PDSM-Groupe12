'use client';

import BeneficiaireForm from '@/components/beneficiaireForm';
import { useRouter } from 'next/navigation';

export default function AddBeneficiaire() {
  const router = useRouter();

  interface BeneficiaireData {
    ben_nom: string;
    ben_prenom: string;
    ben_date_naissance: string;
    ben_sexe: string;
  }

  const checkDuplicate = async (data: BeneficiaireData) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ben_nom: data.ben_nom,
        ben_prenom: data.ben_prenom,
        ben_date_naissance: data.ben_date_naissance,
        ben_sexe: data.ben_sexe,
      }),
    });

    return await res.json();
  };

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
          const result = await checkDuplicate(data);

          if (result.exists) {
            const confirm = window.confirm(
              `Le bénéficiaire ${result.beneficiaire.prenom} ${result.beneficiaire.nom} existe déjà.\n` +
              `Il a été ajouté le ${result.beneficiaire.created_at}.\n\n` +
              `Voulez-vous l’ajouter quand même ?`
            );

            if (!confirm) return;
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires`, {
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
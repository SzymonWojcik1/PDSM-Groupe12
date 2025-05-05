'use client';

import BeneficiaireForm from '@/components/beneficiaireForm';
import { useEffect, useState } from 'react';
import type { BeneficiaireFormData } from '@/components/beneficiaireForm';
import { useParams, useRouter } from 'next/navigation';

export default function UpdateBeneficiairePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<BeneficiaireFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`)
      .then((res) => res.json())
      .then(setInitialData)
      .catch((err) => {
        console.error('Erreur fetch bénéficiaire:', err);
        alert("Erreur lors du chargement du bénéficiaire");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData: BeneficiaireFormData) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      router.push('/beneficiaires');
    } else {
      const errorData = await response.json();
      console.error('Erreur lors de la mise à jour', errorData);
      alert('Erreur lors de la mise à jour du bénéficiaire.');
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <BeneficiaireForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}
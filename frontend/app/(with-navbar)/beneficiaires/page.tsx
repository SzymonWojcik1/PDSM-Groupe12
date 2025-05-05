'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BeneficiaireFilters from '@/components/beneficiaireFilters';
import BeneficiaireTable, { Beneficiaire, EnumMap } from '@/components/beneficiaireTable';

export default function BeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [enums, setEnums] = useState<EnumMap>({});
  const [filters, setFilters] = useState({
    region: '',
    pays: '',
    zone: '',
    type: '',
    sexe: '',
    genre: '',
    search: '',
  });

  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/enums?locale=en`)
      .then(res => res.json())
      .then(setEnums)
      .catch(err => console.error('Erreur fetch enums:', err));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires?${query.toString()}`)
      .then(res => res.json())
      .then(setBeneficiaires)
      .catch(err => console.error('Erreur fetch bénéficiaires:', err));
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?");
    if (!confirmed) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/${id}`, {
        method: 'DELETE',
      });

      setBeneficiaires(prev => prev.filter(b => b.ben_id !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  const handleRegionChange = (region: string) => {
    setFilters(prev => ({ ...prev, region, pays: '' }));
  };

  const resetFilters = () => {
    setFilters({
      region: '',
      pays: '',
      zone: '',
      type: '',
      sexe: '',
      genre: '',
      search: '',
    });
  };

  const handleUpdate = (id: string) => {
    router.push(`/beneficiaires/${id}/update`);
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires/import`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.doublons?.length > 0) {
          alert(`Import partiel : ${json.lignes_importées} ligne(s) importée(s), ${json.doublons.length} doublon(s) détecté(s).`);
          console.log("Doublons détectés :", json.doublons);
          // TODO : affichage/traitement des doublons un par un
        } else {
          alert('Import terminé avec succès.');
        }
      } else {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'erreurs_import_beneficiaires.xlsx';
        a.click();
        alert('Certaines lignes contiennent des erreurs. Le fichier d’erreurs a été téléchargé.');
      }
    } catch (error) {
      console.error('Erreur importation fichier :', error);
      alert('Une erreur est survenue lors de l’importation.');
    }
  };

  return (
    <main className="p-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          onClick={() => router.push('/beneficiaires/add')}
        >
          Ajouter un bénéficiaire
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
          onClick={() => router.push('/beneficiaires/delete')}
        >
          Supprimer bénéficiaire(s)
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push('/beneficiaires/dashboard')}
        >
          Accéder au dashboard
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => router.push('/beneficiaires/export')}
        >
          Exporter les bénéficiaires
        </button>
        <a
          href="http://localhost:8000/beneficiaires/template"
          download
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700 inline-block"
        >
          Télécharger le modèle Excel
        </a>
      </div>

      <BeneficiaireFilters
        filters={filters}
        onChange={handleChange}
        onRegionChange={handleRegionChange}
        onReset={resetFilters}
        enums={enums}
      />

      <h1 className="text-2xl font-semibold mb-4">Liste des bénéficiaires</h1>

      {beneficiaires.length === 0 ? (
        <p>Aucun bénéficiaire trouvé.</p>
      ) : (
        <BeneficiaireTable
          beneficiaires={beneficiaires}
          enums={enums}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
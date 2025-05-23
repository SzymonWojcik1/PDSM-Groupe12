'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ActiviteFilters from '@/components/activiteFilters';
import ActiviteTable, { Activite } from '@/components/ActiviteTable';

type Partenaire = {
  part_id: number;
  part_nom: string;
};

type Projet = {
  pro_id: number;
  pro_nom: string;
};

export default function ActivitesPage() {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [filtered, setFiltered] = useState<Activite[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [filters, setFilters] = useState({ search: '', partenaire: '', projet: '' });

  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites`)
      .then(res => res.json())
      .then(data => {
        setActivites(data);
        setFiltered(data);
      });
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
      .then(res => res.json())
      .then(setPartenaires);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projets`)
      .then(res => res.json())
      .then(setProjets);
  }, []);

  useEffect(() => {
    let result = [...activites];
    if (filters.search) {
      result = result.filter(a =>
        a.act_nom.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.partenaire) {
      result = result.filter(a => a.partenaire?.part_id.toString() === filters.partenaire);
    }
    if (filters.projet) {
      result = result.filter(a => a.projet?.pro_id.toString() === filters.projet);
    }
    setFiltered(result);
  }, [filters, activites]);

  const deleteActivite = async (id: number) => {
    if (!confirm('Supprimer cette activité ?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites/${id}`, { method: 'DELETE' });
    setActivites(prev => prev.filter(a => a.act_id !== id));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', partenaire: '', projet: '' });
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Gestion des activités</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
          <p className="text-gray-600">Consultez, filtrez et gérez les activités enregistrées dans le système.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/activites/creer')}
              className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium"
            >
              + Créer une activité
            </button>

            <button
              onClick={() => router.push('/activites/import')}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              Importer un fichier
            </button>

            <button
              onClick={() => router.push('/activites/export')}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              Exporter les données
            </button>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL_WITHOUT_API}modele-import-activites`}
              download
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              Télécharger modèle Excel
            </a>

            <button
              onClick={() => router.push('/activites/dashboard')}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              Voir le dashboard
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">Filtrer les activités</h2>
          <ActiviteFilters
            filters={filters}
            partenaires={partenaires}
            projets={projets}
            onChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">Liste des activités</h2>
          <ActiviteTable activites={filtered} onDelete={deleteActivite} />
        </section>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjetFilters from '@/components/ProjetFilters';
import ProjetTable, { Projet } from '@/components/ProjetTable';

export default function ProjetsPage() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [filtered, setFiltered] = useState<Projet[]>([]);
  const [filters, setFilters] = useState({ search: '', dateDebut: '', dateFin: '' });

  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projets`)
      .then(res => res.json())
      .then(data => {
        setProjets(data);
        setFiltered(data);
      });
  }, []);

  useEffect(() => {
    let result = [...projets];
    if (filters.search) {
      result = result.filter(p =>
        p.pro_nom.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.dateDebut) {
      result = result.filter(p => p.pro_dateDebut >= filters.dateDebut);
    }
    if (filters.dateFin) {
      result = result.filter(p => p.pro_dateFin <= filters.dateFin);
    }
    setFiltered(result);
  }, [filters, projets]);

  const deleteProjet = async (id: number) => {
    if (!confirm('Supprimer ce projet ?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projets/${id}`, { method: 'DELETE' });
    setProjets(prev => prev.filter(p => p.pro_id !== id));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', dateDebut: '', dateFin: '' });
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Gestion des projets</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
          <p className="text-gray-600">Consultez, filtrez et gérez les projets enregistrés dans le système.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <button
            onClick={() => router.push('/projets/creer')}
            className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium"
          >
            + Créer un projet
          </button>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">Filtrer les projets</h2>
          <ProjetFilters filters={filters} onChange={handleFilterChange} onReset={resetFilters} />
        </div>

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">Liste des projets</h2>
          <ProjetTable projets={filtered} onDelete={deleteProjet} />
        </section>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ActiviteFilters from '@/components/activiteFilters';
import ActiviteTable, { Activite } from '@/components/ActiviteTable';
import ImportExcelActivite from '@/components/ImportExcelActivite';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';

type Partenaire = {
  part_id: number;
  part_nom: string;
};

type Projet = {
  pro_id: number;
  pro_nom: string;
};

export default function ActivitesPage() {
  const { t } = useTranslation();
  useAuthGuard(); // Ensure the user is authenticated
  const { callApi } = useApi();
  const router = useRouter();
  const importRef = useRef<HTMLInputElement>(null);

  const [activites, setActivites] = useState<Activite[]>([]);
  const [filtered, setFiltered] = useState<Activite[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [filters, setFilters] = useState({ search: '', partenaire: '', projet: '' });

  // Fetch initial data: activities, partners, and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitesRes, partenairesRes, projetsRes] = await Promise.all([
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites`),
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`),
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/projets`),
        ]);

        const [activitesData, partenairesData, projetsData] = await Promise.all([
          activitesRes.json(),
          partenairesRes.json(),
          projetsRes.json(),
        ]);

        setActivites(activitesData);
        setFiltered(activitesData);
        setPartenaires(partenairesData);
        setProjets(projetsData);
      } catch (err) {
        console.error('Erreur chargement données', err);
      }
    };

    fetchData();
  }, [callApi]);

  // Apply filters to activities when filters or data change
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

  // Delete an activity and update local state
  const deleteActivite = async (id: number) => {
    if (!confirm(t('confirm_delete_activity'))) return;
    await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites/${id}`, { method: 'DELETE' });
    setActivites(prev => prev.filter(a => a.act_id !== id));
  };

  // Handle changes in search/filter form
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({ search: '', partenaire: '', projet: '' });
  };

  // Export the filtered activities to a CSV file
  const exportToCSV = () => {
    const headers = [
      t('table_name'),
      t('table_start'),
      t('table_end'),
      t('table_partner'),
      t('table_project')
    ].join(',');

    const rows = filtered.map(activite => [
      activite.act_nom,
      activite.act_dateDebut,
      activite.act_dateFin,
      activite.partenaire?.part_nom || '',
      activite.projet?.pro_nom || ''
    ].map(field => `"${field}"`).join(','));

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `activites_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger file input click for Excel import
  const triggerImport = () => {
    importRef.current?.click();
  };

  // Handle Excel file import and send rows to API
  const handleImport = async (rows: Record<string, unknown>[]) => {
    let imported = 0;
    let ignored = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const partenaireNom = row['Partenaire'];
        const projetNom = row['Projet'];

        if (
          typeof partenaireNom !== 'string' ||
          partenaireNom.trim() === '' ||
          typeof projetNom !== 'string' ||
          projetNom.trim() === ''
        ) {
          ignored++;
          continue;
        }

        const partenaire = partenaires.find(p => p.part_nom === partenaireNom.trim());
        const projet = projets.find(p => p.pro_nom === projetNom.trim());

        if (!partenaire || !projet) {
          ignored++;
          continue;
        }

        const finalRow = {
          act_nom: row['Nom de l’activité'],
          act_dateDebut: row['Date de début'],
          act_dateFin: row['Date de fin'],
          act_part_id: partenaire.part_id,
          act_pro_id: projet.pro_id,
        };

        const response = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/activites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalRow),
        });

        if (!response.ok) {
          failed++;
          continue;
        }

        imported++;
      } catch {
        failed++;
        continue;
      }
    }

    // Show import summary
    alert(
      `${imported} ligne(s) importée(s) avec succès.\n` +
      `${ignored} ligne(s) ignorée(s).\n` +
      `${failed} ligne(s) échouée(s).`
    );

    location.reload();
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('activities_management')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
          <p className="text-gray-600">{t('activities_description')}</p>
        </header>

        {/* Action buttons */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => router.push('/activites/creer')} className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium">
              {t('create_activity')}
            </button>

            <button onClick={triggerImport} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition">
              {t('import_file')}
            </button>

            <ImportExcelActivite
              ref={importRef}
              fromCol={0}
              toCol={5}
              dateFields={['Date de début', 'Date de fin']}
              onPreview={handleImport}
            />

            <button onClick={exportToCSV} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition">
              {t('export_data')}
            </button>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL_WITHOUT_API}activites/template`}
              download
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('download_excel_template')}
            </a>

            <button onClick={() => router.push('/activites/dashboard')} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition">
              {t('view_dashboard')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('filter_activities')}</h2>
          <ActiviteFilters
            filters={filters}
            partenaires={partenaires}
            projets={projets}
            onChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>

        {/* Table of activities */}
        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('activities_list')}</h2>
          <ActiviteTable activites={filtered} onDelete={deleteActivite} />
        </section>
      </div>
    </main>
  );
}

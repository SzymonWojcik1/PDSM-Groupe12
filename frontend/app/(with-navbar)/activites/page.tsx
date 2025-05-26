'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ActiviteFilters from '@/components/activiteFilters';
import ActiviteTable, { Activite } from '@/components/ActiviteTable';
import ImportExcelActivite from '@/components/ImportExcelActivite';

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
  const [activites, setActivites] = useState<Activite[]>([]);
  const [filtered, setFiltered] = useState<Activite[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [filters, setFilters] = useState({ search: '', partenaire: '', projet: '' });

  const router = useRouter();
  const importRef = useRef<HTMLInputElement>(null);

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
    if (!confirm(t('confirm_delete_activity'))) return;
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

  const triggerImport = () => {
    importRef.current?.click();
  };

  const handleImport = async (rows: Record<string, unknown>[]) => {
  let imported = 0;
  let ignored = 0;
  let failed = 0;

  for (const [index, row] of rows.entries()) {
    try {
      const partenaireNom = row['Partenaire'];
      const projetNom = row['Projet'];

      if (
        typeof partenaireNom !== 'string' ||
        partenaireNom.trim() === '' ||
        typeof projetNom !== 'string' ||
        projetNom.trim() === ''
      ) {
        console.warn(`Ligne ${index + 1} ignorée : partenaire ou projet vide ou manquant`, {
          partenaire: partenaireNom,
          projet: projetNom,
        });
        ignored++;
        continue;
      }

      const partenaire = partenaires.find(p => p.part_nom === partenaireNom.trim());
      const projet = projets.find(p => p.pro_nom === projetNom.trim());

      if (!partenaire || !projet) {
        console.warn(`Ligne ${index + 1} ignorée : partenaire ou projet introuvable`, {
          partenaire: partenaireNom,
          projet: projetNom,
        });
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalRow),
      });

      let json = {};
      try {
        json = await response.json();
      } catch (e) {
        console.warn(`Ligne ${index + 1} : réponse non JSON ou vide`, e);
      }

      if (!response.ok) {
        console.error(`Ligne ${index + 1} échouée :`, json);
        failed++;
        continue;
      }

      console.log(`Ligne ${index + 1} importée avec succès :`, json);
      imported++;

    } catch (err) {
      console.error(`Ligne ${index + 1} : erreur inattendue`, err);
      failed++;
      continue;
    }
  }
  alert(
    `${imported} ligne(s) importée(s) avec succès.\n` +
    `${ignored} ligne(s) ignorée(s) (projet ou partenaire vide/introuvable).\n` +
    `${failed} ligne(s) échouée(s).`
  );
  location.reload();
};

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('activities_management')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
          <p className="text-gray-600">{t('activities_description')}</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/activites/creer')}
              className="bg-[#9F0F3A] text-white px-5 py-2 rounded-lg hover:bg-[#800d30] transition font-medium"
            >
              {t('create_activity')}
            </button>

            <button
              onClick={triggerImport}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('import_file')}
            </button>
            <ImportExcelActivite
              ref={importRef}
              fromCol={0}
              toCol={5}
              dateFields={['Date de début', 'Date de fin']}
              onPreview={handleImport}
              extraValidation={(row) => {
                const partenaire = partenaires.find(p => p.part_nom === row['Partenaire']);
                const projet = projets.find(p => p.pro_nom === row['Projet']);
                if (!partenaire) return `Partenaire introuvable : ${row['Partenaire']}`;
                if (!projet) return `Projet introuvable : ${row['Projet']}`;
                return null;
              }}
            />

            <button
              onClick={exportToCSV}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('export_data')}
            </button>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL_WITHOUT_API}activites/template`}
              download
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('download_excel_template')}
            </a>

            <button
              onClick={() => router.push('/activites/dashboard')}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition"
            >
              {t('view_dashboard')}
            </button>
          </div>
        </div>

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

        <section className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#9F0F3A] mb-4">{t('activities_list')}</h2>
          <ActiviteTable activites={filtered} onDelete={deleteActivite} />
        </section>
      </div>
    </main>
  );
}

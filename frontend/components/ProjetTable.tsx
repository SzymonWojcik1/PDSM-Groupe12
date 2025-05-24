'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export type Projet = {
  pro_id: number;
  pro_nom: string;
  pro_dateDebut: string;
  pro_dateFin: string;
  partenaire: { part_nom: string };
};

interface ProjetTableProps {
  projets: Projet[];
  onDelete: (id: number) => void;
}

export default function ProjetTable({ projets, onDelete }: ProjetTableProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (projets.length === 0) {
    return <p className="text-gray-600">{t('no_projects_found')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border border-gray-200 text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">{t('table_name')}</th>
            <th className="px-4 py-2 min-w-[120px]">{t('table_start')}</th>
            <th className="px-4 py-2 min-w-[120px]">{t('table_end')}</th>
            <th className="px-4 py-2">{t('table_partner')}</th>
            <th className="px-4 py-2">{t('table_actions')}</th>
          </tr>
        </thead>
        <tbody>
          {projets.map((p) => (
            <tr key={p.pro_id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-800">{p.pro_nom}</td>
              <td className="px-4 py-2 text-gray-800 whitespace-nowrap">{p.pro_dateDebut}</td>
              <td className="px-4 py-2 text-gray-800 whitespace-nowrap">{p.pro_dateFin}</td>
              <td className="px-4 py-2 text-gray-800">{p.partenaire?.part_nom}</td>
              <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                <button
                  onClick={() => router.push(`/projets/${p.pro_id}/update`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => onDelete(p.pro_id)}
                  className="text-sm text-gray-500 hover:text-red-600 hover:underline"
                >
                  {t('delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

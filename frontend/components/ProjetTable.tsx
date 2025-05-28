'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/**
 * Project type definition
 * Represents the structure of a project in the system
 */
export type Projet = {
  pro_id: number;          // Project unique identifier
  pro_nom: string;         // Project name
  pro_dateDebut: string;   // Project start date
  pro_dateFin: string;     // Project end date
  partenaire: {            // Associated partner information
    part_nom: string;      // Partner name
  };
};

/**
 * Props interface for the ProjetTable component
 */
interface ProjetTableProps {
  projets: Projet[];       // Array of projects to display
  onDelete: (id: number) => void;  // Callback function for project deletion
}

/**
 * Project Table Component
 * 
 * Displays a table of projects with their details and actions.
 * Features include:
 * - Project listing with dates and partner information
 * - Edit and delete actions
 * - Internationalized date formatting
 * - Responsive design
 */
export default function ProjetTable({ projets, onDelete }: ProjetTableProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // Display message if no projects are found
  if (projets.length === 0) {
    return <p className="text-gray-600">{t('no_projects_found')}</p>;
  }

  /**
   * Formats a date string according to the specified locale
   * @param dateString - The date string to format
   * @param locale - The locale to use for formatting (defaults to 'en')
   * @returns Formatted date string or original string if invalid
   */
  function formatDate(dateString: string, locale = 'en') {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  return (
    <div className="overflow-x-auto">
      {/* Projects table */}
      <table className="w-full table-auto border border-gray-200 text-sm text-left">
        {/* Table header */}
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">{t('table_name')}</th>
            <th className="px-4 py-2 min-w-[120px]">{t('table_start')}</th>
            <th className="px-4 py-2 min-w-[120px]">{t('table_end')}</th>
            <th className="px-4 py-2">{t('table_partner')}</th>
            <th className="px-4 py-2">{t('table_actions')}</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody>
          {projets.map((p) => (
            <tr key={p.pro_id} className="border-t hover:bg-gray-50">
              {/* Project name */}
              <td className="px-4 py-2 text-gray-800">{p.pro_nom}</td>
              {/* Start date */}
              <td className="px-4 py-2 text-gray-800 whitespace-nowrap">
                {formatDate(p.pro_dateDebut, i18n.language)}
              </td>
              {/* End date */}
              <td className="px-4 py-2 text-gray-800 whitespace-nowrap">
                {formatDate(p.pro_dateFin, i18n.language)}
              </td>
              {/* Partner name */}
              <td className="px-4 py-2 text-gray-800">{p.partenaire?.part_nom}</td>
              {/* Action buttons */}
              <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                {/* Edit button */}
                <button
                  onClick={() => router.push(`/projets/${p.pro_id}/update`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t('edit')}
                </button>
                {/* Delete button */}
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

'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/**
 * Activity type definition
 * Represents the structure of an activity in the system
 */
export type Activite = {
  act_id: number;           // Activity unique identifier
  act_nom: string;          // Activity name
  act_dateDebut: string;    // Activity start date
  act_dateFin: string;      // Activity end date
  partenaire: {             // Associated partner information
    part_nom: string;       // Partner name
    part_id: number;        // Partner identifier
  };
  projet: {                 // Associated project information
    pro_nom: string;        // Project name
    pro_id: number;         // Project identifier
  };
};

/**
 * Props interface for the ActiviteTable component
 */
interface ActiviteTableProps {
  activites: Activite[];    // Array of activities to display
  onDelete: (id: number) => void;  // Callback function for activity deletion
}

/**
 * Activity Table Component
 * 
 * Displays a table of activities with their details and actions.
 * Features include:
 * - Activity listing with dates, partner and project information
 * - Edit, delete and beneficiary management actions
 * - Internationalized date formatting
 * - Responsive design
 */
export default function ActiviteTable({ activites, onDelete }: ActiviteTableProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // Display message if no activities are found
  if (activites.length === 0) {
    return <p className="text-gray-600">{t('no_activities_found')}</p>;
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
      {/* Activities table */}
      <table className="w-full table-auto border border-gray-200 text-sm text-left">
        {/* Table header */}
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">{t('table_name')}</th>
            <th className="px-4 py-2 min-w-[120px]">{t('table_start')}</th>
            <th className="px-4 py-2 min-w-[120px]">{t('table_end')}</th>
            <th className="px-4 py-2">{t('table_partner')}</th>
            <th className="px-4 py-2">{t('table_project')}</th>
            <th className="px-4 py-2">{t('table_actions')}</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody>
          {activites.map((a) => (
            <tr key={a.act_id} className="border-t hover:bg-gray-50">
              {/* Activity name */}
              <td className="px-4 py-2 text-gray-800">{a.act_nom}</td>
              {/* Start date */}
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">
                {formatDate(a.act_dateDebut, i18n.language)}
              </td>
              {/* End date */}
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">
                {formatDate(a.act_dateFin, i18n.language)}
              </td>
              {/* Partner name */}
              <td className="px-4 py-2 text-gray-800">{a.partenaire?.part_nom}</td>
              {/* Project name */}
              <td className="px-4 py-2 text-gray-800">{a.projet?.pro_nom}</td>
              {/* Action buttons */}
              <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                {/* Add beneficiaries button */}
                <button
                  onClick={() => router.push(`/activites/${a.act_id}/ajouter-beneficiaire`)}
                  className="text-sm text-[#9F0F3A] hover:underline"
                >
                  {t('beneficiariesMaj')}
                </button>
                {/* Edit button */}
                <button
                  onClick={() => router.push(`/activites/${a.act_id}/update`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t('edit')}
                </button>
                {/* Delete button */}
                <button
                  onClick={() => onDelete(a.act_id)}
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

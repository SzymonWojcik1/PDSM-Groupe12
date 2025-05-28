'use client';

import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props interface for the ActiviteFilters component
 * Defines the structure of filters and callbacks
 */
type Props = {
  filters: {                        // Current filter values
    search: string;                 // Search term for activity name
    partenaire: string;            // Selected partner filter
    projet: string;                // Selected project filter
  };
  partenaires: {                    // List of available partners
    part_id: number;               // Partner identifier
    part_nom: string;              // Partner name
  }[];
  projets: {                        // List of available projects
    pro_id: number;                // Project identifier
    pro_nom: string;               // Project name
  }[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;  // Filter change handler
  onReset: () => void;             // Filter reset handler
};

/**
 * Activity Filters Component
 * 
 * A component that provides filtering capabilities for activities.
 * Features include:
 * - Text search by activity name
 * - Partner filtering
 * - Project filtering
 * - Filter reset functionality
 * - Responsive design
 * - Internationalization support
 */
export default function ActiviteFilters({ filters, partenaires, projets, onChange, onReset }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3">
      {/* Search input for activity name */}
      <input
        type="text"
        name="search"
        placeholder={t('search_by_name')}
        value={filters.search}
        onChange={onChange}
        className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
      />

      {/* Partner filter dropdown */}
      <select
        name="partenaire"
        value={filters.partenaire}
        onChange={onChange}
        className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
      >
        <option value="">{t('all_partners')}</option>
        {partenaires.map(p => (
          <option key={p.part_id} value={p.part_id}>
            {p.part_nom}
          </option>
        ))}
      </select>

      {/* Project filter dropdown */}
      <select
        name="projet"
        value={filters.projet}
        onChange={onChange}
        className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
      >
        <option value="">{t('all_projects')}</option>
        {projets.map(p => (
          <option key={p.pro_id} value={p.pro_id}>
            {p.pro_nom}
          </option>
        ))}
      </select>

      {/* Reset filters button */}
      <button
        onClick={onReset}
        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition text-sm"
      >
        {t('reset_filters')}
      </button>
    </div>
  );
}

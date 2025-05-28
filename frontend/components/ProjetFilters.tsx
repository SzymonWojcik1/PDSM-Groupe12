'use client';

import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props interface for the ProjetFilters component
 * Defines the structure of the filters and their handlers
 */
type Props = {
  filters: {
    search: string;        // Search term for project name
    dateDebut: string;     // Start date filter
    dateFin: string;       // End date filter
  };
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;  // Handler for filter changes
  onReset: () => void;     // Handler for resetting all filters
};

/**
 * Project Filters Component
 * 
 * Provides a set of filters for the projects list:
 * - Text search for project names
 * - Date range selection
 * - Reset functionality
 * 
 * Features:
 * - Responsive design
 * - Internationalization support
 * - Real-time filter updates
 */
export default function ProjetFilters({ filters, onChange, onReset }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search input for project names */}
      <input
        type="text"
        name="search"
        placeholder={t('search_by_name')}
        value={filters.search}
        onChange={onChange}
        className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
      />

      {/* Start date filter */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">{t('start_date')}</label>
        <input
          type="date"
          name="dateDebut"
          value={filters.dateDebut}
          onChange={onChange}
          className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
        />
      </div>

      {/* End date filter */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">{t('end_date')}</label>
        <input
          type="date"
          name="dateFin"
          value={filters.dateFin}
          onChange={onChange}
          className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
        />
      </div>

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

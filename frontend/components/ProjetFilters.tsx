'use client';

import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  filters: {
    search: string;
    dateDebut: string;
    dateFin: string;
  };
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
};

export default function ProjetFilters({ filters, onChange, onReset }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <input
        type="text"
        name="search"
        placeholder={t('search_by_name')}
        value={filters.search}
        onChange={onChange}
        className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
      />

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

      <button
        onClick={onReset}
        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition text-sm"
      >
        {t('reset_filters')}
      </button>
    </div>
  );
}

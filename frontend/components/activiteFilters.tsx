'use client';

import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  filters: {
    search: string;
    partenaire: string;
    projet: string;
  };
  partenaires: { part_id: number; part_nom: string }[];
  projets: { pro_id: number; pro_nom: string }[];
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onReset: () => void;
};

export default function ActiviteFilters({ filters, partenaires, projets, onChange, onReset }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        name="search"
        placeholder={t('search_by_name')}
        value={filters.search}
        onChange={onChange}
        className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-800"
      />

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

      <button
        onClick={onReset}
        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-100 transition text-sm"
      >
        {t('reset_filters')}
      </button>
    </div>
  );
}

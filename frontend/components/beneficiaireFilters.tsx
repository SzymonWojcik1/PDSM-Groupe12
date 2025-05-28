'use client';

import { useTranslation } from 'react-i18next';
import { countriesByRegion } from '@/lib/countriesByRegion';

// Props for the BeneficiaireFilters component
type FilterProps = {
  filters: {
    region: string;
    pays: string;
    zone: string;
    type: string;
    sexe: string;
    genre: string;
    search: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onRegionChange: (region: string) => void;
  onReset: () => void;
  enums: Record<string, { value: string; label: string }[]>;
};

/**
 * Filter form for beneficiaries.
 * Allows filtering by region, country, zone, type, sexe, genre, and search string.
 * - Uses enums for dropdowns (zone, type, sexe, genre).
 * - Uses countriesByRegion for region/country linkage.
 * - Calls onChange/onRegionChange/onReset handlers from parent.
 */
export default function BeneficiaireFilters({ filters, onChange, onRegionChange, onReset, enums }: FilterProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Search input for name or firstname */}
      <input
        type="text"
        name="search"
        placeholder={t('search_by_name_firstname')}
        value={filters.search}
        onChange={onChange}
        className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
      />

      {/* Region dropdown */}
      <select
        name="region"
        value={filters.region}
        onChange={(e) => onRegionChange(e.target.value)}
        className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
      >
        <option value="">{t('select_region')}</option>
        {Object.keys(countriesByRegion).map((region) => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      {/* Country dropdown, enabled only if region is selected */}
      <select
        name="pays"
        value={filters.pays}
        onChange={onChange}
        disabled={!filters.region}
        className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
      >
        <option value="">{t('select_country')}</option>
        {filters.region && countriesByRegion[filters.region as keyof typeof countriesByRegion]?.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>

      {/* Dropdowns for zone, type, sexe, genre using enums */}
      {['zone', 'type', 'sexe', 'genre'].map((field) => (
        <select
          key={field}
          name={field}
          value={filters[field as keyof typeof filters]}
          onChange={onChange}
          className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
        >
          <option value="">{t(`select_${field}`)}</option>
          {enums[field]?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}

      {/* Reset filters button */}
      <div className="md:col-span-3 lg:col-span-4 text-right">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 mt-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
        >
          {t('reset_filters')}
        </button>
      </div>
    </div>
  );
}

'use client';

import { countriesByRegion } from '@/lib/countriesByRegion';

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

export default function BeneficiaireFilters({ filters, onChange, onRegionChange, onReset, enums }: FilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <input
        type="text"
        name="search"
        placeholder="Rechercher par nom ou prénom"
        value={filters.search}
        onChange={onChange}
        className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
      />

      <select
        name="region"
        value={filters.region}
        onChange={(e) => onRegionChange(e.target.value)}
        className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
      >
        <option value="">-- Région --</option>
        {Object.keys(countriesByRegion).map((region) => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      <select
        name="pays"
        value={filters.pays}
        onChange={onChange}
        disabled={!filters.region}
        className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
      >
        <option value="">-- Pays --</option>
        {filters.region && countriesByRegion[filters.region as keyof typeof countriesByRegion]?.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>

      {['zone', 'type', 'sexe', 'genre'].map((field) => (
        <select
          key={field}
          name={field}
          value={filters[field as keyof typeof filters]}
          onChange={onChange}
          className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
        >
          <option value="">-- {field.charAt(0).toUpperCase() + field.slice(1)} --</option>
          {enums[field]?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}

      <div className="md:col-span-3 lg:col-span-4 text-right">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 mt-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}

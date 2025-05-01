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

export default function BeneficiaireFilters({
  filters,
  onChange,
  onRegionChange,
  onReset,
  enums,
}: FilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <input
        type="text"
        name="search"
        placeholder="Rechercher par nom ou prénom"
        value={filters.search}
        onChange={onChange}
        className="border p-2 rounded"
      />

      <select
        name="region"
        value={filters.region}
        onChange={(e) => {
          const region = e.target.value;
          onRegionChange(region);
        }}
        className="border p-2 rounded"
      >
        <option value="">-- Région --</option>
        {Object.keys(countriesByRegion).map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>

      <select
        name="pays"
        value={filters.pays}
        onChange={onChange}
        className="border p-2 rounded"
        disabled={!filters.region}
      >
        <option value="">-- Pays --</option>
        {filters.region &&
          countriesByRegion[filters.region as keyof typeof countriesByRegion].map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
      </select>

      {['zone', 'type', 'sexe', 'genre'].map((field) => (
        <select
          key={field}
          name={field}
          value={filters[field as keyof typeof filters]}
          onChange={onChange}
          className="border p-2 rounded"
        >
          <option value="">-- {field.charAt(0).toUpperCase() + field.slice(1)} --</option>
          {enums[field]?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      <button
        className="col-span-full md:col-span-1 bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded"
        onClick={onReset}
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}
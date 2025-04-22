'use client';
import { useState } from 'react';
import { countriesByRegion } from '@/lib/countriesByRegion';

type Props = {
  onRegionChange: (region: string) => void;
  onCountryChange: (country: string) => void;
  regionError?: boolean;
  countryError?: boolean;
};

export default function RegionCountrySelector({
  onRegionChange,
  onCountryChange,
  regionError,
  countryError
}: Props) {
  const [selectedRegion, setSelectedRegion] = useState('');

  const handleRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setSelectedRegion(region);
    onRegionChange(region);
  };

  const handleCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCountryChange(e.target.value);
  };

  const regions = Object.keys(countriesByRegion);
  const countries = selectedRegion ? countriesByRegion[selectedRegion as keyof typeof countriesByRegion] : [];

  return (
    <div className="flex flex-col gap-4">
      <select
        onChange={handleRegion}
        className={`border p-2 rounded ${regionError ? 'border-red-500' : ''}`}
      >
        <option value="">Select a region</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        onChange={handleCountry}
        disabled={!selectedRegion}
        className={`border p-2 rounded ${countryError ? 'border-red-500' : ''}`}
      >
        <option value="">Select a country</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
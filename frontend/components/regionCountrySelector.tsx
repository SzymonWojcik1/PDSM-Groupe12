'use client';
import { useState } from 'react';
import { countriesByRegion } from '@/lib/countriesByRegion';

type Props = {
  onRegionChange: (region: string) => void;
  onCountryChange: (country: string) => void;
};

export default function RegionCountrySelector({ onRegionChange, onCountryChange }: Props) {
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
      <select onChange={handleRegion} className="border p-2 rounded">
        <option value="">Select a region</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select onChange={handleCountry} className="border p-2 rounded" disabled={!selectedRegion}>
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

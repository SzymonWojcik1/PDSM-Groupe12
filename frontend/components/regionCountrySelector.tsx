'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { countriesByRegion } from '@/lib/countriesByRegion';

type Props = {
  onRegionChange: (region: string) => void;
  onCountryChange: (country: string) => void;
  regionError?: boolean;
  countryError?: boolean;
  initialRegion?: string;
  initialCountry?: string;
};

export default function RegionCountrySelector({
  onRegionChange,
  onCountryChange,
  regionError,
  countryError,
  initialRegion = '',
  initialCountry = '',
}: Props) {
  const { t } = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);

  useEffect(() => {
    setSelectedRegion(initialRegion);
    setSelectedCountry(initialCountry);
  }, [initialRegion, initialCountry]);

  const handleRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedCountry('');
    onRegionChange(region);
    onCountryChange('');
  };

  const handleCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    onCountryChange(country);
  };

  const regions = Object.keys(countriesByRegion);
  const countries = selectedRegion ? countriesByRegion[selectedRegion as keyof typeof countriesByRegion] : [];

  return (
    <div className="flex flex-col gap-4">
      <select
        value={selectedRegion}
        onChange={handleRegion}
        className={`border p-2 rounded ${regionError ? 'border-red-500' : ''}`}
      >
        <option value="">{t('select_region')}</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        value={selectedCountry}
        onChange={handleCountry}
        disabled={!selectedRegion}
        className={`border p-2 rounded ${countryError ? 'border-red-500' : ''}`}
      >
        <option value="">{t('select_country')}</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

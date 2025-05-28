'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { countriesByRegion } from '@/lib/countriesByRegion';

// Props for the RegionCountrySelector component
type Props = {
  onRegionChange: (region: string) => void;      // Callback when region changes
  onCountryChange: (country: string) => void;    // Callback when country changes
  regionError?: boolean;                         // Show error styling for region
  countryError?: boolean;                        // Show error styling for country
  initialRegion?: string;                        // Initial region value
  initialCountry?: string;                       // Initial country value
};

/**
 * RegionCountrySelector component
 * - Dropdowns for selecting a region and a country (filtered by region).
 * - Handles error display and initial values.
 * - Calls parent handlers on change.
 */
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

  // Update local state if initial values change
  useEffect(() => {
    setSelectedRegion(initialRegion);
    setSelectedCountry(initialCountry);
  }, [initialRegion, initialCountry]);

  // Handle region dropdown change
  const handleRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedCountry('');
    onRegionChange(region);
    onCountryChange('');
  };

  // Handle country dropdown change
  const handleCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    onCountryChange(country);
  };

  // Get region and country options
  const regions = Object.keys(countriesByRegion);
  const countries = selectedRegion ? countriesByRegion[selectedRegion as keyof typeof countriesByRegion] : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Region dropdown */}
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

      {/* Country dropdown, enabled only if region is selected */}
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

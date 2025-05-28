'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

// Props for the EnumSelect component
type EnumSelectProps = {
  name: string; // Name of the select input
  label: string; // Label to display above the select
  options: { value: string; label: string }[]; // Enum options for the dropdown
  value: string; // Current selected value
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Change handler
  error?: boolean; // Whether to show error styling
  errorMessage?: string; // Custom error message
};

/**
 * EnumSelect component
 * - Renders a select dropdown for enum values.
 * - Displays a label, options, and error messages.
 * - Used for fields like type, zone, sexe, genre, etc.
 */
export default function EnumSelect({
  name,
  label,
  options,
  value,
  onChange,
  error = false,
  errorMessage = ''
}: EnumSelectProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      {/* Field label */}
      <label htmlFor={name} className={`text-sm font-medium text-left ${error ? 'text-red-600' : ''}`}>
        {label}
      </label>
      {/* Select dropdown */}
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">{t('choose_option', { option: label.toLowerCase() })}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Error message */}
      {error && <span className="text-xs text-red-600">{errorMessage || t('field_required')}</span>}
    </div>
  );
}
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

type EnumSelectProps = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: boolean;
  errorMessage?: string;
};

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
      <label htmlFor={name} className={`text-sm font-medium text-left ${error ? 'text-red-600' : ''}`}>
        {label}
      </label>
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
      {error && <span className="text-xs text-red-600">{errorMessage || t('field_required')}</span>}
    </div>
  );
}
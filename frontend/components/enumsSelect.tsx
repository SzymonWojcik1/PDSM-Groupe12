'use client';

import React from 'react';

type EnumSelectProps = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function EnumSelect({ name, label, options, value, onChange }: EnumSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-left">{label}</label>
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="border p-2 rounded"
      >
        <option value="">-- Choisir {label.toLowerCase()} --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

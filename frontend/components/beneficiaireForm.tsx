'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionCountrySelector from '@/components/regionCountrySelector';
import EnumSelect from '@/components/enumsSelect';
import { validateAgeByType } from '@/lib/validateAgeByType';
import { useApi } from '@/lib/hooks/useApi';

// Type for the form data representing a beneficiary
export type BeneficiaireFormData = {
  ben_prenom: string;
  ben_nom: string;
  ben_date_naissance: string;
  ben_region: string;
  ben_pays: string;
  ben_type: string;
  ben_type_autre: string;
  ben_zone: string;
  ben_sexe: string;
  ben_sexe_autre: string;
  ben_genre: string;
  ben_genre_autre: string;
  ben_ethnicite: string;
};

// Type for enums used in dropdowns
type EnumMap = Record<string, { value: string; label: string }[]>;

// Props for the BeneficiaireForm component
type Props = {
  initialData?: BeneficiaireFormData;
  onSubmit: (data: BeneficiaireFormData) => Promise<void>;
  submitLabel?: string;
};

/**
 * BeneficiaireForm component
 * - Handles creation and editing of a beneficiary.
 * - Manages form state, validation, and submission.
 * - Uses enums and region/country selectors for dropdowns.
 */
export default function BeneficiaireForm({ initialData, onSubmit, submitLabel }: Props) {
  const { t } = useTranslation();
  const { callApi } = useApi();

  // State for the form fields
  const [form, setForm] = useState<BeneficiaireFormData>(
    initialData || {
      ben_prenom: '', ben_nom: '', ben_date_naissance: '', ben_region: '', ben_pays: '',
      ben_type: '', ben_type_autre: '', ben_zone: '', ben_sexe: '', ben_sexe_autre: '',
      ben_genre: '', ben_genre_autre: '', ben_ethnicite: ''
    }
  );
  // State for enums (type, zone, sexe, genre)
  const [enums, setEnums] = useState<EnumMap>({});
  // State to control error display
  const [showErrors, setShowErrors] = useState(false);
  // State to show help for ethnicity field
  const [ethniciteFocused, setEthniciteFocused] = useState(false);

  // Fetch enums from API on mount
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/enums`);
        if (!res.ok) throw new Error(`Erreur serveur enums : ${res.status}`);
        const data = await res.json();
        setEnums(data);
      } catch (err) {
        console.error('Erreur enums:', err);
      }
    };

    fetchEnums();
  }, [callApi]);

  // Handle input changes for all fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const lowercaseFields = ['ben_nom', 'ben_prenom', 'ben_ethnicite'];
    const newValue = lowercaseFields.includes(name) ? value.toLowerCase() : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  // Validate the form fields
  const isFormValid = () => {
    const requiredFields = [
      'ben_prenom', 'ben_nom', 'ben_date_naissance', 'ben_region', 'ben_pays',
      'ben_type', 'ben_zone', 'ben_sexe', 'ben_ethnicite'
    ];

    for (const field of requiredFields) {
      if (!form[field as keyof BeneficiaireFormData]?.trim()) return false;
    }

    if (form.ben_type === 'other' && !form.ben_type_autre.trim()) return false;
    if (form.ben_sexe === 'other' && !form.ben_sexe_autre.trim()) return false;

    const nameFields = ['ben_prenom', 'ben_nom', 'ben_type_autre', 'ben_sexe_autre', 'ben_genre_autre'];
    const nameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;
    for (const field of nameFields) {
      const value = form[field as keyof BeneficiaireFormData];
      if (value && (!nameRegex.test(value) || value.length > 50)) return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!isFormValid()) return;

    const ageError = validateAgeByType(form.ben_type, form.ben_date_naissance);
    if (ageError) return alert(ageError);

    await onSubmit(form);
  };

  /**
   * Render a single input field with validation and error display.
   */
  const renderField = (
    label: string,
    name: keyof BeneficiaireFormData,
    type = 'text',
    placeholder?: string,
    requiredCondition?: boolean
  ) => {
    const isRequired = requiredCondition ?? label.includes('*');
    const value = form[name] || '';
    const isEmpty = isRequired && showErrors && !value.trim();
    const isNameField = ['ben_prenom', 'ben_nom', 'ben_type_autre', 'ben_sexe_autre', 'ben_genre_autre'].includes(name);
    const nameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;
    const isInvalidName = isNameField && (!!value && (!nameRegex.test(value) || value.length > 50));

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={name} className="text-sm font-medium text-left">{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder || label}
          maxLength={50}
          className={`border p-2 rounded ${isEmpty || isInvalidName ? 'border-red-500' : ''}`}
          onChange={handleChange}
          onFocus={name === 'ben_ethnicite' ? () => setEthniciteFocused(true) : undefined}
          onBlur={name === 'ben_ethnicite' ? () => setEthniciteFocused(false) : undefined}
        />
        {isEmpty && <p className="text-xs text-red-600">{t('field_required')}</p>}
        {isInvalidName && (
          <p className="text-xs text-red-600">
            {value.length > 50 ? t('max_chars') : t('invalid_chars')}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* First name field */}
      {renderField(t('firstname'), 'ben_prenom')}
      {/* Last name field */}
      {renderField(t('lastname'), 'ben_nom')}

      {/* Date of birth field using DatePicker */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-left">{t('birthdate')}</label>
        <DatePicker
          selected={form.ben_date_naissance ? new Date(form.ben_date_naissance) : null}
          onChange={(date: Date | null) =>
            setForm((prev) => ({
              ...prev,
              ben_date_naissance: date
                ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
                : ''
            }))
          }
          dateFormat="yyyy-MM-dd"
          className={`border p-2 rounded w-full ${showErrors && !form.ben_date_naissance ? 'border-red-500' : ''}`}
          placeholderText={t('choose_date')}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          isClearable
          maxDate={new Date()}
          minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
        />
      </div>

      {/* Region and country selector */}
      <RegionCountrySelector
        onRegionChange={(r) => setForm((prev) => ({ ...prev, ben_region: r }))}
        onCountryChange={(c) => setForm((prev) => ({ ...prev, ben_pays: c }))}
        regionError={showErrors && !form.ben_region}
        countryError={showErrors && !form.ben_pays}
        initialRegion={form.ben_region}
        initialCountry={form.ben_pays}
      />

      {/* Type dropdown and "other" field */}
      <EnumSelect name="ben_type" label={t('type')} options={enums.type || []} value={form.ben_type} onChange={handleChange} error={!form.ben_type && showErrors} errorMessage={t('select_type')} />
      {form.ben_type === 'other' && renderField(t('other_type'), 'ben_type_autre', 'text', undefined, true)}

      {/* Zone dropdown */}
      <EnumSelect name="ben_zone" label={t('zone')} options={enums.zone || []} value={form.ben_zone} onChange={handleChange} error={!form.ben_zone && showErrors} errorMessage={t('select_zone')} />
      {/* Sex dropdown and "other" field */}
      <EnumSelect name="ben_sexe" label={t('sex')} options={enums.sexe || []} value={form.ben_sexe} onChange={handleChange} error={!form.ben_sexe && showErrors} errorMessage={t('select_sex')} />
      {form.ben_sexe === 'other' && renderField(t('other_sex'), 'ben_sexe_autre', 'text', undefined, true)}

      {/* Gender dropdown and "other" field */}
      <EnumSelect name="ben_genre" label={t('gender')} options={enums.genre || []} value={form.ben_genre} onChange={handleChange} />
      {form.ben_genre === 'other' && renderField(t('other_gender'), 'ben_genre_autre')}

      {/* Ethnicity field with help text on focus */}
      <div className="flex flex-col gap-1 relative">
        {renderField(t('ethnicity'), 'ben_ethnicite')}
        {ethniciteFocused && <p className="text-xs text-gray-600 mt-1">{t('ethnicity_help')}</p>}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className={`w-full font-semibold py-2 rounded
          ${!isFormValid() ? 'bg-gray-400 text-white' : 'bg-[#9F0F3A] text-white hover:bg-[#800d30]'}
        `}
        title={!isFormValid() ? t('fill_required_fields') : ''}
      >
        {submitLabel || t('save')}
      </button>
    </form>
  );
}

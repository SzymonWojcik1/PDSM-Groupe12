'use client';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionCountrySelector from '@/components/regionCountrySelector';
import EnumSelect from '@/components/enumsSelect';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { validateAgeByType } from '@/lib/validateAgeByType';

export default function UpdateBeneficiaire() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [enums, setEnums] = useState<Record<string, { value: string; label: string }[]>>({});
  const [ethniciteFocused, setEthniciteFocused] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  const [form, setForm] = useState({
    ben_prenom: '',
    ben_nom: '',
    ben_date_naissance: '',
    ben_region: '',
    ben_pays: '',
    ben_type: '',
    ben_type_autre: '',
    ben_zone: '',
    ben_sexe: '',
    ben_sexe_autre: '',
    ben_genre: '',
    ben_genre_autre: '',
    ben_ethnicite: '',
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/enums')
      .then((res) => res.json())
      .then(setEnums)
      .catch((err) => console.error('Erreur enums:', err));
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:8000/api/beneficiaires/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          ben_prenom: data.ben_prenom || '',
          ben_nom: data.ben_nom || '',
          ben_date_naissance: data.ben_date_naissance || '',
          ben_region: data.ben_region || '',
          ben_pays: data.ben_pays || '',
          ben_type: data.ben_type || '',
          ben_type_autre: data.ben_type_autre || '',
          ben_zone: data.ben_zone || '',
          ben_sexe: data.ben_sexe || '',
          ben_sexe_autre: data.ben_sexe_autre || '',
          ben_genre: data.ben_genre || '',
          ben_genre_autre: data.ben_genre_autre || '',
          ben_ethnicite: data.ben_ethnicite || '',
        });
      })
      .catch((err) => {
        console.error('Erreur fetch bénéficiaire:', err);
        alert("Erreur lors du chargement du bénéficiaire");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return (
      form.ben_prenom.trim() &&
      form.ben_nom.trim() &&
      form.ben_date_naissance &&
      form.ben_region &&
      form.ben_pays &&
      form.ben_type &&
      (form.ben_type !== 'other' || form.ben_type_autre.trim()) &&
      form.ben_zone &&
      form.ben_sexe &&
      (form.ben_sexe !== 'other' || form.ben_sexe_autre.trim()) &&
      form.ben_ethnicite.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setShowErrors(true);
      return;
    }

    const ageError = validateAgeByType(form.ben_type, form.ben_date_naissance);
    if (ageError) {
      alert(ageError);
      return;
    }

    const response = await fetch(`http://localhost:8000/api/beneficiaires/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      router.push('/beneficiaires');
    } else {
      const errorData = await response.json();
      console.error('Erreur lors de la soumission', errorData);
      alert('Erreur lors de la soumission du bénéficiaire.');
    }
  };

  const renderField = (
    label: string,
    name: keyof typeof form,
    type = 'text',
    placeholder?: string,
    requiredCondition?: boolean
  ) => {
    const isLabelRequired = label.includes('*');
    const isExplicitlyRequired = requiredCondition ?? isLabelRequired;
    const isEmpty = isExplicitlyRequired && showErrors && !form[name]?.trim();

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={name} className="text-sm font-medium text-left">{label}</label>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder || label}
          value={form[name] || ''}
          className={`border p-2 rounded ${isEmpty ? 'border-red-500' : ''}`}
          onChange={handleChange}
          onFocus={name === 'ben_ethnicite' ? () => setEthniciteFocused(true) : undefined}
          onBlur={name === 'ben_ethnicite' ? () => setEthniciteFocused(false) : undefined}
        />
        {isEmpty && <p className="text-xs text-red-600">Ce champ est requis.</p>}
      </div>
    );
  };

  if (isLoading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="w-full font-semibold py-2 rounded bg-blue-600 text-white hover:bg-blue-800"
      >
        Retour
      </button>

      <h1 className="text-3xl font-bold mb-8 text-center">Modifier le bénéficiaire</h1>

      {showErrors && !isFormValid() && (
        <p className="text-red-600 text-sm text-center mb-4">
          Veuillez remplir tous les champs marqués d’un <strong>*</strong>.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {renderField('Prénom*', 'ben_prenom')}
        {renderField('Nom*', 'ben_nom')}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-left">Date de naissance*</label>
          <DatePicker
            selected={form.ben_date_naissance ? new Date(form.ben_date_naissance) : null}
            onChange={(date: Date | null) =>
              setForm((prev) => ({
                ...prev,
                ben_date_naissance: date?.toISOString().split('T')[0] || '',
              }))
            }
            dateFormat="yyyy-MM-dd"
            className={`border p-2 rounded w-full ${showErrors && !form.ben_date_naissance ? 'border-red-500' : ''}`}
            placeholderText="Choisir une date"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            isClearable
          />
        </div>

        <RegionCountrySelector
          onRegionChange={(r) => setForm((prev) => ({ ...prev, ben_region: r }))}
          onCountryChange={(c) => setForm((prev) => ({ ...prev, ben_pays: c }))}
          regionError={showErrors && !form.ben_region}
          countryError={showErrors && !form.ben_pays}
          initialRegion={form.ben_region}
          initialCountry={form.ben_pays}
        />

        <EnumSelect
          name="ben_type"
          label="Type*"
          options={enums.type || []}
          value={form.ben_type}
          onChange={handleChange}
          error={!form.ben_type && showErrors}
          errorMessage="Veuillez sélectionner un type"
        />
        {form.ben_type === 'other' && renderField('Type autre', 'ben_type_autre', 'text', undefined, true)}

        <EnumSelect
          name="ben_zone"
          label="Zone*"
          options={enums.zone || []}
          value={form.ben_zone}
          onChange={handleChange}
          error={!form.ben_zone && showErrors}
          errorMessage="Veuillez sélectionner une zone"
        />

        <EnumSelect
          name="ben_sexe"
          label="Sexe*"
          options={enums.sexe || []}
          value={form.ben_sexe}
          onChange={handleChange}
          error={!form.ben_sexe && showErrors}
          errorMessage="Veuillez sélectionner un sexe"
        />
        {form.ben_sexe === 'other' && renderField('Sexe autre', 'ben_sexe_autre', 'text', undefined, true)}

        <EnumSelect
          name="ben_genre"
          label="Genre"
          options={enums.genre || []}
          value={form.ben_genre}
          onChange={handleChange}
        />
        {form.ben_genre === 'other' && renderField('Genre autre', 'ben_genre_autre')}

        <div className="flex flex-col gap-1 relative">
          {renderField('Ethnicité*', 'ben_ethnicite')}
          {ethniciteFocused && (
            <p className="text-xs text-gray-600 mt-1">
              Ce champ est utilisé à des fins statistiques pour mieux comprendre la diversité des bénéficiaires.
            </p>
          )}
        </div>

        <button
          type="submit"
          className={`w-full font-semibold py-2 rounded
            ${!isFormValid() ? 'bg-gray-400 text-white' : 'bg-green-600 text-white hover:bg-green-800'}
          `}
          title={!isFormValid() ? 'Veuillez remplir tous les champs obligatoires.' : ''}
        >
          Mettre à jour
        </button>
      </form>
    </main>
  );
}
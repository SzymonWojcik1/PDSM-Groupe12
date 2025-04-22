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
    prenom: '',
    nom: '',
    date_naissance: '',
    region: '',
    pays: '',
    type: '',
    type_autre: '',
    zone: '',
    sexe: '',
    sexe_autre: '',
    genre: '',
    genre_autre: '',
    ethnicite: '',
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
      .then(setForm)
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
      form.prenom.trim() &&
      form.nom.trim() &&
      form.date_naissance &&
      form.region &&
      form.pays &&
      form.type &&
      (form.type !== 'other' || form.type_autre.trim()) &&
      form.zone &&
      form.sexe &&
      (form.sexe !== 'other' || form.sexe_autre.trim()) &&
      form.ethnicite.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setShowErrors(true);
      return;
    }

    const ageError = validateAgeByType(form.type, form.date_naissance);
    if (ageError) {
      alert(ageError);
      return;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id
      ? `http://localhost:8000/api/beneficiaires/${id}`
      : 'http://localhost:8000/api/beneficiaires';

    const response = await fetch(url, {
      method,
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
          onFocus={name === 'ethnicite' ? () => setEthniciteFocused(true) : undefined}
          onBlur={name === 'ethnicite' ? () => setEthniciteFocused(false) : undefined}
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

      <h1 className="text-3xl font-bold mb-8 text-center">
        {id ? 'Modifier le bénéficiaire' : 'Ajouter un bénéficiaire'}
      </h1>

      {showErrors && !isFormValid() && (
        <p className="text-red-600 text-sm text-center mb-4">
          Veuillez remplir tous les champs marqués d’un <strong>*</strong>.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {renderField('Prénom*', 'prenom')}
        {renderField('Nom*', 'nom')}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-left">Date de naissance*</label>
          <DatePicker
            selected={form.date_naissance ? new Date(form.date_naissance) : null}
            onChange={(date: Date | null) =>
              setForm((prev) => ({
                ...prev,
                date_naissance: date?.toISOString().split('T')[0] || '',
              }))
            }
            dateFormat="yyyy-MM-dd"
            className={`border p-2 rounded w-full ${showErrors && !form.date_naissance ? 'border-red-500' : ''}`}
            placeholderText="Choisir une date"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            isClearable
            autoComplete="off"
            minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
            maxDate={new Date()}
          />
          {showErrors && !form.date_naissance && (
            <p className="text-xs text-red-600">Ce champ est requis.</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-left mb-1">Sélectionnez la région et le pays*</p>
          <RegionCountrySelector
            onRegionChange={(region) => setForm((prev) => ({ ...prev, region }))}
            onCountryChange={(pays) => setForm((prev) => ({ ...prev, pays }))}
            regionError={showErrors && !form.region}
            countryError={showErrors && !form.pays}
            initialRegion={form.region}
            initialCountry={form.pays}
          />

        </div>

        <EnumSelect
          name="type"
          label="Type*"
          options={enums.type || []}
          value={form.type}
          onChange={handleChange}
          error={!form.type && showErrors}
          errorMessage="Veuillez sélectionner un type"
        />
        {form.type === 'other' && renderField('Type autre', 'type_autre', 'text', undefined, true)}

        <EnumSelect
          name="zone"
          label="Zone*"
          options={enums.zone || []}
          value={form.zone}
          onChange={handleChange}
          error={!form.zone && showErrors}
          errorMessage="Veuillez sélectionner une zone"
        />

        <EnumSelect
          name="sexe"
          label="Sexe*"
          options={enums.sexe || []}
          value={form.sexe}
          onChange={handleChange}
          error={!form.sexe && showErrors}
          errorMessage="Veuillez sélectionner un sexe"
        />
        {form.sexe === 'other' && renderField('Sexe autre', 'sexe_autre', 'text', undefined, true)}

        <EnumSelect
          name="genre"
          label="Genre"
          options={enums.genre || []}
          value={form.genre}
          onChange={handleChange}
        />
        {form.genre === 'other' && renderField('Genre autre', 'genre')}

        <div className="flex flex-col gap-1 relative">
          {renderField('Ethnicité*', 'ethnicite')}
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
          {id ? 'Mettre à jour' : 'Créer le bénéficiaire'}
        </button>
      </form>
    </main>
  );
}

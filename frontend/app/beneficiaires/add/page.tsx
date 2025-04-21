'use client';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionCountrySelector from '@/components/regionCountrySelector';
import EnumSelect from '@/components/enumsSelect';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AddBeneficiairePage() {
  const router = useRouter();
  const [enums, setEnums] = useState<Record<string, { value: string; label: string }[]>>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8000/api/beneficiaires', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      router.push('/beneficiaires');
    } else {
      const errorData = await response.json();
      console.error('Erreur lors de la création', errorData);
      alert('Erreur lors de la création du bénéficiaire.');
    }
  };

  const renderField = (
    label: string,
    name: keyof typeof form,
    type = 'text',
    placeholder?: string
  ) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-left">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder || label}
        className="border p-2 rounded"
        onChange={handleChange}
      />
    </div>
  );

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Ajouter un bénéficiaire</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/*Nom et Prenom*/}
        {renderField('Prénom', 'prenom')}
        {renderField('Nom', 'nom')}


        {/*Date*/}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-left">Date de naissance</label>
          <DatePicker
            selected={form.date_naissance ? new Date(form.date_naissance) : null}
            onChange={(date: Date | null) =>
              setForm((prev) => ({
                ...prev,
                date_naissance: date?.toISOString().split('T')[0] || '',
              }))
            }
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded w-full"
            placeholderText="Choisir une date"
          />
        </div>


        {/*Region et Pays*/}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-left mb-1">Sélectionnez la région et le pays :</p>
          <RegionCountrySelector
            onRegionChange={(region) => setForm((prev) => ({ ...prev, region }))}
            onCountryChange={(pays) => setForm((prev) => ({ ...prev, pays }))}
          />
        </div>


        {/*Type et Autre Type*/}
        <EnumSelect
          name="type"
          label="Type"
          options={enums.type || []}
          value={form.type}
          onChange={handleChange}
        />
        {form.type === 'other' && renderField('Type autre', 'type_autre')}


        {/*Zone*/}
        <EnumSelect
          name="zone"
          label="Zone"
          options={enums.zone || []}
          value={form.zone}
          onChange={handleChange}
        />


        {/*Sexe et Autre Sexe*/}
        <EnumSelect
          name="sexe"
          label="Sexe"
          options={enums.sexe || []}
          value={form.sexe}
          onChange={handleChange}
        />
        {form.sexe === 'other' && renderField('Sexe autre', 'sexe_autre')}


        {/*Genre et Autre Genre*/}
        <EnumSelect
          name="genre"
          label="Genre"
          options={enums.genre || []}
          value={form.genre}
          onChange={handleChange}
        />
        {form.genre === 'other' && renderField('Genre autre', 'genre')}

        {/*Etnicité*/}
        {renderField('Ethnicité', 'ethnicite')}

        <button
          type="submit"
          className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-800"
        >
          Créer le bénéficiaire
        </button>
      </form>
    </main>
  );
}

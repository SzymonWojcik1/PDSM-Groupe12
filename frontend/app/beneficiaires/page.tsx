'use client';

import { countriesByRegion } from '@/lib/countriesByRegion';
import { enumsShow } from '@/lib/enumsShow';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Beneficiaire = {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string;
  region: string;
  pays: string;
  type: string;
  type_autre: string | null;
  zone: string;
  sexe: string;
  sexe_autre: string | null;
  genre: string | null;
  genre_autre: string | null;
  ethnicite: string;
};

type EnumMap = Record<string, { value: string; label: string }[]>;

export default function BeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [enums, setEnums] = useState<EnumMap>({});
  const [selectedRegion, setSelectedRegion] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    pays: '',
    zone: '',
    type: '',
    sexe: '',
    genre: '',
    search: '',
  });

  const router = useRouter();

  const fetchBeneficiaires = () => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    fetch(`http://localhost:8000/api/beneficiaires?${query.toString()}`)
      .then(res => res.json())
      .then(setBeneficiaires)
      .catch((err) => console.error('Erreur fetch bénéficiaires:', err));
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/enums?locale=en')
      .then(res => res.json())
      .then(setEnums)
      .catch(err => console.error('Erreur fetch enums:', err));
  }, []);

  useEffect(() => {
    fetchBeneficiaires();
  }, [filters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      region: '',
      pays: '',
      zone: '',
      type: '',
      sexe: '',
      genre: '',
      search: '',
    });
  };

  return (
    <main className="p-6">
      <div className="flex gap-4 mb-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          onClick={() => router.push('/beneficiaires/add')}
        >
          Ajouter un bénéficiaire
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
          onClick={() => router.push('/beneficiaires/delete')}
        >
          Supprimer bénéficiaire(s)
        </button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <input
        type="text"
        name="search"
        placeholder="Rechercher par nom ou prénom"
        value={filters.search}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* REGION */}
      <select
          name="region"
          value={filters.region}
          onChange={(e) => {
            const region = e.target.value;
            setSelectedRegion(region);
            setFilters((prev) => ({ ...prev, region, pays: '' }));
          }}
          className="border p-2 rounded"
        >
          <option value="">-- Région --</option>
          {Object.keys(countriesByRegion).map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        {/* PAYS */}
        <select
          name="pays"
          value={filters.pays}
          onChange={handleChange}
          className="border p-2 rounded"
          disabled={!filters.region}
        >
          <option value="">-- Pays --</option>
          {filters.region &&
            countriesByRegion[filters.region as keyof typeof countriesByRegion].map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
        </select>

        {/* AUTRES FILTRES */}
        {['zone', 'type', 'sexe', 'genre'].map((field) => (
          <select
            key={field}
            name={field}
            value={filters[field as keyof typeof filters]}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">-- {field.charAt(0).toUpperCase() + field.slice(1)} --</option>
            {enums[field]?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        <button
          className="col-span-full md:col-span-1 bg-gray-300 hover:bg-gray-400 px-3 py-2 rounded"
          onClick={resetFilters}
        >
          Réinitialiser les filtres
        </button>
      </div>


      <h1 className="text-2xl font-semibold mb-4">Liste des bénéficiaires</h1>

      {beneficiaires.length === 0 ? (
        <p>Aucun bénéficiaire trouvé.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Prénom</th>
                <th className="border px-2 py-1">Nom</th>
                <th className="border px-2 py-1">Naissance</th>
                <th className="border px-2 py-1">Région</th>
                <th className="border px-2 py-1">Pays</th>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Zone</th>
                <th className="border px-2 py-1">Sexe</th>
                <th className="border px-2 py-1">Genre</th>
                <th className="border px-2 py-1">Ethnicité</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {beneficiaires.map((b) => (
                <tr key={b.id}>
                  <td className="border px-2 py-1">{b.prenom}</td>
                  <td className="border px-2 py-1">{b.nom}</td>
                  <td className="border px-2 py-1">{b.date_naissance}</td>
                  <td className="border px-2 py-1">{b.region}</td>
                  <td className="border px-2 py-1">{b.pays}</td>
                  <td className="border px-2 py-1">
                    {b.type === 'other' ? b.type_autre || '-' : enumsShow(enums, 'type', b.type)}
                  </td>
                  <td className="border px-2 py-1">{enumsShow(enums, 'zone', b.zone)}</td>
                  <td className="border px-2 py-1">
                    {b.sexe === 'other' ? b.sexe_autre || '-' : enumsShow(enums, 'sexe', b.sexe)}
                  </td>
                  <td className="border px-2 py-1">
                    {b.genre === 'other' ? b.genre_autre || '-' : enumsShow(enums, 'genre', b.genre || '')}
                  </td>
                  <td className="border px-2 py-1">{b.ethnicite}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => router.push(`/beneficiaires/${b.id}/update`)}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

'use client';

import { countriesByRegion } from '@/lib/countriesByRegion';
import { enumsShow } from '@/lib/enumsShow';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Beneficiaire = {
  ben_id: string;
  ben_prenom: string;
  ben_nom: string;
  ben_date_naissance: string;
  ben_region: string;
  ben_pays: string;
  ben_type: string;
  ben_type_autre: string | null;
  ben_zone: string;
  ben_sexe: string;
  ben_sexe_autre: string | null;
  ben_genre: string | null;
  ben_genre_autre: string | null;
  ben_ethnicite: string;
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
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => router.push('/beneficiaires/dashboard')}
        >
          Accéder au dashboard
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
                <tr key={b.ben_id}>
                  <td className="border px-2 py-1">{b.ben_prenom}</td>
                  <td className="border px-2 py-1">{b.ben_nom}</td>
                  <td className="border px-2 py-1">{b.ben_date_naissance}</td>
                  <td className="border px-2 py-1">{b.ben_region}</td>
                  <td className="border px-2 py-1">{b.ben_pays}</td>
                  <td className="border px-2 py-1">
                    {b.ben_type === 'other' ? b.ben_type_autre || '-' : enumsShow(enums, 'type', b.ben_type)}
                  </td>
                  <td className="border px-2 py-1">{enumsShow(enums, 'zone', b.ben_zone)}</td>
                  <td className="border px-2 py-1">
                    {b.ben_sexe === 'other' ? b.ben_sexe_autre || '-' : enumsShow(enums, 'sexe', b.ben_sexe)}
                  </td>
                  <td className="border px-2 py-1">
                    {b.ben_genre === 'other' ? b.ben_genre_autre || '-' : enumsShow(enums, 'genre', b.ben_genre || '')}
                  </td>
                  <td className="border px-2 py-1">{b.ben_ethnicite}</td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => router.push(`/beneficiaires/${b.ben_id}/update`)}
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
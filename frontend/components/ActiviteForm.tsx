'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Partenaire = { part_id: number; part_nom: string };
type Projet = { pro_id: number; pro_nom: string };

interface ActiviteFormProps {
  initialData?: {
    act_nom: string;
    act_dateDebut: string;
    act_dateFin: string;
    act_part_id: string;
    act_pro_id: string;
  };
  onSubmit: (data: {
    act_nom: string;
    act_dateDebut: string;
    act_dateFin: string;
    act_part_id: string;
    act_pro_id: string;
  }) => Promise<void>;
  submitLabel: string;
  callApi: (url: string, options?: RequestInit) => Promise<Response>;
}

export default function ActiviteForm({
  initialData,
  onSubmit,
  submitLabel,
  callApi,
}: ActiviteFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    act_nom: '',
    act_dateDebut: '',
    act_dateFin: '',
    act_part_id: '',
    act_pro_id: '',
  });

  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partRes = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`);
        if (!partRes.ok) {
          const text = await partRes.text();
          console.error('Erreur partenaires:', text);
          throw new Error(text);
        }
        const partData = await partRes.json();
        setPartenaires(partData);
      } catch (err) {
        console.error('Erreur chargement partenaires', err);
      }

      try {
        const projRes = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/projets`);
        if (!projRes.ok) {
          const text = await projRes.text();
          console.error('Erreur projets:', text);
          throw new Error(text);
        }
        const projData = await projRes.json();
        setProjets(projData);
      } catch (err) {
        console.error('Erreur chargement projets', err);
      }
    };

    fetchData();
  }, [callApi]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const debut = new Date(formData.act_dateDebut);
    const fin = new Date(formData.act_dateFin);

    if (debut > fin) {
      setErrorMessage(t('date_start_after_end'));
      return;
    }

    if (debut < now || fin < now) {
      setErrorMessage(t('date_in_past'));
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{errorMessage}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('activity_name')}</label>
        <input
          type="text"
          name="act_nom"
          value={formData.act_nom}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('start_date')}</label>
          <input
            type="date"
            name="act_dateDebut"
            value={formData.act_dateDebut}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('end_date')}</label>
          <input
            type="date"
            name="act_dateFin"
            value={formData.act_dateFin}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('partner')}</label>
        <select
          name="act_part_id"
          value={formData.act_part_id}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="">{t('select_partner')}</option>
          {partenaires.map((p) => (
            <option key={p.part_id} value={p.part_id}>
              {p.part_nom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('project')}</label>
        <select
          name="act_pro_id"
          value={formData.act_pro_id}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="">{t('select_project')}</option>
          {projets.map((p) => (
            <option key={p.pro_id} value={p.pro_id}>
              {p.pro_nom}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="bg-[#9F0F3A] text-white px-6 py-2 rounded hover:bg-[#800d30] transition"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

type Indicateur = {
  ind_id: number;
  ind_nom: string;
  ind_code: string;
  ind_valeurCible: number;
  valeurReelle?: number;
};

type Output = {
  opu_id: number;
  opu_nom: string;
  opu_code: string;
  indicateurs: Indicateur[];
};

type Outcome = {
  out_id: number;
  out_nom: string;
  out_code: string;
  outputs: Output[];
};

type Objectif = {
  obj_id: number;
  obj_nom: string;
  outcomes: Outcome[];
};

export default function UpdateCadreLogiquePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();

  const [cadNom, setCadNom] = useState('');
  const [annee, setAnnee] = useState<number | ''>('');
  const [cadDateDebut, setCadDateDebut] = useState('');
  const [cadDateFin, setCadDateFin] = useState('');
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);

  useEffect(() => {
    if (typeof annee === 'number' && !isNaN(annee)) {
      setCadDateDebut(`${annee}-01-01`);
      setCadDateFin(`${annee + 3}-12-31`);
    }
  }, [annee]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${id}`);
        const data = await res.json();
        setCadNom(data.cad_nom || '');
        setCadDateDebut(data.cad_dateDebut || '');
        setCadDateFin(data.cad_dateFin || '');
        const year = new Date(data.cad_dateDebut).getFullYear();
        setAnnee(year);
      } catch (err) {
        console.error(t('loading_error'), err);
      }

      fetchObjectifs();
    };

    load();
  }, [id, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadNom || !cadDateDebut || !cadDateFin) return alert(t('all_fields_required'));
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cad_nom: cadNom,
          cad_dateDebut: cadDateDebut,
          cad_dateFin: cadDateFin,
        }),
      });
      alert(t('update_success'));
    } catch (err) {
      console.error(t('update_failed'), err);
      alert(t('update_failed'));
    }
  };

  const fetchObjectifs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${id}/structure`);
      const data: Objectif[] = await res.json();
      setObjectifs(data);
    } catch (err) {
      console.error('Erreur chargement hiérarchie :', err);
    }
  };

  const modifierNom = async (url: string, payload: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) fetchObjectifs();
  };

  const supprimerElement = async (url: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
      method: 'DELETE'
    });
    if (res.ok) fetchObjectifs();
  };

  const modifierTexte = async (type: string, id: number, nomActuel: string, url: string, field = 'nom') => {
    const nom = prompt(t('new_name_for', { type }), nomActuel);
    if (nom) await modifierNom(url, { [`${type}_${field}`]: nom });
  };

  const modifierIndicateur = async (ind: Indicateur) => {
    const nom = prompt(t('new_indicator_name'), ind.ind_nom);
    if (!nom) return;

    const val = prompt(t('new_target_value'), ind.ind_valeurCible.toString());
    if (!val || isNaN(parseInt(val))) return;

    await modifierNom(`indicateurs/${ind.ind_id}`, {
        ind_nom: nom,
        ind_valeurCible: parseInt(val),
        ind_code: ind.ind_code,
    });
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('update_logframe')}</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          <Link
            href="/cadre-logique"
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
          >
            {t('back_to_list')}
          </Link>
        </header>

        <div className="bg-white p-6 rounded-xl shadow mb-10 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-1">{t('logframe_name')}</label>
              <input
                type="text"
                value={cadNom}
                onChange={(e) => setCadNom(e.target.value)}
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('start_year')}</label>
              <input
                type="number"
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                placeholder="Ex: 2025"
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('auto_start_date')}</label>
              <input
                type="date"
                value={cadDateDebut}
                readOnly
                className="w-full border border-gray-300 rounded p-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('auto_end_date')}</label>
              <input
                type="date"
                value={cadDateFin}
                readOnly
                className="w-full border border-gray-300 rounded p-2 bg-gray-100"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30] transition"
            >
              {t('save_changes')}
            </button>
          </form>
        </div>

        {objectifs.map((obj, i) => (
          <div key={obj.obj_id} className="bg-white p-6 rounded-xl shadow mb-10 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{obj.obj_nom}</h2>
              <div className="flex gap-2">
                <button onClick={() => modifierTexte('obj', obj.obj_id, obj.obj_nom, `objectifs-generaux/${obj.obj_id}`)} title={t('edit')}>
                  <Pencil className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => supprimerElement(`objectifs-generaux/${obj.obj_id}`)} title={t('delete')}>
                  <Trash className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 w-1/4 text-left">{t('outcomes')}</th>
                  <th className="border px-4 py-2 w-1/4 text-left">{t('outputs')}</th>
                  <th className="border px-4 py-2 w-1/4 text-left">{t('indicators')}</th>
                  <th className="border px-4 py-2 w-1/6 text-left">{t('target_value')}</th>
                  <th className="border px-4 py-2 w-1/6 text-left">{t('actual_value')}</th>
                </tr>
              </thead>
              <tbody>
                {obj.outcomes.map((out, j) =>
                  out.outputs.map((op, k) =>
                    op.indicateurs.map((ind, l) => (
                      <tr key={ind.ind_id}>
                        {k === 0 && l === 0 && (
                          <td rowSpan={out.outputs.reduce((acc, o) => acc + (o.indicateurs.length || 1), 0)} className="border px-4 py-2 align-top">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold">{`${t('outcomes')} ${j + 1}`}</div>
                                <div>{out.out_nom}</div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => modifierTexte('out', out.out_id, out.out_nom, `outcomes/${out.out_id}`)} title={t('edit')}>
                                  <Pencil className="w-4 h-4 text-gray-600" />
                                </button>
                                <button onClick={() => supprimerElement(`outcomes/${out.out_id}`)} title={t('delete')}>
                                  <Trash className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </td>
                        )}
                        {l === 0 && (
                          <td rowSpan={op.indicateurs.length || 1} className="border px-4 py-2 align-top">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold">{`${t('outputs')} ${j + 1}.${k + 1}`}</div>
                                <div>{op.opu_nom}</div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => modifierTexte('opu', op.opu_id, op.opu_nom, `outputs/${op.opu_id}`)} title={t('edit')}>
                                  <Pencil className="w-4 h-4 text-gray-600" />
                                </button>
                                <button onClick={() => supprimerElement(`outputs/${op.opu_id}`)} title={t('delete')}>
                                  <Trash className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="border px-4 py-2">
                        <div className="flex justify-between items-start">
                            <div>
                            <span className="font-bold">{`${t('indicators')} ${j + 1}.${k + 1}.${l + 1}`}</span><br />
                            {ind.ind_nom}
                            </div>
                            <div className="flex gap-2">
                            <button onClick={() => modifierIndicateur(ind)} title={t('edit')}>
                                <Pencil className="w-4 h-4 text-gray-600" />
                            </button>
                            <button onClick={() => supprimerElement(`indicateurs/${ind.ind_id}`)} title={t('delete')}>
                                <Trash className="w-4 h-4 text-red-500" />
                            </button>
                            </div>
                        </div>
                        </td>
                        <td className="border px-4 py-2">{ind.ind_valeurCible}</td>
                        <td className="border px-4 py-2 text-center">{ind.valeurReelle ?? '–'}</td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </main>
  );
}

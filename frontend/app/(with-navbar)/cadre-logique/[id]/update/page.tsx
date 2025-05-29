'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash } from 'lucide-react';
import ModalInput from '@/components/ModalInput';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';
import useAdminGuard from '@/lib/hooks/useAdminGuard';
import { useTranslation } from 'react-i18next';

/**
 * Type definitions for the logical framework structure
 */

/**
 * Indicator type definition
 * Represents a performance indicator with its target and actual values
 */
type Indicateur = {
  ind_id: number;
  ind_nom: string;
  ind_code: string;
  ind_valeurCible: number;
  valeurReelle?: number;
};

/**
 * Output type definition
 * Represents a project output with its associated indicators
 */
type Output = {
  opu_id: number;
  opu_nom: string;
  opu_code: string;
  indicateurs: Indicateur[];
};

/**
 * Outcome type definition
 * Represents a project outcome with its associated outputs
 */
type Outcome = {
  out_id: number;
  out_nom: string;
  out_code: string;
  outputs: Output[];
};

/**
 * Objective type definition
 * Represents a project objective with its associated outcomes
 */
type Objectif = {
  obj_id: number;
  obj_nom: string;
  outcomes: Outcome[];
};

/**
 * Modal context type definition
 * Defines the different types of modals and their required data
 */
type ModalContext =
  | { type: 'obj'; id: number; currentName: string; url: string }
  | { type: 'out'; id: number; currentName: string; url: string }
  | { type: 'opu'; id: number; currentName: string; url: string }
  | { type: 'indicateur'; ind: Indicateur; url: string }
  | null;

/**
 * Props for the indicator modal component
 */
type ModalIndicateurInputProps = {
  currentName: string;
  currentValue: number;
  onConfirm: (nom: string, valeur: number) => void;
  onClose: () => void;
};

/**
 * Indicator Modal Component
 *
 * A modal dialog for editing indicator details
 * Features:
 * - Name editing
 * - Target value editing
 * - Validation before submission
 */
function ModalIndicateurInput({
  currentName,
  currentValue,
  onConfirm,
  onClose,
}: ModalIndicateurInputProps) {
  const [nom, setNom] = useState(currentName);
  const [valeur, setValeur] = useState(currentValue.toString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
        <h2 className="text-lg font-semibold text-[#9F0F3A] mb-4">Modifier un indicateur</h2>
        <label className="block text-sm font-medium mb-1">Nom de l&apos;indicateur</label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
        />
        <label className="block text-sm font-medium mb-1">Valeur cible</label>
        <input
          type="number"
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          placeholder="Valeur cible"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
            Annuler
          </button>
          <button
            onClick={() => {
              const parsed = parseInt(valeur, 10);
              if (nom.trim() && !isNaN(parsed)) {
                onConfirm(nom.trim(), parsed);
              }
            }}
            className="px-4 py-2 bg-[#9F0F3A] text-white rounded hover:bg-[#800d30]"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Update Logical Framework Page Component
 *
 * This component provides a comprehensive interface for updating logical frameworks.
 * Features include:
 * - Protected route (requires authentication and admin rights)
 * - Framework details editing
 * - Hierarchical structure management (objectives, outcomes, outputs, indicators)
 * - CRUD operations for all levels
 * - Modal-based editing interface
 *
 * The page displays:
 * - Framework basic information form
 * - Hierarchical table of objectives, outcomes, outputs, and indicators
 * - Edit and delete actions for each element
 */
export default function UpdateCadreLogiquePage() {
  useAuthGuard();
  const { callApi } = useApi();
  const { t } = useTranslation();

  const { id } = useParams();
  const [cadNom, setCadNom] = useState('');
  const [annee, setAnnee] = useState<number | ''>('');
  const [cadDateDebut, setCadDateDebut] = useState('');
  const [cadDateFin, setCadDateFin] = useState('');
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [modalContext, setModalContext] = useState<ModalContext>(null);

  const checked = useAdminGuard()

  /**
   * Automatically updates start and end dates when year changes
   * Sets a 4-year period from the selected year
   */
  useEffect(() => {
    if (typeof annee === 'number' && !isNaN(annee)) {
      setCadDateDebut(`${annee}-01-01`);
      setCadDateFin(`${annee + 3}-12-31`);
    }
  }, [annee]);

  /**
   * Initial data loading
   * Fetches framework details and structure
   */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${id}`);
        const data = await res.json();
        setCadNom(data.cad_nom || '');
        setCadDateDebut(data.cad_dateDebut || '');
        setCadDateFin(data.cad_dateFin || '');
        setAnnee(new Date(data.cad_dateDebut).getFullYear());
      } catch (err) {
        console.error(err);
      }
      fetchObjectifs();
    };
    load();
  }, [id, callApi]);

  /**
   * Fetches the complete framework structure
   * Includes objectives, outcomes, outputs, and indicators
   */
  const fetchObjectifs = async () => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${id}/structure`);
      const data: Objectif[] = await res.json();
      setObjectifs(data);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Updates the name of any framework element
   *
   * @param url - API endpoint for the element
   * @param payload - Data to update
   */
  type ModifierNomPayload = { obj_nom: string } | { out_nom: string } | { opu_nom: string } | { ind_nom: string; ind_valeurCible: number; ind_code: string };

  const modifierNom = async (url: string, payload: ModifierNomPayload) => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) fetchObjectifs();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Deletes any framework element
   * Shows confirmation dialog before deletion
   *
   * @param url - API endpoint for the element to delete
   */
  const supprimerElement = async (url: string) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/${url}`, { method: 'DELETE' });
      if (res.ok) fetchObjectifs();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Handles framework details form submission
   * Updates basic framework information
   *
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadNom || !cadDateDebut || !cadDateFin) return alert('Tous les champs sont requis.');

    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cad_nom: cadNom,
          cad_dateDebut: cadDateDebut,
          cad_dateFin: cadDateFin,
        }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      alert('Cadre logique mis à jour.');
    } catch (err) {
      console.error(err);
      alert('Échec de la mise à jour.');
    }
  };

  // Block access if not admin
  if (!checked) return null

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Page header with title and back button */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('update_logframe')}</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          <Link href="/cadre-logique" className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea]">
            {t('back_to_list')}
          </Link>
        </header>

        {/* Framework details form */}
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
              <input type="date" value={cadDateDebut} readOnly className="w-full border border-gray-300 rounded p-2 bg-gray-100" />
            </div>
            <div>
              <label className="block font-semibold mb-1">{t('auto_end_date')}</label>
              <input type="date" value={cadDateFin} readOnly className="w-full border border-gray-300 rounded p-2 bg-gray-100" />
            </div>
            <button type="submit" className="w-full bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30]">
              {t('save_changes')}
            </button>
          </form>
        </div>

        {/* Objectives list with hierarchical structure */}
        {objectifs.map((obj) => (
          <div key={obj.obj_id} className="bg-white p-6 rounded-xl shadow mb-10 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{obj.obj_nom}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setModalContext({ type: 'obj', id: obj.obj_id, currentName: obj.obj_nom, url: `objectifs-generaux/${obj.obj_id}` })
                  }
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => supprimerElement(`objectifs-generaux/${obj.obj_id}`)}>
                  <Trash className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Hierarchical table structure */}
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
                        {/* Outcome cell with rowspan */}
                        {k === 0 && l === 0 && (
                          <td
                            rowSpan={out.outputs.reduce((acc, o) => acc + (o.indicateurs.length || 1), 0)}
                            className="border px-4 py-2 align-top"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold">{`Outcome ${j + 1}`}</div>
                                <div>{out.out_nom}</div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setModalContext({
                                      type: 'out',
                                      id: out.out_id,
                                      currentName: out.out_nom,
                                      url: `outcomes/${out.out_id}`,
                                    })
                                  }
                                >
                                  <Pencil className="w-4 h-4 text-gray-600" />
                                </button>
                                <button onClick={() => supprimerElement(`outcomes/${out.out_id}`)}>
                                  <Trash className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </td>
                        )}
                        {/* Output cell with rowspan */}
                        {l === 0 && (
                          <td rowSpan={op.indicateurs.length || 1} className="border px-4 py-2 align-top">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold">{`Output ${j + 1}.${k + 1}`}</div>
                                <div>{op.opu_nom}</div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setModalContext({
                                      type: 'opu',
                                      id: op.opu_id,
                                      currentName: op.opu_nom,
                                      url: `outputs/${op.opu_id}`,
                                    })
                                  }
                                >
                                  <Pencil className="w-4 h-4 text-gray-600" />
                                </button>
                                <button onClick={() => supprimerElement(`outputs/${op.opu_id}`)}>
                                  <Trash className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </td>
                        )}
                        {/* Indicator cell */}
                        <td className="border px-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold">{`Indicateur ${j + 1}.${k + 1}.${l + 1}`}</span><br />
                              {ind.ind_nom}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setModalContext({ type: 'indicateur', ind, url: `indicateurs/${ind.ind_id}` })}>
                                <Pencil className="w-4 h-4 text-gray-600" />
                              </button>
                              <button onClick={() => supprimerElement(`indicateurs/${ind.ind_id}`)}>
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

      {/* Dynamic modals for editing different elements */}
      {modalContext?.type === 'obj' && (
        <ModalInput
          title={t('edit_general_objective')}
          label={t('general_objective_name')}
          initialValue={modalContext.currentName}
          onClose={() => setModalContext(null)}
          onConfirm={async (nom) => {
            await modifierNom(modalContext.url, { obj_nom: nom });
            setModalContext(null);
          }}
        />
      )}
      {modalContext?.type === 'out' && (
        <ModalInput
          title={t('edit_outcome')}
          label={t('outcome_name')}
          initialValue={modalContext.currentName}
          onClose={() => setModalContext(null)}
          onConfirm={async (nom) => {
            await modifierNom(modalContext.url, { out_nom: nom });
            setModalContext(null);
          }}
        />
      )}
      {modalContext?.type === 'opu' && (
        <ModalInput
          title={t('edit_output')}
          label={t('output_name')}
          initialValue={modalContext.currentName}
          onClose={() => setModalContext(null)}
          onConfirm={async (nom) => {
            await modifierNom(modalContext.url, { opu_nom: nom });
            setModalContext(null);
          }}
        />
      )}
      {modalContext?.type === 'indicateur' && (
        <ModalIndicateurInput
          currentName={modalContext.ind.ind_nom}
          currentValue={modalContext.ind.ind_valeurCible}
          onClose={() => setModalContext(null)}
          onConfirm={async (nom, valeur) => {
            await modifierNom(modalContext.url, {
              ind_nom: nom,
              ind_valeurCible: valeur,
              ind_code: modalContext.ind.ind_code,
            });
            setModalContext(null);
          }}
        />
      )}
    </main>
  );
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { jsPDF } from 'jspdf'
import { useTranslation } from 'react-i18next';
import useAuthGuard from '@/lib/hooks/useAuthGuard'
import { useApi } from '@/lib/hooks/useApi'

// Evaluation type definition
type Evaluation = {
  eva_id: number
  eva_use_id: number
  eva_statut: string
  eva_date_soumission?: string
  utilisateur?: {
    partenaire_id?: number
    prenom?: string
    nom?: string
  }
  criteres?: { label: string; reussi: boolean }[]
}

// User type definition
type User = {
  id: number
  email: string
  role: string
  nom: string
  prenom: string
}

// Partner type definition
type Partenaire = { part_id: number; part_nom: string }

// Helper function to format date in dd-mm-yyyy
function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function EvaluationPage() {
  useAuthGuard(); // Check if user is authenticated
  const { callApi } = useApi()
  const { t } = useTranslation();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [partenaireFilter, setPartenaireFilter] = useState('');
  const [sortDate, setSortDate] = useState<'desc' | 'asc'>('desc');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Utilisateur non connecté')
      setLoading(false)
      return
    }

    // Load user and partner data
    const fetchData = async () => {
      try {
        const [userRes, partenairesRes] = await Promise.all([
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/me`),
          callApi(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`),
        ]);

        const [userData, partenairesData] = await Promise.all([
          userRes.json(),
          partenairesRes.json(),
        ]);

        setUser(userData)
        setPartenaires(partenairesData)

        // Load evaluations based on role
        if (userData.role === 'siege') {
          await fetchAllEvaluations()
        } else {
          await fetchUserEvaluations(userData.id)
        }
      } catch (err: unknown) {
        console.error('Erreur chargement utilisateur ou partenaires :', err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Erreur de chargement')
        }
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch all evaluations (admin view)
  const fetchAllEvaluations = async () => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/evaluations`)
      const data: Evaluation[] = await res.json()
      setEvaluations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement évaluations :', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch evaluations assigned to a specific user
  const fetchUserEvaluations = async (userId: number) => {
    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/mes-evaluations?user_id=${userId}`)
      const data: Evaluation[] = await res.json()
      setEvaluations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement évaluations utilisateur :', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter evaluations by status, partner, date, and search input
  let filteredEvaluations = evaluations.filter(eva => {
    const matchStatut = statutFilter ? eva.eva_statut === statutFilter : true;
    const partenaire = partenaires.find(p => p.part_id === eva.utilisateur?.partenaire_id);
    const searchLower = search.toLowerCase();
    const matchSearch =
      search === '' ||
      eva.eva_id.toString().includes(search) ||
      eva.eva_use_id.toString().includes(search) ||
      (eva.utilisateur?.prenom && eva.utilisateur.prenom.toLowerCase().includes(searchLower)) ||
      (eva.utilisateur?.nom && eva.utilisateur.nom.toLowerCase().includes(searchLower)) ||
      (partenaire && partenaire.part_nom.toLowerCase().includes(searchLower));
    const matchPartenaire = partenaireFilter ? eva.utilisateur?.partenaire_id?.toString() === partenaireFilter : true;

    let matchDate = true;
    if (dateDebut) {
      const dDebut = new Date(dateDebut);
      const dEva = eva.eva_date_soumission ? new Date(eva.eva_date_soumission) : null;
      if (!dEva || dEva < dDebut) matchDate = false;
    }
    if (dateFin) {
      const dFin = new Date(dateFin);
      const dEva = eva.eva_date_soumission ? new Date(eva.eva_date_soumission) : null;
      if (!dEva || dEva > dFin) matchDate = false;
    }

    return matchStatut && matchSearch && matchPartenaire && matchDate;
  });

  // Sort evaluations by submission date
  filteredEvaluations = filteredEvaluations.sort((a, b) => {
    const dateA = a.eva_date_soumission ? new Date(a.eva_date_soumission).getTime() : 0;
    const dateB = b.eva_date_soumission ? new Date(b.eva_date_soumission).getTime() : 0;
    return sortDate === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Export filtered evaluations as a PDF document
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des évaluations filtrées', 105, 15, { align: 'center' });
    let y = 25;

    filteredEvaluations.forEach((eva, idx) => {
      if (idx > 0) {
        doc.setDrawColor(180);
        doc.line(10, y, 200, y);
        y += 4;
      }

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Évaluation #${eva.eva_id}`, 10, y);
      y += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      if (eva.utilisateur) {
        doc.text(`Évalué : ${eva.utilisateur.prenom || ''} ${eva.utilisateur.nom || ''}`, 10, y);
        y += 6;
      }

      const partenaire = partenaires.find(p => p.part_id === eva.utilisateur?.partenaire_id);
      if (partenaire) {
        doc.text(`Partenaire : ${partenaire.part_nom}`, 10, y);
        y += 6;
      }

      if (eva.eva_statut === 'soumis') {
        doc.setTextColor(0, 128, 0);
      } else if (eva.eva_statut === 'en_attente') {
        doc.setTextColor(200, 100, 0);
      } else {
        doc.setTextColor(0, 0, 0);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`Statut : ${eva.eva_statut}`, 10, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      y += 6;

      if (eva.eva_date_soumission) {
        doc.text(`Date d'évaluation : ${formatDate(eva.eva_date_soumission)}`, 10, y);
        y += 6;
      }

      doc.text(`Utilisateur évalué : ${eva.eva_use_id}`, 10, y);
      y += 6;

      if (Array.isArray(eva.criteres)) {
        doc.setFont('helvetica', 'bold');
        doc.text('Critères :', 10, y);
        doc.setFont('helvetica', 'normal');
        y += 6;
        eva.criteres.forEach((crit) => {
          if (crit.reussi) {
            doc.setTextColor(0, 128, 0);
          } else {
            doc.setTextColor(200, 0, 0);
          }
          doc.text(`- ${crit.label} : ${crit.reussi ? 'Réussi' : 'Non réussi'}`, 16, y);
          doc.setTextColor(0, 0, 0);
          y += 6;
          if (y > 270) { doc.addPage(); y = 20; }
        });
      }

      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save('evaluations.pdf');
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('evaluations_title', 'Évaluations')}</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {user?.role === 'siege' && (
              <Link
                href="/evaluation/creer"
                className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition mb-2"
              >
                {t('new_evaluation', '➕ Nouvelle évaluation')}
              </Link>
            )}
          </div>
        </header>

        {error && <p className="text-red-600">{t('error_prefix', 'Erreur :')} {error}</p>}
        {loading ? (
          <p className="text-gray-400">{t('loading', 'Chargement...')}</p>
        ) : evaluations.length === 0 ? (
          <p className="text-gray-500">
            {user?.role === 'siege'
              ? t('no_evaluations', 'Aucune évaluation disponible.')
              : t('no_evaluations_to_fill', 'Aucune évaluation à remplir pour le moment.')}
          </p>
        ) : (
          <>
            {/* Filtres et recherche */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder={t('search_placeholder', "Rechercher par ID, nom/prénom de l'utilisateur ou nom du partenaire...")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border px-3 py-2 rounded flex-1 min-w-0"
                />
                <select
                  value={statutFilter}
                  onChange={e => setStatutFilter(e.target.value)}
                  className="border px-3 py-2 rounded flex-1 min-w-0"
                >
                  <option value="">{t('all_statuses', 'Tous les statuts')}</option>
                  <option value="en_attente">{t('status_pending', 'En attente')}</option>
                  <option value="soumis">{t('status_submitted', 'Soumis')}</option>
                </select>
                <select
                  value={partenaireFilter}
                  onChange={e => setPartenaireFilter(e.target.value)}
                  className="border px-3 py-2 rounded flex-1 min-w-0"
                >
                  <option value="">{t('all_partners', 'Tous les partenaires')}</option>
                  {partenaires.map(p => (
                    <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
                  ))}
                </select>
                <select
                  value={sortDate}
                  onChange={e => setSortDate(e.target.value as 'desc' | 'asc')}
                  className="border px-3 py-2 rounded flex-1 min-w-0"
                >
                  <option value="desc">{t('sort_newest', "Plus récentes d'abord")}</option>
                  <option value="asc">{t('sort_oldest', "Plus anciennes d'abord")}</option>
                </select>
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-1 items-center">
                <label className="text-sm text-gray-700 whitespace-nowrap mr-1">{t('date_start', 'Date de début')}</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={e => setDateDebut(e.target.value)}
                  className="border px-3 py-2 rounded flex-1 min-w-0"
                  placeholder={t('date_start', 'Date début')}
                />
                <label className="text-sm text-gray-700 whitespace-nowrap ml-2 mr-1">{t('date_end', 'Date de fin')}</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={e => setDateFin(e.target.value)}
                  className="border px-3 py-2 rounded flex-1 min-w-0"
                  placeholder={t('date_end', 'Date fin')}
                />
                <button
                  onClick={handleExportPDF}
                  className="text-sm bg-[#9F0F3A] text-white px-4 py-2 rounded hover:bg-[#800d30] transition border border-[#9F0F3A] flex-1 min-w-0"
                  type="button"
                >
                  {t('export_pdf', 'Exporter en PDF')}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvaluations.length === 0 ? (
                <p className="text-gray-500 col-span-2">{t('no_evaluation_match', 'Aucune évaluation ne correspond à la recherche ou au filtre.')}</p>
              ) : (
                filteredEvaluations.map((eva) => {
                  const partenaire = partenaires.find(
                    p => p.part_id === eva.utilisateur?.partenaire_id
                  );
                  return (
                    <div
                      key={eva.eva_id}
                      className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition"
                    >
                      <p className="text-sm text-gray-600">{t('id', 'ID')} : {eva.eva_id}</p>
                      {eva.eva_date_soumission && (
                        <p className="text-xs text-gray-500">{t('evaluation_date', "Date d'évaluation")} : {formatDate(eva.eva_date_soumission)}</p>
                      )}
                      {eva.utilisateur && (
                        <p className="text-sm text-gray-600">
                          {t('evaluated', 'Évalué')} : {eva.utilisateur.prenom} {eva.utilisateur.nom}
                        </p>
                      )}
                      {partenaire && (
                        <p className="text-sm text-gray-600">{t('partner', 'Partenaire')} : {partenaire.part_nom}</p>
                      )}
                      <p className="font-medium text-gray-800">{t('status', 'Statut')} : {t('status_' + eva.eva_statut, eva.eva_statut)}</p>
                      <p className="text-sm text-gray-600">
                        {t('evaluated_user_id', 'Utilisateur évalué')} : {eva.eva_use_id}
                      </p>
                      <Link
                        href={`/evaluation/${eva.eva_id}`}
                        className="inline-block mt-2 text-blue-600 text-sm underline"
                      >
                        {user?.role === 'siege'
                          ? t('see_evaluation', "Voir l'évaluation →")
                          : t('fill_evaluation', "Remplir cette évaluation →")}
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
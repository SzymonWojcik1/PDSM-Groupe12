'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
}

type User = {
  id: number
  email: string
  role: string
  nom: string
  prenom: string
}

type Partenaire = { part_id: number; part_nom: string }

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function EvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState(''); // '' = tous les statuts
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [partenaireFilter, setPartenaireFilter] = useState(''); // '' = tous les partenaires
  const [sortDate, setSortDate] = useState<'desc' | 'asc'>('desc'); // desc = plus récentes d'abord
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Utilisateur non connecté')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Échec de la récupération de l\'utilisateur')

        const userData: User = await res.json()
        setUser(userData)

        if (userData.role === 'siege') {
          fetchAllEvaluations()
        } else {
          fetchUserEvaluations(userData.id)
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchUser()

    // Récupération des partenaires pour le filtre
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`)
      .then(res => res.json())
      .then(data => setPartenaires(data))
      .catch(err => console.error('Erreur chargement partenaires :', err))
  }, [])

  const fetchAllEvaluations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluations`)
      const data: Evaluation[] = await res.json()
      setEvaluations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement évaluations :', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserEvaluations = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mes-evaluations?user_id=${userId}`)
      const data: Evaluation[] = await res.json()
      setEvaluations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement évaluations utilisateur :', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrage des évaluations selon la recherche, le statut et le partenaire
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
    // Filtrage par date
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

  // Tri par date d'évaluation
  filteredEvaluations = filteredEvaluations.sort((a, b) => {
    const dateA = a.eva_date_soumission ? new Date(a.eva_date_soumission).getTime() : 0;
    const dateB = b.eva_date_soumission ? new Date(b.eva_date_soumission).getTime() : 0;
    return sortDate === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Évaluations</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          {user?.role === 'siege' && (
            <Link
              href="/evaluation/creer"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              ➕ Nouvelle évaluation
            </Link>
          )}
        </header>

        {error && <p className="text-red-600">Erreur : {error}</p>}
        {loading ? (
          <p className="text-gray-400">Chargement...</p>
        ) : evaluations.length === 0 ? (
          <p className="text-gray-500">
            {user?.role === 'siege'
              ? 'Aucune évaluation disponible.'
              : 'Aucune évaluation à remplir pour le moment.'}
          </p>
        ) : (
          <>
            {/* Filtres et recherche */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Rechercher par ID, nom/prénom de l'utilisateur ou nom du partenaire..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border px-3 py-2 rounded w-full md:w-1/3"
              />
              <select
                value={statutFilter}
                onChange={e => setStatutFilter(e.target.value)}
                className="border px-3 py-2 rounded w-full md:w-1/4"
              >
                <option value="">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="soumis">Soumis</option>
                {/* Ajoute d'autres statuts si besoin */}
              </select>
              <select
                value={partenaireFilter}
                onChange={e => setPartenaireFilter(e.target.value)}
                className="border px-3 py-2 rounded w-full md:w-1/4"
              >
                <option value="">Tous les partenaires</option>
                {partenaires.map(p => (
                  <option key={p.part_id} value={p.part_id}>{p.part_nom}</option>
                ))}
              </select>
              <select
                value={sortDate}
                onChange={e => setSortDate(e.target.value as 'desc' | 'asc')}
                className="border px-3 py-2 rounded w-full md:w-1/4"
              >
                <option value="desc">Plus récentes d'abord</option>
                <option value="asc">Plus anciennes d'abord</option>
              </select>
              <input
                type="date"
                value={dateDebut}
                onChange={e => setDateDebut(e.target.value)}
                className="border px-3 py-2 rounded w-full md:w-1/4"
                placeholder="Date début"
              />
              <input
                type="date"
                value={dateFin}
                onChange={e => setDateFin(e.target.value)}
                className="border px-3 py-2 rounded w-full md:w-1/4"
                placeholder="Date fin"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvaluations.length === 0 ? (
                <p className="text-gray-500 col-span-2">Aucune évaluation ne correspond à la recherche ou au filtre.</p>
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
                      <p className="text-sm text-gray-600">ID : {eva.eva_id}</p>
                      {eva.eva_date_soumission && (
                        <p className="text-xs text-gray-500">Date d'évaluation : {formatDate(eva.eva_date_soumission)}</p>
                      )}
                      {eva.utilisateur && (
                        <p className="text-sm text-gray-600">
                          Évalué : {eva.utilisateur.prenom} {eva.utilisateur.nom}
                        </p>
                      )}
                      {partenaire && (
                        <p className="text-sm text-gray-600">Partenaire : {partenaire.part_nom}</p>
                      )}
                      <p className="font-medium text-gray-800">Statut : {eva.eva_statut}</p>
                      <p className="text-sm text-gray-600">
                        Utilisateur évalué : {eva.eva_use_id}
                      </p>
                      <Link
                        href={`/evaluation/${eva.eva_id}`}
                        className="inline-block mt-2 text-blue-600 text-sm underline"
                      >
                        {user?.role === 'siege'
                          ? 'Voir l\'évaluation →'
                          : 'Remplir cette évaluation →'}
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
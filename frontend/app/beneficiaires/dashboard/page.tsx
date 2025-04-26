'use client';

import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardBeneficiaires() {
  // Données fictives, à remplacer par des données dynamiques si besoin
  const stats = {
    total: 150,
    actifs: 120,
    nouveaux: 15,
    participants: 85,
  };

  // Exemple de données pour la répartition par région
  const dataRegion = [
    { name: 'Europe', value: 60 },
    { name: 'Afrique', value: 40 },
    { name: 'Asie', value: 30 },
    { name: 'Amérique', value: 20 },
  ];

  // Exemple de données pour l’évolution mensuelle
  const dataMois = [
    { mois: 'Jan', inscrits: 10 },
    { mois: 'Fév', inscrits: 15 },
    { mois: 'Mar', inscrits: 20 },
    { mois: 'Avr', inscrits: 25 },
    { mois: 'Mai', inscrits: 15 },
    { mois: 'Juin', inscrits: 5 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Tableau de bord des bénéficiaires</h1>
        <Link href="/beneficiaires" className="text-blue-600 underline">Retour à la liste</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-sm text-gray-500">Total bénéficiaires</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-sm text-gray-500">Actifs</div>
          <div className="text-2xl font-bold">{stats.actifs}</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-sm text-gray-500">Nouveaux ce mois</div>
          <div className="text-2xl font-bold">{stats.nouveaux}</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-sm text-gray-500">Participants aux activités</div>
          <div className="text-2xl font-bold">{stats.participants}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Graphique camembert */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Répartition par région</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataRegion}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {dataRegion.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique barres */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Évolution mensuelle des inscriptions</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataMois}>
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inscrits" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
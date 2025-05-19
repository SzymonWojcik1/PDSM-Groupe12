'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardBeneficiaires() {
  const [stats, setStats] = useState({ total: 0, actifs: 0, nouveaux: 0, participants: 0 });
  const [dataRegion, setDataRegion] = useState([]);
  const [dataMois, setDataMois] = useState([]);

  useEffect(() => {
    fetch('/api/beneficiaires')
      .then(res => res.json())
      .then((data) => {
        const now = new Date();
        const monthNow = now.getMonth();
        const total = data.length;

        const nouveaux = data.filter((b: any) => new Date(b.created_at).getMonth() === monthNow).length;

        const regionMap = new Map<string, number>();
        data.forEach((b: any) => {
          if (!regionMap.has(b.ben_region)) {
            regionMap.set(b.ben_region, 0);
          }
          regionMap.set(b.ben_region, regionMap.get(b.ben_region)! + 1);
        });
        const dataRegion = Array.from(regionMap, ([name, value]) => ({ name, value }));

        const moisMap = new Array(12).fill(0);
        data.forEach((b: any) => {
          const m = new Date(b.created_at).getMonth();
          moisMap[m]++;
        });
        const dataMois = moisMap.map((val, i) => ({
          mois: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
          inscrits: val
        }));

        setStats({ total, actifs: total, nouveaux, participants: 0 }); // Participants à calculer si tu as la table d'association
        setDataRegion(dataRegion);
        setDataMois(dataMois);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Tableau de bord des bénéficiaires</h1>
        <Link href="/beneficiaires" className="text-blue-600 underline">Retour à la liste</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard label="Total bénéficiaires" value={stats.total} />
        <StatCard label="Actifs" value={stats.actifs} />
        <StatCard label="Nouveaux ce mois" value={stats.nouveaux} />
        <StatCard label="Participants aux activités" value={stats.participants} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChartCard title="Répartition par région">
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
        </ChartCard>

        <ChartCard title="Évolution mensuelle des inscriptions">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataMois}>
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inscrits" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-gray-100 rounded p-4 text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
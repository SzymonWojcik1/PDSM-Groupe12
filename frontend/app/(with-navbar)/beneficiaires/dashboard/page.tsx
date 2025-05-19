'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

type RegionData = { name: string; value: number };
type MoisData = { mois: string; inscrits: number };

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardBeneficiaires() {
  const [stats, setStats] = useState({ total: 0, actifs: 0, nouveaux: 0, participants: 0 });
  const [dataRegion, setDataRegion] = useState<RegionData[]>([]);
  const [dataMois, setDataMois] = useState<MoisData[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires`)
      .then(res => res.json())
      .then((data) => {
        const now = new Date();
        const monthNow = now.getMonth();
        const total = data.length;

        const nouveaux = data.filter((b: any) =>
          new Date(b.created_at).getMonth() === monthNow
        ).length;

        const regionMap = new Map<string, number>();
        data.forEach((b: any) => {
          regionMap.set(b.ben_region, (regionMap.get(b.ben_region) || 0) + 1);
        });
        const dataRegion = Array.from(regionMap.entries()).map(([name, value]) => ({ name, value }));

        const moisMap = new Array(12).fill(0);
        data.forEach((b: any) => {
          const m = new Date(b.created_at).getMonth();
          moisMap[m]++;
        });
        const dataMois = moisMap.map((val, i) => ({
          mois: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
          inscrits: val
        }));

        setStats({ total, actifs: total, nouveaux, participants: 0 });
        setDataRegion(dataRegion);
        setDataMois(dataMois);
      })
      .catch(err => console.error('Erreur chargement dashboard:', err));
  }, []);

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Tableau de bord des bénéficiaires</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
            </div>
            <Link
              href="/beneficiaires"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              Retour à la liste
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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
    </main>
  );
}

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-4 text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

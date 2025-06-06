// Dashboard page for beneficiaries statistics and charts

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid
} from 'recharts';

import useAuthGuard from '@/lib/hooks/useAuthGuard';
import { useApi } from '@/lib/hooks/useApi';

// Types for chart data
type RegionData = { name: string; value: number };
type MoisData = { mois: string; inscrits: number };
type AgeData = { tranche: string; nombre: number };
type TypeBeneficiaireData = { type: string; nombre: number };
type ZoneData = { zone: string; nombre: number };
type SexeData = { sexe: string; nombre: number };
type GenreData = { genre: string; nombre: number };

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9F0F3A', '#8884d8'];

export default function DashboardBeneficiaires() {
  // Protect the page with authentication guard
  useAuthGuard();
  const { t } = useTranslation();
  const { callApi } = useApi();

  // State for various statistics and chart data
  const [stats, setStats] = useState({ total: 0, actifs: 0, nouveaux: 0, participants: 0 });
  const [dataRegion, setDataRegion] = useState<RegionData[]>([]);
  const [dataMois, setDataMois] = useState<MoisData[]>([]);
  // const [dataGenreRegion, setDataGenreRegion] = useState<GenreRegionData[]>([]);
  const [dataAge, setDataAge] = useState<AgeData[]>([]);
  // const [dataStatut, setDataStatut] = useState<StatutData[]>([]);
  const [dataTypeBeneficiaire, setDataTypeBeneficiaire] = useState<TypeBeneficiaireData[]>([]);
  const [dataZone, setDataZone] = useState<ZoneData[]>([]);
  const [dataSexe, setDataSexe] = useState<SexeData[]>([]);
  const [dataGenre, setDataGenre] = useState<GenreData[]>([]);

  // Type for a beneficiary
  type Beneficiaire = {
    id: number;
    ben_region: string;
    ben_pays: string;
    ben_date_naissance: string;
    ben_genre: string;
    ben_type: string;
    ben_zone: string;
    ben_sexe: string;
    ben_statut?: string;
    created_at: string;
  };

  // Fetch and process data for dashboard charts and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/beneficiaires`);
        const data: Beneficiaire[] = await response.json();

        const now = new Date();
        const monthNow = now.getMonth();
        const total = data.length;

        // Count new beneficiaries this month
        const nouveaux = data.filter(b =>
          new Date(b.created_at).getMonth() === monthNow
        ).length;

        // Distribution by region
        const regionMap = new Map<string, number>();
        data.forEach(b => {
          regionMap.set(b.ben_region, (regionMap.get(b.ben_region) || 0) + 1);
        });
        const dataRegion = Array.from(regionMap.entries()).map(([name, value]) => ({ name, value }));

        // Monthly registration trend
        const moisMap = new Array(12).fill(0);
        data.forEach(b => {
          const m = new Date(b.created_at).getMonth();
          moisMap[m]++;
        });
        const dataMois = moisMap.map((val, i) => ({
          mois: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
          inscrits: val
        }));

        // Distribution by gender and region (not used in charts)
        const genreRegionMap = new Map<string, { hommes: number; femmes: number }>();
        data.forEach(b => {
          const region = b.ben_region;
          const current = genreRegionMap.get(region) || { hommes: 0, femmes: 0 };
          if (b.ben_genre === 'M') current.hommes++;
          else current.femmes++;
          genreRegionMap.set(region, current);
        });

        // Distribution by age group
        const ageMap = new Map<string, number>();
        data.forEach(b => {
          const age = new Date().getFullYear() - new Date(b.ben_date_naissance).getFullYear();
          let tranche = '';
          if (age < 18) tranche = '0-17 ans';
          else if (age < 25) tranche = '18-24 ans';
          else if (age < 35) tranche = '25-34 ans';
          else if (age < 50) tranche = '35-49 ans';
          else tranche = '50+ ans';
          ageMap.set(tranche, (ageMap.get(tranche) || 0) + 1);
        });
        const tranchesOrdre = ['0-17 ans', '18-24 ans', '25-34 ans', '35-49 ans', '50+ ans'];
        const dataAgeSorted = Array.from(ageMap.entries())
          .map(([tranche, nombre]) => ({ tranche, nombre }))
          .sort((a, b) => tranchesOrdre.indexOf(a.tranche) - tranchesOrdre.indexOf(b.tranche));

        // Distribution by status (not used in charts)
        const statutMap = new Map<string, number>();
        data.forEach(b => {
          const statut = b.ben_statut || 'Non spécifié';
          statutMap.set(statut, (statutMap.get(statut) || 0) + 1);
        });
        // const dataStatut = Array.from(statutMap.entries()).map(([statut, nombre]) => ({ statut, nombre }));

        // Distribution by beneficiary type
        const typeMap = new Map<string, number>();
        data.forEach(b => {
          const type = b.ben_type || 'Non spécifié';
          typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });
        const dataTypeBeneficiaire = Array.from(typeMap.entries()).map(([type, nombre]) => ({ type, nombre }));

        // Distribution by zone
        const zoneMap = new Map<string, number>();
        data.forEach(b => {
          const zone = b.ben_zone || 'Non spécifié';
          zoneMap.set(zone, (zoneMap.get(zone) || 0) + 1);
        });
        const dataZone = Array.from(zoneMap.entries()).map(([zone, nombre]) => ({ zone, nombre }));

        // Distribution by sex
        const sexeMap = new Map<string, number>();
        data.forEach(b => {
          const sexe = b.ben_sexe || 'Non spécifié';
          sexeMap.set(sexe, (sexeMap.get(sexe) || 0) + 1);
        });
        const dataSexe = Array.from(sexeMap.entries()).map(([sexe, nombre]) => ({ sexe, nombre }));

        // Distribution by gender
        const genreMap = new Map<string, number>();
        data.forEach(b => {
          const genre = b.ben_genre || 'Non spécifié';
          genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
        });
        const dataGenre = Array.from(genreMap.entries()).map(([genre, nombre]) => ({ genre, nombre }));

        // Set all computed data to state
        setStats({ total, actifs: total, nouveaux, participants: 0 });
        setDataRegion(dataRegion);
        setDataMois(dataMois);
        // setDataGenreRegion(dataGenreRegion);
        setDataAge(dataAgeSorted);
        // setDataStatut(dataStatut);
        setDataTypeBeneficiaire(dataTypeBeneficiaire);
        setDataZone(dataZone);
        setDataSexe(dataSexe);
        setDataGenre(dataGenre);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      }
    };

    fetchData();
  }, [callApi]);

  // Sort age groups before rendering
  const tranchesOrdre = ['0-17 ans', '18-24 ans', '25-34 ans', '35-49 ans', '50+ ans'];
  const dataAgeSorted = [...dataAge].sort((a, b) => tranchesOrdre.indexOf(a.tranche) - tranchesOrdre.indexOf(b.tranche));

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard header */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('beneficiaries_dashboard')}</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
            </div>
            <Link
              href="/beneficiaires"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              {t('back_to_list')}
            </Link>
          </div>
        </header>

        {/* Statistic cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 justify-center mx-auto w-fit">
          <StatCard label={t('total_beneficiaries')} value={stats.total} />
          <StatCard label={t('active')} value={stats.actifs} />
          <StatCard label={t('new_this_month')} value={stats.nouveaux} />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Distribution by region */}
          <ChartCard title={t('distribution_by_region')}>
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

          {/* Monthly registration trend */}
          <ChartCard title={t('monthly_registration_trend')}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dataMois}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inscrits"
                  stroke="#9F0F3A"
                  strokeWidth={2}
                  dot={{ fill: "#9F0F3A", strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                  name={t('registrations')}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Distribution by age group */}
          <ChartCard title={t('distribution_by_age_group')}>
            <div className="flex justify-center items-center w-full h-full">
              <ResponsiveContainer width={"90%"} height={250}>
                <BarChart data={dataAgeSorted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tranche" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="nombre"
                    name={t('number_of_beneficiaries')}
                    radius={[4, 4, 0, 0]}
                  >
                    {dataAgeSorted.map((entry, index) => (
                      <Cell key={`cell-age-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Distribution by beneficiary type */}
          <ChartCard title={t('distribution_by_beneficiary_type')}>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={dataTypeBeneficiaire}
                  dataKey="nombre"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {dataTypeBeneficiaire.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ marginTop: 40, fontSize: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Distribution by zone */}
          <ChartCard title={t('distribution_by_zone')}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataZone}
                  dataKey="nombre"
                  nameKey="zone"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {dataZone.map((entry, index) => (
                    <Cell key={`cell-zone-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ marginTop: 40, fontSize: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Distribution by sex */}
          <ChartCard title={t('distribution_by_sex')}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataSexe}
                  dataKey="nombre"
                  nameKey="sexe"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {dataSexe.map((entry, index) => (
                    <Cell key={`cell-sexe-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ marginTop: 40, fontSize: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Distribution by gender */}
          <ChartCard title={t('distribution_by_gender')}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataGenre}
                  dataKey="nombre"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {dataGenre.map((entry, index) => (
                    <Cell key={`cell-genre-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ marginTop: 40, fontSize: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </main>
  );
}

// Card component for displaying a statistic
function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-4 text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

// Card component for displaying a chart
function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

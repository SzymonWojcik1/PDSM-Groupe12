'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function HomePage() {
  const { t } = useTranslation();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('role'));
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('dashboard_title')}</h1>
          <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          <p className="text-gray-700 mt-2">{t('dashboard_intro')}</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title={t('card_beneficiaries_title')}
            href="/beneficiaires"
            description={t('card_beneficiaries_desc')}
          />
          <Card
            title={t('card_activities_title')}
            href="/activites"
            description={t('card_activities_desc')}
          />
          <Card
            title={t('card_projects_title')}
            href="/projets"
            description={t('card_projects_desc')}
          />
          <Card
            title={t('card_partners_title')}
            href="/partenaires"
            description={t('card_partners_desc')}
          />
          <Card
            title={t('card_logframe_title')}
            href="/cadre-logique"
            description={t('card_logframe_desc')}
          />
          <Card 
            title={t('card_evaluations_title', 'Évaluations')} 
            href="/evaluation" 
            description={t('card_evaluations_desc', 'Consulter ou créer des évaluations des partenaires.')} 
          />
          {role === 'siege' && (
            <Card
              title={t('card_users_title')}
              href="/users"
              description={t('card_users_desc')}
            />
          )}
          <Card
            title={t('card_profile_title')}
            href="/profil"
            description={t('card_profile_desc')}
          />
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block border border-gray-200 rounded-2xl bg-white p-6 hover:shadow-md transition"
    >
      <h2 className="text-xl font-semibold text-[#9F0F3A] mb-2">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </a>
  );
}

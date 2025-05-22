'use client'

import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

export default function HomePage() {
  const { t } = useTranslation()

  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('dashboard_title')}</h1>
      <p className="text-gray-700">{t('dashboard_intro')}</p>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
  )
}

function Card({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="block border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
    >
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </a>
  )
}
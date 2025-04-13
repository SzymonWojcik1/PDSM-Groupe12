'use client';

import Link from 'next/link';
import { useTranslation } from './hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">{t('dashboard')}</h1>
      <div className="mb-8">
        <Link 
          href="/auth/login"
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {t('login')}
        </Link>
      </div>
    </div>
  );
}

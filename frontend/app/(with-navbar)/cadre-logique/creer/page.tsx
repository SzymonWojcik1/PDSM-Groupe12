'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useApi } from '@/lib/hooks/useApi';
import useAuthGuard from '@/lib/hooks/useAuthGuard';
import useAdminGuard from '@/lib/hooks/useAdminGuard';
import '@/lib/i18n';

/**
 * Create Logical Framework Page Component
 * 
 * This component provides a form interface for creating new logical frameworks.
 * Features include:
 * - Protected route (requires authentication and admin rights)
 * - Form validation
 * - Automatic date range calculation based on year
 * - Internationalization support
 * 
 * The form includes:
 * - Framework name input
 * - Year selection for automatic date range
 * - Read-only date fields (start and end dates)
 * - Submit and back buttons
 */
export default function CreateCadreLogique() {
  useAuthGuard();
  const { t } = useTranslation();
  const router = useRouter();
  const { callApi } = useApi();

  const checked = useAdminGuard()

  // Form state management
  const [cadNom, setCadNom] = useState('');
  const [cadDateDebut, setCadDateDebut] = useState('');
  const [cadDateFin, setCadDateFin] = useState('');

  /**
   * Handles form submission
   * Validates required fields and creates new logical framework
   * Redirects to framework list on success
   * 
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cadNom || !cadDateDebut || !cadDateFin) {
      alert(t('all_fields_required'));
      return;
    }

    try {
      const res = await callApi(`${process.env.NEXT_PUBLIC_API_URL}/cadre-logique`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cad_nom: cadNom,
          cad_dateDebut: cadDateDebut,
          cad_dateFin: cadDateFin,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la création');
      router.push('/cadre-logique');
    } catch (err) {
      console.error(t('create_failed'), err);
      alert(t('create_failed'));
    }
  };

  /**
   * Handles year input change
   * Automatically calculates start and end dates for a 4-year period
   * Start date: January 1st of selected year
   * End date: December 31st of year + 3
   * 
   * @param e - Input change event
   */
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year)) {
      const debut = `${year}-01-01`;
      const fin = `${year + 3}-12-31`;
      setCadDateDebut(debut);
      setCadDateFin(fin);
    }
  };

  // Block access if not admin
  if (!checked) return null

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Page header with title and back button */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">{t('create_logframe')}</h1>
            <div className="h-1 w-20 bg-[#9F0F3A] rounded"></div>
          </div>
          <Link
            href="/cadre-logique"
            className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
          >
            {t('back_to_list')}
          </Link>
        </header>

        {/* Form container */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Framework name input */}
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

            {/* Year selection input */}
            <div>
              <label className="block font-semibold mb-1">{t('start_year')}</label>
              <input
                type="number"
                placeholder="Ex: 2025"
                onChange={handleYearChange}
                required
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            {/* Read-only start date display */}
            <div>
              <label className="block font-semibold mb-1">{t('auto_start_date')}</label>
              <input
                type="date"
                value={cadDateDebut}
                readOnly
                className="w-full border border-gray-300 rounded p-2 bg-gray-100"
              />
            </div>

            {/* Read-only end date display */}
            <div>
              <label className="block font-semibold mb-1">{t('auto_end_date')}</label>
              <input
                type="date"
                value={cadDateFin}
                readOnly
                className="w-full border border-gray-300 rounded p-2 bg-gray-100"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-[#9F0F3A] text-white py-2 rounded hover:bg-[#800d30] transition"
            >
              {t('create')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

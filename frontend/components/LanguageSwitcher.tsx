'use client'

import { useTranslation } from 'react-i18next'

/**
 * Language Switcher Component
 * 
 * A dropdown component that allows users to switch between different languages.
 * Features:
 * - Supports French, English, and Spanish
 * - Uses i18n for language management
 * - Displays language flags
 * - Responsive design
 */
export default function LanguageSwitcher() {
  // Get i18n instance for language management
  const { i18n } = useTranslation()

  /**
   * Handles language change event
   * Updates the application language when user selects a new option
   * @param e - The change event from the select element
   */
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    // Language selection dropdown
    <select
      onChange={handleChange}
      value={i18n.language}
      className="w-full px-2 py-1 rounded border text-sm bg-white text-gray-700"
    >
      {/* Language options with flags */}
      <option value="fr">🇫🇷 Français</option>
      <option value="en">🇬🇧 English</option>
      <option value="es">🇪🇸 Español</option>
    </select>
  )
}
'use client'

import i18n from 'i18next'

export default function LanguageSwitcher() {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <select
      onChange={handleChange}
      defaultValue={i18n.language}
      className="w-full px-2 py-1 rounded border text-sm bg-white text-gray-700"
    >
      <option value="fr">🇫🇷 Français</option>
      <option value="en">🇬🇧 English</option>
      <option value="es">🇪🇸 Español</option>
    </select>
  )
}
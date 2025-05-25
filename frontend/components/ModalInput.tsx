'use client'

import { useState, useEffect } from 'react'

type Props = {
  title: string
  label: string
  placeholder?: string
  initialValue?: string           // ← nouveau
  onConfirm: (value: string) => void
  onClose: () => void
}

export default function ModalInput({
  title,
  label,
  placeholder,
  initialValue = '',               // ← valeur par défaut
  onConfirm,
  onClose,
}: Props) {
  const [value, setValue] = useState('')

  // une fois monté, on initialise le state à la valeur reçue
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
        <h2 className="text-lg font-semibold text-[#9F0F3A] mb-4">{title}</h2>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (value.trim()) onConfirm(value.trim())
            }}
            className="px-4 py-2 bg-[#9F0F3A] text-white rounded hover:bg-[#800d30]"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

/**
 * Props interface for the ModalInput component
 * Defines the structure of the modal's configuration and callbacks
 */
type Props = {
  title: string              // Modal title
  label: string              // Input field label
  placeholder?: string       // Optional placeholder text
  initialValue?: string      // Optional initial value for the input
  onConfirm: (value: string) => void  // Callback for confirmation
  onClose: () => void        // Callback for closing the modal
}

/**
 * Modal Input Component
 * 
 * A reusable modal component that displays an input field with confirmation options.
 * Features:
 * - Customizable title and label
 * - Optional placeholder and initial value
 * - Confirmation and cancellation actions
 * - Input validation (non-empty)
 * - Responsive design
 */
export default function ModalInput({
  title,
  label,
  placeholder,
  initialValue = '',         // Default empty string if no initial value provided
  onConfirm,
  onClose,
}: Props) {
  // State for managing input value
  const [value, setValue] = useState('')

  // Initialize input value when component mounts or initialValue changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    // Modal overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {/* Modal container */}
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
        {/* Modal title */}
        <h2 className="text-lg font-semibold text-[#9F0F3A] mb-4">{title}</h2>
        
        {/* Input field label */}
        <label className="block text-sm font-medium mb-1">{label}</label>
        
        {/* Text input field */}
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />

        {/* Action buttons container */}
        <div className="flex justify-end gap-2">
          {/* Cancel button */}
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          
          {/* Confirm button */}
          <button
            onClick={() => {
              if (value.trim()) onConfirm(value.trim())
            }}
            className="px-4 py-2 bg-[#9F0F3A] text-white rounded hover:bg-[#800d30]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

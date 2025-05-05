'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreerPartenaire() {
  const [form, setForm] = useState({ part_nom: '', part_pays: '', part_region: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrorMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partenaires`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setErrorMessage(data.message || 'Une erreur est survenue')
      return
    }

    router.push('/partenaires')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">Créer un partenaire</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded">
            {errorMessage}
          </div>
        )}

        <input name="part_nom" placeholder="Nom" className="border p-2 text-black" onChange={handleChange} required />
        <input name="part_pays" placeholder="Pays" className="border p-2 text-black" onChange={handleChange} required />
        <input name="part_region" placeholder="Région" className="border p-2 text-black" onChange={handleChange} required />

        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Créer
        </button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreerPartenaire() {
  const [form, setForm] = useState({ part_nom: '', part_pays: '', part_region: '' })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('http://localhost:8000/api/partenaires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    router.push('/partenaires') //redirige après création
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6 text-black">Créer un partenaire</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input name="part_nom" placeholder="Nom" className="border p-2 text-black" onChange={handleChange} required />
        <input name="part_pays" placeholder="Pays" className="border p-2 text-black" onChange={handleChange} required />
        <input name="part_region" placeholder="Région" className="border p-2 text-black" onChange={handleChange} required />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Créer</button>
      </form>
    </div>
  )
}

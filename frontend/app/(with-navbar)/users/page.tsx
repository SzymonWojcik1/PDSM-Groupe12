'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
  telephone?: string
  partenaire?: {
    part_nom: string
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const fetchUsers = async () => {
    if (!token) return

    try {
      const res = await fetch('http://localhost:8000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
        const res = await fetch(`http://localhost:8000/api/users/${id}`, {

        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>

      <div className="mb-4">
        <Link href="/users/creer">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Créer un utilisateur
          </button>
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="w-full table-auto border border-gray-200 text-black">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Nom</th>
            <th className="p-2">Prénom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Téléphone</th>
            <th className="p-2">Rôle</th>
            <th className="p-2">Partenaire</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.nom}</td>
              <td className="p-2">{user.prenom}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.telephone || '-'}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">{user.partenaire?.part_nom || '-'}</td>
              <td className="p-2 flex gap-2">
                <Link href={`/users/${user.id}/update`}>
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    Modifier
                  </button>
                </Link>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-4 text-gray-500">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

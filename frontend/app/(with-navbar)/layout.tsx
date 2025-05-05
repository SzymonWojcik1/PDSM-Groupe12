'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  Home,
  Users,
  Activity,
  Folder,
  Building,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle
} from 'lucide-react'

import ProtectedRoute from '@/components/ProtectedRoute'

const navItems = [
  { name: 'Accueil', href: '/home', icon: Home },
  { name: 'Bénéficiaires', href: '/beneficiaires', icon: Users },
  { name: 'Activités', href: '/activites', icon: Activity },
  { name: 'Projets', href: '/projets', icon: Folder },
  { name: 'Partenaires', href: '/partenaires', icon: Building },
  { name: 'Cadre logique', href: '/cadre-logique', icon: ChartLine },
  { name: 'Utilisateurs', href: '/users', icon: Users },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('2fa_validated')
    router.push('/login')
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <aside
          className={`relative bg-gray-100 border-r transition-all duration-300 ${
            open ? 'w-64' : 'w-16'
          } p-4 flex flex-col justify-between`}
        >
          <div>
            <button
              onClick={() => setOpen(!open)}
              className="absolute -right-3 top-4 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-50 transition"
              aria-label="Toggle menu"
            >
              {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

            <nav className="space-y-2 mt-10">
            {navItems
              .filter(({ href }) => {
                if (href === '/users') {
                  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null
                  return role === 'siege'
                }
                return true
              })
              .map(({ name, href, icon: Icon }) => {

                const isActive = pathname.startsWith(href)
                return (
                  <Link key={href} href={href}>
                    <div
                      className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer transition 
                        ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-800'}`}
                    >
                      <Icon size={20} />
                      {open && <span>{name}</span>}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="space-y-2 mt-4">
            <Link href="/profil">
              <div
                className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer transition 
                  ${pathname === '/profil' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-800'}`}
              >
                <UserCircle size={20} />
                {open && <span>Mon profil</span>}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-2 py-2 text-red-600 hover:bg-red-50 rounded transition w-full"
            >
              <LogOut size={20} />
              {open && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}

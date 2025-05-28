'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Activity,
  Folder,
  Building,
  ChartLine,
  LogOut,
  UserCircle,
  ClipboardList,
  FileText
} from 'lucide-react'

import ProtectedRoute from '@/components/ProtectedRoute'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ChatbotWidget from '@/components/ChatbotWidget'

import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

const navItems = [
  { key: 'home', href: '/home', icon: Home },
  { key: 'beneficiariesMaj', href: '/beneficiaires', icon: Users },
  { key: 'activities', href: '/activites', icon: Activity },
  { key: 'projects', href: '/projets', icon: Folder },
  { key: 'partners', href: '/partenaires', icon: Building },
  { key: 'logframe', href: '/cadre-logique', icon: ChartLine },
  { key: 'users', href: '/users', icon: Users },
  { key: 'card_evaluations_title', href: '/evaluation', icon: ClipboardList },
  { key: 'logs', href: '/logs', icon: FileText },

]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()

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
      <div className="fixed inset-0 flex overflow-hidden">
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
                .map(({ key, href, icon: Icon }) => {
                  const isActive = pathname.startsWith(href)
                  return (
                    <Link key={href} href={href}>
                      <div
                        className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer transition 
                          ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-800'}`}
                      >
                        <Icon size={20} />
                        {open && <span>{t(key)}</span>}
                      </div>
                    </Link>
                  )
                })}
            </nav>
          </div>

          <div className="space-y-2 mt-4">
            {open && <LanguageSwitcher />}

            <Link href="/profil">
              <div
                className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer transition 
                  ${pathname === '/profil' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-800'}`}
              >
                <UserCircle size={20} />
                {open && <span>{t('profile')}</span>}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-2 py-2 text-red-600 hover:bg-red-50 rounded transition w-full"
            >
              <LogOut size={20} />
              {open && <span>{t('logout')}</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Chatbot flottant */}
      <ChatbotWidget />
    </ProtectedRoute>
  )
}
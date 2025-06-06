'use client'

import { useEffect, useState } from 'react'
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

/**
 * Navigation items configuration
 * Each item contains:
 * - key: Translation key for the menu item
 * - href: Route path
 * - icon: Lucide icon component
 */
const navItems = [
  { key: 'home', href: '/home', icon: Home },
  { key: 'beneficiariesMaj', href: '/beneficiaires', icon: Users },
  { key: 'activities', href: '/activites', icon: Activity },
  { key: 'projects', href: '/projets', icon: Folder },
  { key: 'partners', href: '/partenaires', icon: Building },
  { key: 'logframe', href: '/cadre-logique', icon: ChartLine },
  { key: 'users', href: '/users', icon: Users },
  { key: 'card_evaluations_title', href: '/evaluation', icon: ClipboardList },
  { key: 'Logs', href: '/logs', icon: FileText },
]

/**
 * Main Layout Component
 * 
 * This component provides the application's main layout structure including:
 * - Collapsible sidebar navigation
 * - Role-based menu items
 * - Language switcher
 * - User profile and logout functionality
 * - Floating chatbot widget
 * 
 * Features:
 * - Responsive sidebar that can be collapsed/expanded
 * - Dynamic menu items based on user role
 * - Active route highlighting
 * - Internationalization support
 * - Protected route wrapper
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  // State for sidebar collapse and user role
  const [open, setOpen] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()

  // Load user role from localStorage on component mount
  useEffect(() => {
    const storedRole = localStorage.getItem('role')
    setRole(storedRole)
  }, [])

  /**
   * Handles user logout process:
   * 1. Makes API call to logout endpoint
   * 2. Clears local storage
   * 3. Redirects to login page
   */
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
      console.error('Error during logout', error)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('2fa_validated')
    localStorage.removeItem('role')
    router.push('/login')
  }

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`relative bg-gray-100 border-r transition-all duration-300 ${
            open ? 'w-64' : 'w-16'
          } p-4 flex flex-col justify-between`}
        >
          <div>
            {/* Sidebar toggle button */}
            <button
              onClick={() => setOpen(!open)}
              className="absolute -right-3 top-4 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-50 transition"
              aria-label="Toggle menu"
            >
              {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* Navigation menu */}
            <nav className="space-y-2 mt-10">
              {navItems.map(({ key, href, icon: Icon }) => {
                // Filter admin-only routes
                const isAdminOnly = ['/users', '/cadre-logique', '/logs'].includes(href)
                if (isAdminOnly && role !== 'siege') return null

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

          {/* Bottom section with language switcher and user actions */}
          <div className="space-y-2 mt-4">
            {open && <LanguageSwitcher />}

            {/* Profile link */}
            <Link href="/profil">
              <div
                className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer transition 
                  ${pathname === '/profil' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-800'}`}
              >
                <UserCircle size={20} />
                {open && <span>{t('profile')}</span>}
              </div>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-2 py-2 text-red-600 hover:bg-red-50 rounded transition w-full"
            >
              <LogOut size={20} />
              {open && <span>{t('logout')}</span>}
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Floating chatbot widget */}
      <ChatbotWidget />
    </ProtectedRoute>
  )
}

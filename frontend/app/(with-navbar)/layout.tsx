'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut
} from 'lucide-react';

const navItems = [
  { name: 'Accueil', href: '/home', icon: Home },
  { name: 'Bénéficiaires', href: '/beneficiaires', icon: Users },
  { name: 'Activités', href: '/activites', icon: Activity },
  { name: 'Projets', href: '/projets', icon: Folder },
  { name: 'Partenaires', href: '/partenaires', icon: Building },
  { name: 'Cadre logique', href: '/cadre-logique', icon: ChartLine },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }

    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={`relative bg-gray-100 border-r transition-all duration-300 ${
          open ? 'w-64' : 'w-16'
        } p-4 flex flex-col justify-between`}
      >
        <div>
          {/* Toggle bouton */}
          <button
            onClick={() => setOpen(!open)}
            className="absolute -right-3 top-4 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-50 transition"
            aria-label="Toggle menu"
          >
            {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>

          <nav className="space-y-2 mt-10">
            {navItems.map(({ name, href, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
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
              );
            })}
          </nav>
        </div>

        {/* Bouton logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 py-2 mt-4 text-red-600 hover:bg-red-50 rounded transition"
        >
          <LogOut size={20} />
          {open && <span>Déconnexion</span>}
        </button>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

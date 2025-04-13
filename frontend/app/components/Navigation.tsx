'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSelector from './LanguageSelector';

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    { name: 'Activités', href: '/activites', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { name: 'Bénéficiaires', href: '/beneficiaires', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { name: 'Profil', href: '/profile', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )}
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Ne rendre la navigation que lorsque le composant est monté côté client */}
      {isMounted && (
        <>
          {/* Sidebar - Desktop */}
          <div className="hidden md:block fixed inset-y-0 left-0">
            <div className={`flex flex-col ${isMenuCollapsed ? 'w-20' : 'w-72'} h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out relative`}>
              {/* Bouton de pliage flottant */}
              <div className="absolute -right-5 top-20">
                <button
                  onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
                  className="flex items-center justify-center w-10 h-20 bg-indigo-600 text-white rounded-r-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  title={isMenuCollapsed ? "Déplier le menu" : "Plier le menu"}
                >
                  {isMenuCollapsed ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
                {!isMenuCollapsed && (
                  <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">PDSM-Groupe12</span>
                )}
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-4 py-6 space-y-4">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-700 shadow-sm'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-600'
                        } group flex items-center ${isMenuCollapsed ? 'px-2' : 'px-4'} py-3 text-sm font-medium border-l-4 rounded-lg transition-all duration-200 ease-in-out`}
                        title={item.name}
                      >
                        <div className={`${
                          isActive ? 'text-indigo-700' : 'text-gray-400 group-hover:text-indigo-600'
                        } ${isMenuCollapsed ? 'mx-auto' : 'mr-3'} transition-colors duration-200`}>
                          {item.icon}
                        </div>
                        {!isMenuCollapsed && item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              {/* Sélecteur de langue en bas de la sidebar */}
              <div className="flex items-center justify-center p-4 border-t border-gray-200">
                <LanguageSelector />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4">
              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">PDSM-Groupe12</span>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">Ouvrir le menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile menu panel */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-40 bg-white">
                <div className="pt-20 pb-6 px-4 space-y-4">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-700 shadow-sm'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                        } group flex items-center px-4 py-3 text-base font-medium border-l-4 rounded-lg transition-all duration-200 ease-in-out`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className={`${
                          isActive ? 'text-indigo-700' : 'text-gray-400 group-hover:text-indigo-600'
                        } mr-3 transition-colors duration-200`}>
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                  {/* Sélecteur de langue dans le menu mobile */}
                  <div className="px-4 py-3">
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Main content */}
      <div className={`${isMenuCollapsed ? 'md:pl-20' : 'md:pl-72'} min-h-screen w-full transition-all duration-300`}>
        <main className="h-full">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 md:py-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 
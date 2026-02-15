'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/client/dashboard', label: 'Accueil', icon: '🏠' },
    { href: '/client/new-request', label: 'Demande de crédit', icon: '📝' },
    { href: '/client/simulator', label: 'Simulateur', icon: '💰' },
    { href: '/client/loan-types', label: 'Types de crédit', icon: '🏦' },
    { href: '/client/requests', label: 'Suivi des dossiers', icon: '📄' },
    { href: '/client/profile', label: 'Mon profil', icon: '👤' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen shadow-2xl">
      <div className="p-6 border-b border-gray-800">
        <Link href="/client/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          CreditPro Tunisie
        </Link>
        <p className="text-xs text-gray-400 mt-1">Espace client</p>
      </div>
      <nav className="mt-6 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/client/requests' && pathname.startsWith('/client/request/'));
          return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-800">
        <Link href="/login" className="flex items-center text-gray-400 hover:text-red-400 transition-colors">
          <span className="mr-2">🚪</span>
          Déconnexion
        </Link>
      </div>
    </aside>
  );
}

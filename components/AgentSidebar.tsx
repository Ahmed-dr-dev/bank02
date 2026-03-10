'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AgentSidebar() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetch_unread = () =>
      fetch('/api/messages/unread', { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then((d) => setUnread(typeof d.count === 'number' ? d.count : 0))
        .catch(() => {});
    fetch_unread();
    const interval = setInterval(fetch_unread, 15000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { href: '/agent/dashboard', label: 'Tableau de bord', icon: '📊' },
    { href: '/agent/requests', label: 'Demandes', icon: '📝' },
    { href: '/agent/clients', label: 'Clients', icon: '👥' },
    { href: '/agent/messages', label: 'Messagerie', icon: '💬', badge: unread },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white min-h-screen shadow-2xl flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <Link href="/agent/dashboard" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          CreditPro
        </Link>
        <p className="text-xs text-slate-400 mt-1">Chargé de crédit</p>
      </div>
      <nav className="mt-6 px-3 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all ${
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            <span className="font-medium flex-1">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800">
        <Link href="/api/auth/logout" className="flex items-center text-slate-400 hover:text-red-400 transition-colors">
          <span className="mr-2">🚪</span>
          Déconnexion
        </Link>
      </div>
    </aside>
  );
}

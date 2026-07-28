'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type UserRole = 'superadmin' | 'admin';

interface SidebarProps {
  role: UserRole;
  tenantNome: string | null;
}

const adminLinks = [
  { href: '/dashboard', label: 'Início', icon: '⊞' },
  { href: '/eventos', label: 'Eventos', icon: '📅' },
  { href: '/membros', label: 'Membros', icon: '👥' },
  { href: '/palavras', label: 'Palavra', icon: '📖' },
  { href: '/celulas', label: 'Células', icon: '🏠' },
  { href: '/oracao', label: 'Oração', icon: '🙏' },
];

const superadminLinks = [
  { href: '/superadmin/tenants', label: 'Igrejas', icon: '⛪' },
  { href: '/superadmin/usuarios', label: 'Usuários', icon: '👤' },
];

export function Sidebar({ role, tenantNome }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <aside className="w-60 bg-stone-950 border-r border-stone-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">✦</span>
          <span className="text-white font-semibold text-sm truncate">
            {tenantNome ?? 'Inovacao Pray'}
          </span>
        </div>
        {role === 'superadmin' && (
          <span className="mt-1 inline-block text-xs text-amber-400 font-medium">SUPERADMIN</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(link.href)
                ? 'bg-amber-500/15 text-amber-400 font-medium'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <span className="text-base w-5 text-center">{link.icon}</span>
            {link.label}
          </Link>
        ))}

        {role === 'superadmin' && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-stone-600 text-xs font-medium uppercase tracking-wider">
                Superadmin
              </p>
            </div>
            {superadminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-amber-500/15 text-amber-400 font-medium'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <span className="text-base w-5 text-center">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-stone-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <span className="text-base w-5 text-center">↩</span>
          Sair
        </button>
      </div>
    </aside>
  );
}

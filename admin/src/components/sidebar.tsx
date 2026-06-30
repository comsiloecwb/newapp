'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Users, BookOpen, ClipboardList, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/palavra', label: 'Palavra da Semana', icon: BookOpen },
  { href: '/membros', label: 'Membros', icon: Users },
  { href: '/inscricoes', label: 'Inscrições', icon: ClipboardList },
];

export function Sidebar({ churchName, userName }: { churchName: string; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-56 bg-white border-r border-stone-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">✦</span>
          <div>
            <p className="text-sm font-semibold text-stone-900 leading-tight">{churchName}</p>
            <p className="text-xs text-stone-400">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-stone-100">
        <p className="text-xs text-stone-400 px-3 mb-2 truncate">{userName}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100 hover:text-stone-900 w-full transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}

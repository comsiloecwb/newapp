'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function LiderToggle({ userId, isLider }: { userId: string; isLider: boolean }) {
  const [value, setValue] = useState(isLider);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const next = !value;
    setValue(next);
    startTransition(async () => {
      await fetch('/api/membros/lider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_lider: next }),
      });
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={value ? 'Remover liderança' : 'Tornar líder'}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50 ${
        value
          ? 'bg-amber-950/40 text-amber-400 border-amber-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800'
          : 'bg-stone-800 text-stone-500 border-stone-700 hover:bg-amber-950/40 hover:text-amber-400 hover:border-amber-800'
      }`}
    >
      {value ? '★ Líder' : '+ Líder'}
    </button>
  );
}

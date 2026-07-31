'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const OPTIONS = [
  { value: 'pendente', label: 'Pendente', cls: 'bg-amber-900/40 text-amber-400 border-amber-800' },
  { value: 'pago', label: 'Pago', cls: 'bg-green-900/40 text-green-400 border-green-800' },
  { value: 'cancelado', label: 'Cancelado', cls: 'bg-red-900/40 text-red-400 border-red-800' },
] as const;

export function InscricaoStatusSelect({ inscricaoId, status }: { inscricaoId: string; status: string }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function change(next: string) {
    if (next === value) return;
    const previous = value;
    setValue(next);
    startTransition(async () => {
      const res = await fetch('/api/eventos/inscricoes/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscricao_id: inscricaoId, status: next }),
      });
      if (!res.ok) setValue(previous);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => change(e.target.value)}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border bg-transparent disabled:opacity-50 ${
        OPTIONS.find((o) => o.value === value)?.cls ?? ''
      }`}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value} className="bg-stone-900 text-white">
          {o.label}
        </option>
      ))}
    </select>
  );
}

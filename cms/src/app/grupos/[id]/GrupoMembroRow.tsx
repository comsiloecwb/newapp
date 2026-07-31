'use client';

import { useTransition } from 'react';
import { removeMembro } from '../actions';

export function GrupoMembroRow({
  grupoId,
  userId,
  nome,
  email,
  role,
}: {
  grupoId: string;
  userId: string;
  nome: string;
  email: string;
  role: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-stone-800/60 last:border-0">
      <td className="px-5 py-3 text-white font-medium">{nome}</td>
      <td className="px-5 py-3 text-stone-400">{email}</td>
      <td className="px-5 py-3">
        <span className="text-xs text-stone-500 capitalize">{role}</span>
      </td>
      <td className="px-5 py-3 text-right">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => removeMembro(grupoId, userId))}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
        >
          {isPending ? 'Removendo...' : 'Remover'}
        </button>
      </td>
    </tr>
  );
}

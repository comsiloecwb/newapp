'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deletePalavra } from './actions';

export function DeletePalavraButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm('Excluir esta palavra?')) return;
    startTransition(async () => {
      await deletePalavra(id);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-400 disabled:opacity-40 text-xs font-medium transition-colors"
    >
      {isPending ? '...' : 'Excluir'}
    </button>
  );
}

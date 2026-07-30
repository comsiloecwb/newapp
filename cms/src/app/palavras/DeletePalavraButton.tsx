'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ConfirmModal';
import { showToast } from '@/components/Toast';

export function DeletePalavraButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  async function handleConfirm() {
    setOpen(false);
    setDeleting(true);

    // Esconde a linha imediatamente (otimista)
    const row = rowRef.current?.closest('tr') as HTMLTableRowElement | null;
    if (row) {
      row.style.transition = 'opacity 0.2s';
      row.style.opacity = '0';
      setTimeout(() => { row.style.display = 'none'; }, 200);
    }

    showToast('excluido');

    await fetch(`/api/palavras/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <>
      <div ref={rowRef} className="contents">
        <button
          onClick={() => setOpen(true)}
          disabled={deleting}
          className="text-red-500 hover:text-red-400 disabled:opacity-40 text-xs font-medium transition-colors"
        >
          {deleting ? '...' : 'Excluir'}
        </button>
      </div>

      <ConfirmModal
        open={open}
        title="Excluir palavra"
        message="Tem certeza? Esta ação não pode ser desfeita e a palavra será removida do app imediatamente."
        confirmLabel="Sim, excluir"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

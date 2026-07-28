'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ApproveButtonProps {
  requestId: string;
  action: 'aprovado' | 'negado';
}

export function ApproveButton({ requestId, action }: ApproveButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    startTransition(async () => {
      await fetch('/api/membros/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action }),
      });
      router.refresh();
    });
  }

  const isApprove = action === 'aprovado';

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
        isApprove
          ? 'bg-green-950/40 text-green-400 border-green-900 hover:bg-green-900/40'
          : 'bg-red-950/40 text-red-400 border-red-900 hover:bg-red-900/40'
      }`}
    >
      {isPending ? '...' : isApprove ? 'Aprovar' : 'Negar'}
    </button>
  );
}

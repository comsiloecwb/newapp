'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Solicitacao {
  id: string;
  nome: string;
  email: string;
  created_at: string;
}

export function BulkApprovePanel({ solicitacoes }: { solicitacoes: Solicitacao[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const allSelected = selected.size === solicitacoes.length && solicitacoes.length > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(solicitacoes.map((s) => s.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulk(action: 'aprovado' | 'negado') {
    const ids = Array.from(selected);
    startTransition(async () => {
      await Promise.all(
        ids.map((id) =>
          fetch('/api/membros/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: id, action }),
          })
        )
      );
      setSelected(new Set());
      router.refresh();
    });
  }

  if (solicitacoes.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-semibold">
          Solicitações pendentes
          <span className="ml-2 text-xs font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full">
            {solicitacoes.length}
          </span>
        </h2>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-sm">{selected.size} selecionado(s)</span>
            <button
              onClick={() => handleBulk('aprovado')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-950/40 text-green-400 border border-green-900 hover:bg-green-900/40 transition-colors disabled:opacity-50"
            >
              Aprovar todos
            </button>
            <button
              onClick={() => handleBulk('negado')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-900 hover:bg-red-900/40 transition-colors disabled:opacity-50"
            >
              Negar todos
            </button>
          </div>
        )}
      </div>

      <div className="bg-stone-800/40 border border-amber-900/40 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-700">
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-stone-600 bg-stone-800 accent-amber-500 cursor-pointer"
                />
              </th>
              <th className="text-left text-stone-400 font-medium px-4 py-4">Nome</th>
              <th className="text-left text-stone-400 font-medium px-4 py-4">E-mail</th>
              <th className="text-left text-stone-400 font-medium px-4 py-4">Data</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {solicitacoes.map((s) => (
              <tr key={s.id} className="border-b border-stone-700/50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleOne(s.id)}
                    className="rounded border-stone-600 bg-stone-800 accent-amber-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-4 text-white font-medium">{s.nome}</td>
                <td className="px-4 py-4 text-stone-400">{s.email}</td>
                <td className="px-4 py-4 text-stone-500">
                  {new Date(s.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setSelected(new Set([s.id]));
                        setTimeout(() => handleBulk('aprovado'), 0);
                      }}
                      disabled={isPending}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-green-950/40 text-green-400 border-green-900 hover:bg-green-900/40 transition-colors disabled:opacity-50"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => {
                        setSelected(new Set([s.id]));
                        setTimeout(() => handleBulk('negado'), 0);
                      }}
                      disabled={isPending}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-red-950/40 text-red-400 border-red-900 hover:bg-red-900/40 transition-colors disabled:opacity-50"
                    >
                      Negar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

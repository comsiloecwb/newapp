'use client';

import { useState, useTransition } from 'react';
import { addMembro } from '../actions';

type User = { id: string; nome: string; email: string; role: string };

export function AddMembroForm({ grupoId, disponiveis }: { grupoId: string; disponiveis: User[] }) {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = disponiveis.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
      <h2 className="text-white font-semibold mb-4">Adicionar membro</h2>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome ou e-mail..."
        className="w-full bg-stone-800 border border-stone-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors mb-3"
      />
      {search.length > 0 && (
        <div className="space-y-1 max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-stone-500 text-sm py-2 text-center">Nenhum resultado.</p>
          ) : (
            filtered.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <div>
                  <p className="text-white text-sm font-medium">{u.nome}</p>
                  <p className="text-stone-500 text-xs">{u.email}</p>
                </div>
                <button
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => addMembro(grupoId, u.id));
                    setSearch('');
                  }}
                  className="text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors"
                >
                  + Adicionar
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

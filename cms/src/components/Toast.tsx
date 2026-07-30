'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const MESSAGES: Record<string, { text: string; type: 'success' | 'error' }> = {
  criado: { text: 'Criado com sucesso!', type: 'success' },
  atualizado: { text: 'Salvo com sucesso!', type: 'success' },
  excluido: { text: 'Excluído com sucesso!', type: 'success' },
  erro: { text: 'Ocorreu um erro. Tente novamente.', type: 'error' },
};

export function Toast() {
  const params = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const key = params.get('toast');
    if (key && MESSAGES[key]) {
      setMsg(MESSAGES[key]);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3500);
      return () => clearTimeout(t);
    }
  }, [params]);

  if (!visible || !msg) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 ${
        msg.type === 'success'
          ? 'bg-green-950 border border-green-800 text-green-300'
          : 'bg-red-950 border border-red-800 text-red-300'
      }`}
    >
      <span>{msg.type === 'success' ? '✓' : '✕'}</span>
      {msg.text}
      <button onClick={() => setVisible(false)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

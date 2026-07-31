'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const DURATION = 3500;

const MESSAGES: Record<string, { text: string; type: 'success' | 'error' }> = {
  criado:     { text: 'Criado com sucesso!',             type: 'success' },
  atualizado: { text: 'Salvo com sucesso!',              type: 'success' },
  excluido:   { text: 'Excluído com sucesso!',           type: 'success' },
  erro:       { text: 'Ocorreu um erro. Tente novamente.', type: 'error' },
};

interface ToastState {
  text: string;
  type: 'success' | 'error';
  id: number;
}

let nextId = 1;

export function showToast(key: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cms-toast', { detail: { key } }));
}

export function Toast() {
  const params = useSearchParams();
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((key: string) => {
    const msg = MESSAGES[key];
    if (!msg) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ ...msg, id: nextId++ });
    timerRef.current = setTimeout(() => setToast(null), DURATION);
  }, []);

  // URL param (server action redirects)
  useEffect(() => {
    const key = params.get('toast');
    if (key) show(key);
  }, [params, show]);

  // Programmatic (optimistic client deletes)
  useEffect(() => {
    function handler(e: Event) {
      show((e as CustomEvent<{ key: string }>).detail.key);
    }
    window.addEventListener('cms-toast', handler);
    return () => window.removeEventListener('cms-toast', handler);
  }, [show]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      key={toast.id}
      style={{ animation: 'toast-in 0.25s ease both' }}
      className={`fixed bottom-6 right-6 z-50 overflow-hidden rounded-xl shadow-2xl min-w-[220px] max-w-xs ${
        isSuccess
          ? 'bg-stone-900 border border-stone-700'
          : 'bg-red-950 border border-red-800'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span
          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
            isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isSuccess ? '✓' : '✕'}
        </span>
        <p className={`flex-1 text-sm font-medium ${isSuccess ? 'text-white' : 'text-red-300'}`}>
          {toast.text}
        </p>
        <button
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setToast(null);
          }}
          className="text-stone-500 hover:text-stone-300 text-xs ml-1 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* barra de progresso */}
      <div
        key={`bar-${toast.id}`}
        style={{
          animation: `toast-shrink ${DURATION}ms linear forwards`,
          height: '3px',
          width: '100%',
          transformOrigin: 'left',
        }}
        className={isSuccess ? 'bg-green-500' : 'bg-red-500'}
      />
    </div>
  );
}

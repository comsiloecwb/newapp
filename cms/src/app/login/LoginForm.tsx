'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface LoginFormProps {
  nome: string;
  logoUrl: string | null;
  primaryColor: string;
}

export function LoginForm({ nome, logoUrl, primaryColor }: LoginFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    params.get('error') === 'unauthorized' ? 'Você não tem permissão de acesso ao painel.' : ''
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-10">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={nome}
              width={64}
              height={64}
              className="mx-auto rounded-xl object-contain mb-3"
            />
          ) : (
            <span style={{ color: primaryColor }} className="text-3xl">✦</span>
          )}
          <h1 className="text-white text-2xl font-semibold mt-2 font-serif">{nome}</h1>
          <p className="text-stone-400 text-sm mt-1">Painel de administração</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              className="w-full bg-stone-900 border border-stone-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-current transition-colors"
              onFocus={(e) => (e.target.style.borderColor = primaryColor)}
              onBlur={(e) => (e.target.style.borderColor = '')}
              placeholder="admin@suaigreja.com"
            />
          </div>

          <div>
            <label className="block text-stone-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors"
              onFocus={(e) => (e.target.style.borderColor = primaryColor)}
              onBlur={(e) => (e.target.style.borderColor = '')}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: primaryColor }}
            className="w-full disabled:opacity-50 text-stone-950 font-semibold rounded-lg px-4 py-3 text-sm transition-opacity hover:opacity-90"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-stone-600 text-xs text-center mt-8">
          Apenas administradores têm acesso a este painel.
        </p>
      </div>
    </div>
  );
}

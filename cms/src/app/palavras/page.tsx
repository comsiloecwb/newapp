import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DeletePalavraButton } from './DeletePalavraButton';

export default async function PalavrasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile) redirect('/login');

  const { data: palavras } = await supabase
    .from('palavras')
    .select('id, titulo, pregador, versiculo, data, published, created_at')
    .eq('tenant_id', profile.tenant_id)
    .order('data', { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Palavras</h1>
          <p className="text-stone-400 text-sm mt-1">Mensagens e sermões da igreja</p>
        </div>
        <Link
          href="/palavras/nova"
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nova palavra
        </Link>
      </div>

      <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-700">
              <th className="text-left text-stone-400 font-medium px-6 py-4">Título</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Pregador</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Versículo</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Data</th>
              <th className="text-left text-stone-400 font-medium px-6 py-4">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {(palavras ?? []).map((p) => (
              <tr key={p.id} className="border-b border-stone-700/50 hover:bg-stone-700/20 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{p.titulo}</td>
                <td className="px-6 py-4 text-stone-400">{p.pregador ?? '—'}</td>
                <td className="px-6 py-4 text-stone-400">{p.versiculo ?? '—'}</td>
                <td className="px-6 py-4 text-stone-400">
                  {new Date(p.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                  {p.published ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border text-green-400 bg-green-950/40 border-green-900">
                      Publicado
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border text-stone-400 bg-stone-900 border-stone-700">
                      Rascunho
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 justify-end">
                    <Link
                      href={`/palavras/${p.id}`}
                      className="text-stone-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Editar →
                    </Link>
                    <DeletePalavraButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!palavras || palavras.length === 0) && (
          <div className="text-center py-16 text-stone-500">
            Nenhuma palavra cadastrada.{' '}
            <Link href="/palavras/nova" className="text-amber-500 hover:text-amber-400">
              Criar primeira
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

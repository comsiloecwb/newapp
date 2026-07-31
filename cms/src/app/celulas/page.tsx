import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Toast } from '@/components/Toast';

export default async function CelulasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users').select('role, tenant_id').eq('id', user.id).single();
  if (!profile || !['admin', 'superadmin'].includes(profile.role)) redirect('/login');

  const db = createAdminClient();
  const { data: celulas } = await db
    .from('celulas')
    .select('id, nome, bairro, dia_semana, horario, membros_celula(count)')
    .eq('tenant_id', profile.tenant_id)
    .order('nome');

  const DIAS: Record<string, string> = {
    segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta',
    quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo',
  };

  return (
    <div className="p-8">
      <Toast />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Células</h1>
          <p className="text-stone-400 text-sm mt-1">{celulas?.length ?? 0} células cadastradas</p>
        </div>
        <Link
          href="/celulas/novo"
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nova célula
        </Link>
      </div>

      {(!celulas || celulas.length === 0) ? (
        <div className="bg-stone-800/40 border border-stone-700 rounded-xl p-16 text-center">
          <p className="text-stone-400 mb-2">Nenhuma célula cadastrada ainda.</p>
          <Link href="/celulas/novo" className="text-amber-400 hover:underline text-sm">
            Criar primeira célula
          </Link>
        </div>
      ) : (
        <div className="bg-stone-800/40 border border-stone-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="text-left text-stone-400 font-medium px-6 py-4">Nome</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Bairro</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Dia / Horário</th>
                <th className="text-left text-stone-400 font-medium px-6 py-4">Membros</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {celulas.map((c) => {
                const count = (c.membros_celula as unknown as { count: number }[])?.[0]?.count ?? 0;
                const dia = c.dia_semana ? (DIAS[c.dia_semana] ?? c.dia_semana) : '—';
                return (
                  <tr key={c.id} className="border-b border-stone-700/50 hover:bg-stone-700/20 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{c.nome}</td>
                    <td className="px-6 py-4 text-stone-400">{c.bairro ?? '—'}</td>
                    <td className="px-6 py-4 text-stone-400">{dia}{c.horario ? ` · ${c.horario}` : ''}</td>
                    <td className="px-6 py-4 text-stone-400">{count}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/celulas/${c.id}`}
                        className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
                      >
                        Gerenciar →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

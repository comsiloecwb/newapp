import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { MemberRoleSelect } from './member-role-select';

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', editor: 'Editor', member: 'Membro' };

export default async function MembrosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('church_id, role').eq('id', user!.id).single();

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .eq('church_id', profile!.church_id)
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Membros</h1>
        <p className="text-sm text-stone-500 mt-1">{members?.length ?? 0} membros cadastrados</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Nome</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">E-mail</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Telefone</th>
              <th className="text-left px-4 py-3 text-stone-500 font-medium">Papel</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member) => (
              <tr key={member.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">{member.name}</td>
                <td className="px-4 py-3 text-stone-600">{member.email}</td>
                <td className="px-4 py-3 text-stone-600">{member.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  {member.id === user!.id ? (
                    <Badge className="bg-stone-900 text-white hover:bg-stone-900">{ROLE_LABEL[member.role]}</Badge>
                  ) : (
                    <MemberRoleSelect memberId={member.id} currentRole={member.role} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!members?.length && (
          <div className="text-center py-12 text-stone-400">Nenhum membro cadastrado</div>
        )}
      </div>
    </div>
  );
}

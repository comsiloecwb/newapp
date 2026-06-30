'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MemberRoleSelect({ memberId, currentRole }: { memberId: string; currentRole: string }) {
  const router = useRouter();

  async function handleChange(role: string | null) {
    if (!role) return;
    const supabase = createClient();
    await supabase.from('profiles').update({ role }).eq('id', memberId);
    router.refresh();
  }

  return (
    <Select defaultValue={currentRole} onValueChange={handleChange}>
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="member">Membro</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}

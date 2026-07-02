import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { StudyGroup, GroupDayCompletion } from '@/types/database';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const MOCK_GROUPS: StudyGroup[] = [
  { id: 'g-mock-1', church_id: null, created_by: 'mock', name: 'Grupo Família', description: 'Devocional em família', invite_code: 'FAM001', created_at: new Date().toISOString() },
];

// ── My groups ─────────────────────────────────────────────────────────────────

export function useMyGroups() {
  const userId = useAuthStore((s) => s.profile?.id);
  return useQuery({
    queryKey: ['my-groups', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<StudyGroup[]> => {
      if (!isSupabaseConfigured) return MOCK_GROUPS;
      const { data, error } = await supabase
        .from('study_group_members')
        .select('study_groups(*)')
        .eq('user_id', userId!);
      if (error) throw error;
      return (data ?? []).map((r: any) => r.study_groups as StudyGroup);
    },
  });
}

// ── Single group ──────────────────────────────────────────────────────────────

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    enabled: Boolean(groupId),
    queryFn: async (): Promise<StudyGroup | null> => {
      if (!isSupabaseConfigured) return MOCK_GROUPS.find((g) => g.id === groupId) ?? null;
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupId)
        .single();
      if (error) return null;
      return data as StudyGroup;
    },
  });
}

// ── Group members with names ──────────────────────────────────────────────────

export type GroupMemberWithProfile = { user_id: string; name: string; joined_at: string };

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['group-members', groupId],
    enabled: Boolean(groupId),
    queryFn: async (): Promise<GroupMemberWithProfile[]> => {
      if (!isSupabaseConfigured) return [{ user_id: 'mock', name: 'Você (preview)', joined_at: new Date().toISOString() }];
      const { data, error } = await supabase
        .from('study_group_members')
        .select('user_id, joined_at, profiles(name)')
        .eq('group_id', groupId);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        user_id: r.user_id,
        name: r.profiles?.name ?? 'Membro',
        joined_at: r.joined_at,
      }));
    },
  });
}

// ── Day completions for a group ───────────────────────────────────────────────

export function useGroupDayCompletions(groupId: string, dayNumber: number) {
  return useQuery({
    queryKey: ['group-day-completions', groupId, dayNumber],
    enabled: Boolean(groupId && dayNumber),
    queryFn: async (): Promise<GroupDayCompletion[]> => {
      if (!isSupabaseConfigured) return [];
      const { data, error } = await supabase
        .from('group_day_completions')
        .select('*')
        .eq('group_id', groupId)
        .eq('day_number', dayNumber);
      if (error) throw error;
      return (data ?? []) as GroupDayCompletion[];
    },
  });
}

// ── Create group ──────────────────────────────────────────────────────────────

export function useCreateGroup() {
  const qc = useQueryClient();
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }): Promise<StudyGroup> => {
      if (!profile) throw new Error('Não autenticado');
      if (!isSupabaseConfigured) {
        return { id: 'new-mock', church_id: null, created_by: profile.id, name, description: description ?? null, invite_code: generateInviteCode(), created_at: new Date().toISOString() };
      }
      const invite_code = generateInviteCode();
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .insert({ church_id: profile.church_id, created_by: profile.id, name, description: description || null, invite_code })
        .select()
        .single();
      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert({ group_id: group.id, user_id: profile.id });
      if (memberError) throw memberError;

      return group as StudyGroup;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-groups'] }),
  });
}

// ── Join group by invite code ─────────────────────────────────────────────────

export function useJoinGroup() {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.profile?.id);

  return useMutation({
    mutationFn: async (inviteCode: string): Promise<StudyGroup> => {
      if (!userId) throw new Error('Não autenticado');
      if (!isSupabaseConfigured) throw new Error('Supabase não configurado');

      const { data: group, error: findError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();
      if (findError || !group) throw new Error('Código inválido ou grupo não encontrado');

      const { error: joinError } = await supabase
        .from('study_group_members')
        .insert({ group_id: group.id, user_id: userId });
      if (joinError && joinError.code !== '23505') throw joinError; // ignore duplicate

      return group as StudyGroup;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-groups'] }),
  });
}

// ── Mark day as done in group ─────────────────────────────────────────────────

export function useMarkGroupDay(groupId: string) {
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.profile?.id);

  return useMutation({
    mutationFn: async (dayNumber: number) => {
      if (!userId || !isSupabaseConfigured) return;
      const { error } = await supabase
        .from('group_day_completions')
        .upsert({ group_id: groupId, user_id: userId, day_number: dayNumber }, { onConflict: 'group_id,user_id,day_number' });
      if (error) throw error;
    },
    onSuccess: (_, dayNumber) => {
      qc.invalidateQueries({ queryKey: ['group-day-completions', groupId, dayNumber] });
    },
  });
}

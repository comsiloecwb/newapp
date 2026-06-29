import { create } from 'zustand';

import type { Church, Profile } from '@/types/database';

interface AuthState {
  profile: Profile | null;
  church: Church | null;
  setSession: (profile: Profile | null, church: Church | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  church: null,
  setSession: (profile, church) => set({ profile, church }),
  clear: () => set({ profile: null, church: null }),
}));

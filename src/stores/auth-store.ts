import { create } from 'zustand';

import type { Tenant, User } from '@/types/database';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  // aliases para compatibilidade com código antigo
  profile: User | null;
  church: Tenant | null;
  setSession: (user: User | null, tenant: Tenant | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  profile: null,
  church: null,
  setSession: (user, tenant) => set({ user, tenant, profile: user, church: tenant }),
  clear: () => set({ user: null, tenant: null, profile: null, church: null }),
}));

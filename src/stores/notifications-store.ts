import { create } from 'zustand';

interface NotificationsState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrement: () => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrement: () => set({ unreadCount: Math.max(0, get().unreadCount - 1) }),
  reset: () => set({ unreadCount: 0 }),
}));

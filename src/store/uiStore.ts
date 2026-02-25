import { create } from 'zustand';

interface UIState {
  inboxBadgeCount: number;
  isOfflineBannerVisible: boolean;

  setInboxBadgeCount: (count: number) => void;
  showOfflineBanner: () => void;
  hideOfflineBanner: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  inboxBadgeCount: 0,
  isOfflineBannerVisible: false,

  setInboxBadgeCount: (count) => set({ inboxBadgeCount: count }),
  showOfflineBanner: () => set({ isOfflineBannerVisible: true }),
  hideOfflineBanner: () => set({ isOfflineBannerVisible: false }),
}));

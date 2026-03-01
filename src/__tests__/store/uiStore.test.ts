import { useUIStore } from '@/store/uiStore';

beforeEach(() => {
  useUIStore.setState({
    inboxBadgeCount: 0,
    isOfflineBannerVisible: false,
  });
});

describe('uiStore', () => {
  it('starts with inboxBadgeCount 0 and offline banner hidden', () => {
    const state = useUIStore.getState();
    expect(state.inboxBadgeCount).toBe(0);
    expect(state.isOfflineBannerVisible).toBe(false);
  });

  it('setInboxBadgeCount updates the badge count', () => {
    useUIStore.getState().setInboxBadgeCount(5);
    expect(useUIStore.getState().inboxBadgeCount).toBe(5);
  });

  it('showOfflineBanner sets isOfflineBannerVisible to true', () => {
    useUIStore.getState().showOfflineBanner();
    expect(useUIStore.getState().isOfflineBannerVisible).toBe(true);
  });

  it('hideOfflineBanner sets isOfflineBannerVisible back to false', () => {
    useUIStore.getState().showOfflineBanner();
    useUIStore.getState().hideOfflineBanner();
    expect(useUIStore.getState().isOfflineBannerVisible).toBe(false);
  });
});

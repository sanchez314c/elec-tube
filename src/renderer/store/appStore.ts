import { create } from 'zustand';
import type { VideoItem, PlaylistItem, SubscriptionItem } from '../types/electron';

type ViewMode = 'trending' | 'search' | 'playlist' | 'playlists' | 'subscriptions' | 'liked' | 'history';

// Age filter presets in days
export const AGE_FILTER_OPTIONS = [
  { label: 'Today', value: 1 },
  { label: 'Last 3 days', value: 3 },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 },
  { label: 'All time', value: 0 },
] as const;

// Helper to filter videos by age
function filterByAge(videos: VideoItem[], maxAgeDays: number): VideoItem[] {
  if (!videos || !Array.isArray(videos)) return [];
  if (maxAgeDays <= 0) return videos; // 0 = no filter
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
  return videos.filter(v => new Date(v.publishedAt) >= cutoffDate);
}

// Helper to dedupe videos by ID
function dedupeVideos(videos: VideoItem[]): VideoItem[] {
  if (!videos || !Array.isArray(videos)) return [];
  const seen = new Set<string>();
  return videos.filter(v => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

interface AppState {
  // View state
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;

  // Videos
  videos: VideoItem[];
  setVideos: (videos: VideoItem[]) => void;
  isLoadingVideos: boolean;
  setIsLoadingVideos: (loading: boolean) => void;

  // Pagination
  nextPageToken: string | undefined;
  hasMore: boolean;
  isLoadingMore: boolean;

  // Playlists
  playlists: PlaylistItem[];
  setPlaylists: (playlists: PlaylistItem[]) => void;
  selectedPlaylist: PlaylistItem | null;
  setSelectedPlaylist: (playlist: PlaylistItem | null) => void;
  isLoadingPlaylists: boolean;
  setIsLoadingPlaylists: (loading: boolean) => void;

  // Subscriptions
  subscriptions: SubscriptionItem[];
  setSubscriptions: (subscriptions: SubscriptionItem[]) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Auth
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Filter settings
  maxAgeDays: number;
  setMaxAgeDays: (days: number) => void;

  // Actions
  fetchTrending: () => Promise<void>;
  fetchPlaylists: () => Promise<void>;
  fetchPlaylistVideos: (playlistId: string) => Promise<void>;
  searchVideos: (query: string) => Promise<void>;
  playVideo: (videoId: string) => Promise<void>;
  fetchSubscriptionFeed: () => Promise<void>;
  fetchLikedVideos: () => Promise<void>;
  fetchWatchHistory: () => Promise<void>;
  refreshCurrentView: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // View state
  currentView: 'trending',
  setCurrentView: (view) => set({ currentView: view }),

  // Videos
  videos: [],
  setVideos: (videos) => set({ videos }),
  isLoadingVideos: false,
  setIsLoadingVideos: (loading) => set({ isLoadingVideos: loading }),

  // Pagination
  nextPageToken: undefined,
  hasMore: false,
  isLoadingMore: false,

  // Playlists
  playlists: [],
  setPlaylists: (playlists) => set({ playlists }),
  selectedPlaylist: null,
  setSelectedPlaylist: (playlist) => set({ selectedPlaylist: playlist }),
  isLoadingPlaylists: false,
  setIsLoadingPlaylists: (loading) => set({ isLoadingPlaylists: loading }),

  // Subscriptions
  subscriptions: [],
  setSubscriptions: (subscriptions) => set({ subscriptions }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Auth
  isAuthenticated: false,
  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),

  // Error
  error: null,
  setError: (error) => set({ error }),

  // Filter settings
  maxAgeDays: 14, // Default to last 14 days
  setMaxAgeDays: (days) => set({ maxAgeDays: days }),

  // Actions
  fetchTrending: async () => {
    set({ isLoadingVideos: true, error: null, videos: [], nextPageToken: undefined, hasMore: false });
    try {
      const result = await window.electube.youtube.getTrending();
      // Handle both old (array) and new (paginated) response formats
      const videos = Array.isArray(result) ? result : (result?.videos || []);
      const nextPageToken = Array.isArray(result) ? undefined : result?.nextPageToken;
      const hasMore = Array.isArray(result) ? false : (result?.hasMore || false);
      set({
        videos,
        currentView: 'trending',
        nextPageToken,
        hasMore,
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoadingVideos: false });
    }
  },

  fetchPlaylists: async () => {
    set({ isLoadingPlaylists: true, error: null });
    try {
      const playlists = await window.electube.youtube.getPlaylists();
      set({ playlists, currentView: 'playlists', hasMore: false });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoadingPlaylists: false });
    }
  },

  fetchPlaylistVideos: async (playlistId: string) => {
    set({ isLoadingVideos: true, error: null, videos: [] });
    try {
      const videos = await window.electube.youtube.getPlaylistItems(playlistId);
      const playlist = get().playlists.find((p) => p.id === playlistId);
      set({ videos, currentView: 'playlist', selectedPlaylist: playlist || null, hasMore: false });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoadingVideos: false });
    }
  },

  searchVideos: async (query: string) => {
    if (!query.trim()) return;
    set({ isLoadingVideos: true, error: null, searchQuery: query, videos: [] });
    try {
      const videos = await window.electube.youtube.search(query);
      set({ videos, currentView: 'search', hasMore: false });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoadingVideos: false });
    }
  },

  playVideo: async (videoId: string) => {
    try {
      await window.electube.player.play(videoId);
    } catch (error) {
      console.error('Playback failed, trying browser fallback:', error);
      await window.electube.player.openInBrowser(videoId);
    }
  },

  fetchSubscriptionFeed: async () => {
    set({ isLoadingVideos: true, error: null, videos: [], nextPageToken: undefined, hasMore: false });
    try {
      // Pass 'refresh' to reset the subscription cache
      const result = await window.electube.youtube.getSubscriptionFeed('refresh');
      // Handle both old (array) and new (paginated) response formats
      const rawVideos = Array.isArray(result) ? result : (result?.videos || []);
      const { maxAgeDays } = get();
      const filteredVideos = filterByAge(rawVideos, maxAgeDays);
      set({
        videos: filteredVideos,
        currentView: 'subscriptions',
        nextPageToken: Array.isArray(result) ? undefined : result?.nextPageToken,
        hasMore: Array.isArray(result) ? false : (result?.hasMore || false),
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoadingVideos: false });
    }
  },

  fetchLikedVideos: async () => {
    set({ isLoadingVideos: true, error: null, videos: [], nextPageToken: undefined, hasMore: false });
    try {
      const result = await window.electube.youtube.getLikedVideos();
      // Handle both old (array) and new (paginated) response formats
      const videos = Array.isArray(result) ? result : (result?.videos || []);
      set({
        videos,
        currentView: 'liked',
        nextPageToken: Array.isArray(result) ? undefined : result?.nextPageToken,
        hasMore: Array.isArray(result) ? false : (result?.hasMore || false),
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoadingVideos: false });
    }
  },

  fetchWatchHistory: async () => {
    set({ isLoadingVideos: true, error: null, videos: [], nextPageToken: undefined, hasMore: false });
    try {
      const result = await window.electube.youtube.getWatchHistory();
      // Handle both old (array) and new (paginated) response formats
      const videos = Array.isArray(result) ? result : (result?.videos || []);
      set({
        videos,
        currentView: 'history',
        nextPageToken: Array.isArray(result) ? undefined : result?.nextPageToken,
        hasMore: Array.isArray(result) ? false : (result?.hasMore || false),
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoadingVideos: false });
    }
  },

  refreshCurrentView: async () => {
    const { currentView, fetchTrending, fetchSubscriptionFeed, fetchLikedVideos, fetchWatchHistory, fetchPlaylists, selectedPlaylist, fetchPlaylistVideos } = get();
    switch (currentView) {
      case 'trending':
        await fetchTrending();
        break;
      case 'subscriptions':
        await fetchSubscriptionFeed();
        break;
      case 'liked':
        await fetchLikedVideos();
        break;
      case 'history':
        await fetchWatchHistory();
        break;
      case 'playlists':
        await fetchPlaylists();
        break;
      case 'playlist':
        if (selectedPlaylist) await fetchPlaylistVideos(selectedPlaylist.id);
        break;
    }
  },

  loadMore: async () => {
    const { currentView, nextPageToken, hasMore, isLoadingMore, isLoadingVideos, videos, maxAgeDays } = get();

    // Don't load if already loading or no more pages
    if (isLoadingMore || isLoadingVideos || !hasMore || !nextPageToken) return;

    set({ isLoadingMore: true });
    try {
      let result;
      switch (currentView) {
        case 'trending':
          result = await window.electube.youtube.getTrending(nextPageToken);
          break;
        case 'subscriptions':
          result = await window.electube.youtube.getSubscriptionFeed(nextPageToken);
          break;
        case 'liked':
          result = await window.electube.youtube.getLikedVideos(nextPageToken);
          break;
        case 'history':
          result = await window.electube.youtube.getWatchHistory(nextPageToken);
          break;
        default:
          return;
      }

      // Handle both old (array) and new (paginated) response formats
      let newBatchVideos = Array.isArray(result) ? result : (result?.videos || []);

      // Apply age filter to subscriptions
      if (currentView === 'subscriptions') {
        newBatchVideos = filterByAge(newBatchVideos, maxAgeDays);
      }

      // Append and dedupe
      const newVideos = dedupeVideos([...videos, ...newBatchVideos]);
      set({
        videos: newVideos,
        nextPageToken: Array.isArray(result) ? undefined : result?.nextPageToken,
        hasMore: Array.isArray(result) ? false : (result?.hasMore || false),
      });
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      set({ isLoadingMore: false });
    }
  },
}));

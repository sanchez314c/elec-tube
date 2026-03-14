export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailHigh: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount: string;
}

export interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  channelTitle: string;
  publishedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface SubscriptionItem {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
}

export interface PaginatedVideos {
  videos: VideoItem[];
  nextPageToken?: string;
  hasMore: boolean;
}

export interface ElecTubeAPI {
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };
  youtube: {
    getPlaylists: () => Promise<PlaylistItem[]>;
    getPlaylistItems: (playlistId: string) => Promise<VideoItem[]>;
    search: (query: string) => Promise<VideoItem[]>;
    getVideoDetails: (videoId: string) => Promise<VideoItem | null>;
    getTrending: (pageToken?: string) => Promise<PaginatedVideos>;
    getSubscriptions: () => Promise<SubscriptionItem[]>;
    getSubscriptionFeed: (pageToken?: string) => Promise<PaginatedVideos>;
    getLikedVideos: (pageToken?: string) => Promise<PaginatedVideos>;
    getWatchHistory: (pageToken?: string) => Promise<PaginatedVideos>;
  };
  player: {
    play: (videoId: string) => Promise<{ success: boolean }>;
    openInBrowser: (videoId: string) => Promise<{ success: boolean }>;
  };
  store: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  auth: {
    login: () => Promise<{ success: boolean }>;
    logout: () => Promise<{ success: boolean }>;
    getProfile: () => Promise<UserProfile | null>;
    isLoggedIn: () => Promise<boolean>;
    isConfigured: () => Promise<boolean>;
  };
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electube: ElecTubeAPI;
  }
}

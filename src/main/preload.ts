import { contextBridge, ipcRenderer } from 'electron';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface ElecTubeAPI {
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };
  youtube: {
    getPlaylists: () => Promise<unknown>;
    getPlaylistItems: (playlistId: string) => Promise<unknown>;
    search: (query: string) => Promise<unknown>;
    getVideoDetails: (videoId: string) => Promise<unknown>;
    getTrending: (pageToken?: string) => Promise<unknown>;
    getSubscriptions: () => Promise<unknown>;
    getSubscriptionFeed: (pageToken?: string) => Promise<unknown>;
    getLikedVideos: (pageToken?: string) => Promise<unknown>;
    getWatchHistory: (pageToken?: string) => Promise<unknown>;
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

const api: ElecTubeAPI = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  youtube: {
    getPlaylists: () => ipcRenderer.invoke('youtube:getPlaylists'),
    getPlaylistItems: (playlistId: string) => ipcRenderer.invoke('youtube:getPlaylistItems', playlistId),
    search: (query: string) => ipcRenderer.invoke('youtube:search', query),
    getVideoDetails: (videoId: string) => ipcRenderer.invoke('youtube:getVideoDetails', videoId),
    getTrending: (pageToken?: string) => ipcRenderer.invoke('youtube:getTrending', pageToken),
    getSubscriptions: () => ipcRenderer.invoke('youtube:getSubscriptions'),
    getSubscriptionFeed: (pageToken?: string) => ipcRenderer.invoke('youtube:getSubscriptionFeed', pageToken),
    getLikedVideos: (pageToken?: string) => ipcRenderer.invoke('youtube:getLikedVideos', pageToken),
    getWatchHistory: (pageToken?: string) => ipcRenderer.invoke('youtube:getWatchHistory', pageToken),
  },
  player: {
    play: (videoId: string) => ipcRenderer.invoke('player:play', videoId),
    openInBrowser: (videoId: string) => ipcRenderer.invoke('player:openInBrowser', videoId),
  },
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
  auth: {
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getProfile: () => ipcRenderer.invoke('auth:getProfile'),
    isLoggedIn: () => ipcRenderer.invoke('auth:isLoggedIn'),
    isConfigured: () => ipcRenderer.invoke('auth:isConfigured'),
  },
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
};

contextBridge.exposeInMainWorld('electube', api);

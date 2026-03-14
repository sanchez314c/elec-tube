import { google, youtube_v3 } from 'googleapis';

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

export class YouTubeAPI {
  private youtube: youtube_v3.Youtube;
  private accessToken: string | null = null;
  // Cache for subscription feed pagination
  private subscriptionPlaylistIds: string[] = [];
  private subscriptionVideosCache: VideoItem[] = [];

  constructor(apiKey: string) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    this.youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });
  }

  async getMyPlaylists(): Promise<PlaylistItem[]> {
    try {
      const response = await this.youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50,
      });

      return (response.data.items || []).map((item) => ({
        id: item.id || '',
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
        itemCount: item.contentDetails?.itemCount || 0,
        channelTitle: item.snippet?.channelTitle || '',
        publishedAt: item.snippet?.publishedAt || '',
      }));
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 401) {
        throw new Error('Authentication required. Please sign in with your YouTube account.');
      }
      throw error;
    }
  }

  async getPlaylistItems(playlistId: string, maxResults = 50): Promise<VideoItem[]> {
    const result = await this.getPlaylistItemsPaginated(playlistId, maxResults);
    return result.videos;
  }

  async getPlaylistItemsPaginated(playlistId: string, maxResults = 50, pageToken?: string): Promise<PaginatedVideos> {
    const response = await this.youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId,
      maxResults,
      pageToken,
    });

    const videoIds = (response.data.items || [])
      .map((item) => item.contentDetails?.videoId)
      .filter((id): id is string => !!id);

    if (videoIds.length === 0) {
      return { videos: [], hasMore: false };
    }

    const videoDetails = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds,
    });

    const videos = (videoDetails.data.items || []).map((item) => ({
      id: item.id || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      thumbnailHigh: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      channelId: item.snippet?.channelId || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
      duration: this.parseDuration(item.contentDetails?.duration || ''),
      viewCount: this.formatViewCount(item.statistics?.viewCount || '0'),
      likeCount: item.statistics?.likeCount || '0',
    }));

    return {
      videos,
      nextPageToken: response.data.nextPageToken || undefined,
      hasMore: !!response.data.nextPageToken,
    };
  }

  async search(query: string, maxResults = 25): Promise<VideoItem[]> {
    const response = await this.youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults,
      order: 'relevance',
    });

    const videoIds = (response.data.items || [])
      .map((item) => item.id?.videoId)
      .filter((id): id is string => !!id);

    if (videoIds.length === 0) return [];

    const videoDetails = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds,
    });

    return (videoDetails.data.items || []).map((item) => ({
      id: item.id || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      thumbnailHigh: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      channelId: item.snippet?.channelId || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
      duration: this.parseDuration(item.contentDetails?.duration || ''),
      viewCount: this.formatViewCount(item.statistics?.viewCount || '0'),
      likeCount: item.statistics?.likeCount || '0',
    }));
  }

  async getVideoDetails(videoId: string): Promise<VideoItem | null> {
    const response = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [videoId],
    });

    const item = response.data.items?.[0];
    if (!item) return null;

    return {
      id: item.id || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      thumbnailHigh: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || '',
      channelId: item.snippet?.channelId || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
      duration: this.parseDuration(item.contentDetails?.duration || ''),
      viewCount: this.formatViewCount(item.statistics?.viewCount || '0'),
      likeCount: item.statistics?.likeCount || '0',
    };
  }

  async getTrendingVideos(regionCode = 'US', maxResults = 50): Promise<VideoItem[]> {
    const response = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      chart: 'mostPopular',
      regionCode,
      maxResults,
    });

    return (response.data.items || []).map((item) => ({
      id: item.id || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      thumbnailHigh: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      channelId: item.snippet?.channelId || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
      duration: this.parseDuration(item.contentDetails?.duration || ''),
      viewCount: this.formatViewCount(item.statistics?.viewCount || '0'),
      likeCount: item.statistics?.likeCount || '0',
    }));
  }

  async getSubscriptions(maxResults = 50): Promise<SubscriptionItem[]> {
    try {
      const response = await this.youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        maxResults,
        order: 'alphabetical',
      });

      return (response.data.items || []).map((item) => ({
        channelId: item.snippet?.resourceId?.channelId || '',
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
      }));
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 401) {
        throw new Error('Authentication required. Please sign in with your YouTube account.');
      }
      throw error;
    }
  }

  async getSubscriptionFeed(pageToken?: string): Promise<PaginatedVideos> {
    try {
      const CHANNELS_PER_PAGE = 10;
      const VIDEOS_PER_CHANNEL = 5;

      // On first call or refresh, fetch and cache all subscription playlist IDs
      if (!pageToken || pageToken === 'refresh') {
        const subscriptions = await this.getSubscriptions(50);
        if (subscriptions.length === 0) {
          return { videos: [], hasMore: false };
        }

        const channelIds = subscriptions.map(s => s.channelId);
        const channelsResponse = await this.youtube.channels.list({
          part: ['contentDetails'],
          id: channelIds,
        });

        this.subscriptionPlaylistIds = (channelsResponse.data.items || [])
          .map(ch => ch.contentDetails?.relatedPlaylists?.uploads)
          .filter((id): id is string => !!id);

        this.subscriptionVideosCache = [];
      }

      // Parse page token as index
      const startIndex = pageToken && pageToken !== 'refresh' ? parseInt(pageToken, 10) : 0;
      const endIndex = Math.min(startIndex + CHANNELS_PER_PAGE, this.subscriptionPlaylistIds.length);
      const playlistsToFetch = this.subscriptionPlaylistIds.slice(startIndex, endIndex);

      // Fetch videos from this batch of channels
      const batchVideos: VideoItem[] = [];
      for (const playlistId of playlistsToFetch) {
        try {
          const videos = await this.getPlaylistItems(playlistId, VIDEOS_PER_CHANNEL);
          batchVideos.push(...videos);
        } catch {
          // Skip channels that fail
        }
      }

      // Sort batch by publish date
      batchVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      const hasMore = endIndex < this.subscriptionPlaylistIds.length;
      const nextPageToken = hasMore ? String(endIndex) : undefined;

      return {
        videos: batchVideos,
        nextPageToken,
        hasMore,
      };
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 401) {
        throw new Error('Authentication required. Please sign in with your YouTube account.');
      }
      throw error;
    }
  }

  async getLikedVideos(pageToken?: string): Promise<PaginatedVideos> {
    try {
      // "LL" is the special playlist ID for liked videos
      return await this.getPlaylistItemsPaginated('LL', 25, pageToken);
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 401) {
        throw new Error('Authentication required. Please sign in with your YouTube account.');
      }
      throw error;
    }
  }

  async getWatchHistory(pageToken?: string): Promise<PaginatedVideos> {
    try {
      // "HL" is the special playlist ID for watch history
      // Note: Watch history access may be restricted by YouTube
      return await this.getPlaylistItemsPaginated('HL', 25, pageToken);
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 401 || err.code === 403) {
        // Watch history is often restricted, return empty array
        console.warn('Watch history access restricted');
        return { videos: [], hasMore: false };
      }
      throw error;
    }
  }

  async getTrendingVideosPaginated(regionCode = 'US', pageToken?: string): Promise<PaginatedVideos> {
    const response = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      chart: 'mostPopular',
      regionCode,
      maxResults: 25,
      pageToken,
    });

    const videos = (response.data.items || []).map((item) => ({
      id: item.id || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      thumbnailHigh: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      channelId: item.snippet?.channelId || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
      duration: this.parseDuration(item.contentDetails?.duration || ''),
      viewCount: this.formatViewCount(item.statistics?.viewCount || '0'),
      likeCount: item.statistics?.likeCount || '0',
    }));

    return {
      videos,
      nextPageToken: response.data.nextPageToken || undefined,
      hasMore: !!response.data.nextPageToken,
    };
  }

  private parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private formatViewCount(count: string): string {
    const num = parseInt(count, 10);
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
  }
}

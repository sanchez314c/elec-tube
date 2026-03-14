import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/appStore';
import { VideoCard } from './VideoCard';
import { VideoCardSkeleton } from './VideoCardSkeleton';
import { FilterBar } from './FilterBar';

export function VideoGrid() {
  const { videos, isLoadingVideos, currentView, searchQuery, selectedPlaylist, hasMore, isLoadingMore, loadMore } = useAppStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll with Intersection Observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoadingVideos) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, isLoadingVideos, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  const getTitle = () => {
    switch (currentView) {
      case 'trending':
        return 'Trending Videos';
      case 'search':
        return `Results for "${searchQuery}"`;
      case 'playlist':
        return selectedPlaylist?.title || 'Playlist';
      case 'subscriptions':
        return 'Subscriptions';
      case 'liked':
        return 'Liked Videos';
      case 'history':
        return 'Watch History';
      default:
        return 'Videos';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'trending':
        return 'Popular videos right now';
      case 'search':
        return `${videos.length} videos found`;
      case 'playlist':
        return `${videos.length} videos`;
      case 'subscriptions':
        return `${videos.length} videos from your subscriptions`;
      case 'liked':
        return `${videos.length} videos you liked`;
      case 'history':
        return 'Recently watched';
      default:
        return '';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="section-header mb-8">
        <div>
          <h1 className="section-title">{getTitle()}</h1>
          <p className="section-subtitle">{getSubtitle()}</p>
        </div>
      </div>

      {/* Filter bar for subscriptions */}
      <FilterBar />

      {/* Grid */}
      {isLoadingVideos ? (
        <div className="video-grid animate-stagger">
          {Array.from({ length: 12 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="w-20 h-20 rounded-2xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#5c5c6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[#e8e8ec]">No videos found</p>
          <p className="text-sm text-[#5c5c6a] mt-2">Try a different search or browse trending</p>
        </div>
      ) : (
        <>
          <div className="video-grid animate-stagger">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-3 text-[#9a9aa6]">
                <div className="w-6 h-6 spinner" />
                <span>Loading more...</span>
              </div>
            </div>
          )}

          {/* End of content indicator */}
          {!hasMore && videos.length > 0 && (
            <div className="end-indicator">
              <span>You've reached the end</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useAppStore } from '../../store/appStore';

export function Sidebar() {
  const {
    currentView,
    isAuthenticated,
    fetchTrending,
    fetchPlaylists,
    playlists,
    fetchPlaylistVideos,
    selectedPlaylist,
    fetchSubscriptionFeed,
    fetchLikedVideos,
    fetchWatchHistory,
  } = useAppStore();

  return (
    <aside className="sidebar">
      <nav className="flex-1 overflow-y-auto" style={{ marginTop: '4px' }}>
        {/* Main nav */}
        <div className="nav-section-title">BROWSE</div>

        {isAuthenticated && (
          <button
            className={`nav-item ${currentView === 'subscriptions' ? 'active' : ''}`}
            onClick={fetchSubscriptionFeed}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Subscriptions
          </button>
        )}

        <button
          className={`nav-item ${currentView === 'trending' ? 'active' : ''}`}
          onClick={fetchTrending}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          Trending
        </button>

        <div className="nav-divider" />

        {/* Library */}
        <div className="nav-section-title">LIBRARY</div>

        {isAuthenticated && (
          <>
            <button
              className={`nav-item ${currentView === 'liked' ? 'active' : ''}`}
              onClick={fetchLikedVideos}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Liked Videos
            </button>
            <button
              className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
              onClick={fetchWatchHistory}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
          </>
        )}

        <button
          className={`nav-item ${currentView === 'playlists' ? 'active' : ''}`}
          onClick={fetchPlaylists}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          My Playlists
        </button>

        {/* Playlist list */}
        {playlists.length > 0 && (
          <>
            <div className="nav-divider" />
            <div className="nav-section-title">PLAYLISTS</div>
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className={`playlist-item ${selectedPlaylist?.id === playlist.id ? 'active' : ''}`}
                onClick={() => fetchPlaylistVideos(playlist.id)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="truncate flex-1">{playlist.title}</span>
                <span className="playlist-item-count">{playlist.itemCount}</span>
              </button>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}

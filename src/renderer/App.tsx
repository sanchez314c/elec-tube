import { useEffect, useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { VideoGrid } from './components/Grid/VideoGrid';
import { PlaylistGrid } from './components/Grid/PlaylistGrid';
import { FeaturedCarousel } from './components/Featured/FeaturedCarousel';
import { useAppStore } from './store/appStore';

export default function App() {
  const {
    currentView,
    fetchTrending,
    fetchSubscriptionFeed,
    error,
    setError,
    videos,
    isLoadingVideos,
    setIsAuthenticated,
  } = useAppStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    autoAuthenticate();
  }, []);

  const autoAuthenticate = async () => {
    try {
      const isConfigured = await window.electube.auth.isConfigured();
      if (!isConfigured) {
        setIsCheckingAuth(false);
        setIsAuthenticated(false);
        fetchTrending();
        return;
      }
      const isLoggedIn = await window.electube.auth.isLoggedIn();
      if (isLoggedIn) {
        setIsCheckingAuth(false);
        setIsAuthenticated(true);
        fetchSubscriptionFeed();
        return;
      }
      await window.electube.auth.login();
      setIsCheckingAuth(false);
      setIsAuthenticated(true);
      fetchSubscriptionFeed();
    } catch {
      setError('Authentication failed. Please try signing in manually.');
      setIsCheckingAuth(false);
      setIsAuthenticated(false);
      fetchTrending();
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="app-container">
        <div className="flex-1 flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-[#14b8a6] mb-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
          <h1 className="text-2xl font-bold text-[#f4f4f7] mb-3">ElecTube</h1>
          <p className="text-[#5c5c6a]">Authenticating with YouTube...</p>
          <div className="mt-6 w-10 h-10 spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <TitleBar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          {/* Error banner */}
          {error && (
            <div className="error-banner animate-fade-in">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="error-banner-text">{error}</span>
              </div>
              <button className="error-banner-close" onClick={() => setError(null)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Featured carousel */}
          {(currentView === 'trending' || currentView === 'subscriptions') && videos.length > 0 && !isLoadingVideos && (
            <FeaturedCarousel videos={videos.slice(0, 5)} />
          )}

          {/* Main content */}
          {currentView === 'playlists' ? <PlaylistGrid /> : <VideoGrid />}
        </main>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <div className={`status-indicator ${videos.length === 0 && isLoadingVideos ? 'offline' : ''}`} />
          <span>{isLoadingVideos ? 'Loading...' : 'Ready'}</span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span>{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="status-right">
          <span className="app-version">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

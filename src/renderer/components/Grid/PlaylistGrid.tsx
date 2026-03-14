import { useAppStore } from '../../store/appStore';
import { PlaylistCard } from './PlaylistCard';

export function PlaylistGrid() {
  const { playlists, isLoadingPlaylists } = useAppStore();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="section-header mb-8">
        <div>
          <h1 className="section-title">My Playlists</h1>
          <p className="section-subtitle">{playlists.length} playlists</p>
        </div>
      </div>

      {/* Grid */}
      {isLoadingPlaylists ? (
        <div className="video-grid animate-stagger">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-xl skeleton-glass" />
              <div className="mt-3 space-y-2.5">
                <div className="h-4 rounded-lg skeleton-glass w-3/4" />
                <div className="h-3 rounded-md skeleton-glass w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="empty-state">
          <div className="w-20 h-20 rounded-2xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-[#5c5c6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[#e8e8ec]">No playlists found</p>
          <p className="text-sm text-[#5c5c6a] mt-2">Sign in with OAuth to access your playlists</p>
          <p className="text-xs mt-6 text-[#5c5c6a] px-6 py-3 rounded-xl bg-[rgba(0,0,0,0.3)]">
            Add <code className="text-[#14b8a6]">YOUTUBE_CLIENT_ID</code> and <code className="text-[#14b8a6]">YOUTUBE_CLIENT_SECRET</code> to your bashrc
          </p>
        </div>
      ) : (
        <div className="video-grid animate-stagger">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}

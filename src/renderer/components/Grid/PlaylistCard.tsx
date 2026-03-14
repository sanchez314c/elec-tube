import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { PlaylistItem } from '../../types/electron';

interface PlaylistCardProps {
  playlist: PlaylistItem;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { fetchPlaylistVideos } = useAppStore();

  const handleClick = () => {
    fetchPlaylistVideos(playlist.id);
  };

  return (
    <div
      className="video-card group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative">
        <div className="video-glow" />

        <div className="thumbnail-container aspect-video bg-[rgba(255,255,255,0.03)]">
          {/* Image or placeholder */}
          {!imageLoaded && playlist.thumbnail && (
            <div className="absolute inset-0 skeleton-glass rounded-xl" />
          )}
          {playlist.thumbnail ? (
            <img
              src={playlist.thumbnail}
              alt={playlist.title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[rgba(255,255,255,0.03)]">
              <svg className="w-14 h-14 text-[#5c5c6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
          )}

          {/* Playlist count overlay */}
          <div className="absolute bottom-0 right-0 w-2/5 h-full flex flex-col items-center justify-center bg-gradient-to-l from-black/90 via-black/70 to-transparent backdrop-blur-sm">
            <span className="text-2xl font-bold text-white">{playlist.itemCount}</span>
            <svg className="w-5 h-5 text-[#9a9aa6] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>

          {/* Hover: Play All overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ width: '60%' }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#14b8a6]/90 text-white font-medium shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Play All</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3">
        <h3 className="text-sm font-medium text-[#e8e8ec] line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {playlist.title}
        </h3>
        <p className="text-xs text-[#5c5c6a] mt-1.5">
          {playlist.itemCount} videos
        </p>
      </div>
    </div>
  );
}

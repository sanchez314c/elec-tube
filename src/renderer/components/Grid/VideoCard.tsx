import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { formatDate } from '../../utils/formatDate';
import type { VideoItem } from '../../types/electron';

interface VideoCardProps {
  video: VideoItem;
}

export function VideoCard({ video }: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { playVideo } = useAppStore();

  const handlePlay = () => {
    playVideo(video.id);
  };

  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    await window.electube.player.openInBrowser(video.id);
  };

  return (
    <div
      className="video-card group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
      onContextMenu={handleContextMenu}
    >
      {/* Thumbnail */}
      <div className="relative">
        <div className="video-glow" />

        <div className="thumbnail-container aspect-video bg-[rgba(255,255,255,0.03)]">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton-glass rounded-xl" />
          )}

          {/* Image */}
          <img
            src={video.thumbnailHigh || video.thumbnail}
            alt={video.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Duration badge */}
          <span className="duration-badge">{video.duration}</span>

          {/* Hover overlay with play button */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="play-button-overlay relative z-10">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="mt-3 flex gap-3">
        {/* Channel avatar */}
        <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] flex-shrink-0 flex items-center justify-center ring-2 ring-[#1e1e24] group-hover:ring-[#14b8a6]/30 transition-all">
          <span className="text-sm font-semibold text-[#9a9aa6]">
            {video.channelTitle.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-medium text-[#e8e8ec] line-clamp-2 leading-snug group-hover:text-white transition-colors">
            {video.title}
          </h3>

          {/* Channel name */}
          <p className="text-xs text-[#9a9aa6] mt-1.5 hover:text-[#e8e8ec] transition-colors cursor-pointer truncate">
            {video.channelTitle}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-1.5 text-xs text-[#5c5c6a] mt-1">
            <span>{video.viewCount} views</span>
            <span className="w-1 h-1 rounded-full bg-[#2a2a30]" />
            <span>{formatDate(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

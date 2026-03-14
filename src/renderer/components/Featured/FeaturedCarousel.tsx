import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { formatDate } from '../../utils/formatDate';
import type { VideoItem } from '../../types/electron';

interface FeaturedCarouselProps {
  videos: VideoItem[];
}

export function FeaturedCarousel({ videos }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { playVideo } = useAppStore();
  const featured = videos[currentIndex];

  // Auto-advance carousel
  useEffect(() => {
    if (videos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(videos.length, 5));
    }, 8000);
    return () => clearInterval(timer);
  }, [videos.length]);

  if (!featured) return null;

  return (
    <div className="featured-hero group">
      {/* Blurred background */}
      <div
        className="featured-hero-bg transition-all duration-700"
        style={{ backgroundImage: `url(${featured.thumbnailHigh || featured.thumbnail})` }}
      />

      {/* Content overlay */}
      <div className="featured-hero-content">
        {/* Thumbnail */}
        <div
          className="featured-thumbnail cursor-pointer overflow-hidden"
          onClick={() => playVideo(featured.id)}
        >
          <img
            src={featured.thumbnailHigh || featured.thumbnail}
            alt={featured.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="play-button-overlay relative z-10 w-20 h-20">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          {/* Duration badge */}
          <span className="duration-badge">{featured.duration}</span>
        </div>

        {/* Info */}
        <div className="featured-info">
          <span className="featured-badge">FEATURED</span>
          <h2 className="text-3xl font-bold text-white mb-4 line-clamp-2 leading-tight">
            {featured.title}
          </h2>
          <p className="text-[#9a9aa6] mb-4 text-lg">{featured.channelTitle}</p>
          <div className="flex items-center gap-4 text-sm text-[#5c5c6a]">
            <span>{featured.viewCount} views</span>
            <span className="w-1 h-1 rounded-full bg-[#2a2a30]" />
            <span>{formatDate(featured.publishedAt)}</span>
          </div>

          {/* Watch now button */}
          <button
            onClick={() => playVideo(featured.id)}
            className="btn-accent mt-6 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </button>

          {/* Navigation dots */}
          <div className="flex items-center gap-2 mt-8">
            {videos.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-[#14b8a6] w-8'
                    : 'bg-[#2a2a30] hover:bg-[#5c5c6a] w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

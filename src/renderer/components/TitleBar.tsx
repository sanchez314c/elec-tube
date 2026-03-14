import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { UserAvatar } from './Auth/UserAvatar';

export function TitleBar() {
  const [searchInput, setSearchInput] = useState('');
  const { searchVideos } = useAppStore();
  const [showAbout, setShowAbout] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchVideos(searchInput);
    }
  };

  const handleGithubClick = async () => {
    try {
      await window.electube.openExternal('https://github.com/sanchez314c/elec-tube');
    } catch {
      window.open('https://github.com/sanchez314c/elec-tube', '_blank');
    }
  };

  return (
    <>
      <div className="drag-handle" />
      <header className="title-bar">
        {/* Logo + Name */}
        <svg className="w-5 h-5 text-[#14b8a6] mr-2.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </svg>
        <span className="app-name">ElecTube</span>
        <span className="app-tagline">YouTube Desktop Client</span>

        <div className="spacer" />

        {/* Search — centered via equal spacers on both sides */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="search-input-container">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search videos..."
            />
            <button type="submit">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <div className="spacer" />

        {/* User Avatar */}
        <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="mr-3">
          <UserAvatar />
        </div>

        {/* Title Bar Controls */}
        <div className="title-bar-controls">
          {/* Flat action icons */}
          <div className="title-bar-actions">
            <button className="title-bar-action about-btn" title="About" onClick={() => setShowAbout(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>
          {/* Circular window controls */}
          <div className="title-bar-window-controls">
            <button className="window-ctrl-btn" onClick={() => window.electube.window.minimize()} title="Minimize">&#x2500;</button>
            <button className="window-ctrl-btn" onClick={() => window.electube.window.maximize()} title="Maximize">&#x25A1;</button>
            <button className="window-ctrl-btn window-close-btn" onClick={() => window.electube.window.close()} title="Close">&#x2715;</button>
          </div>
        </div>
      </header>

      {/* About Modal */}
      {showAbout && (
        <div className="about-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowAbout(false); }}>
          <div className="about-modal">
            <button className="about-close-btn" onClick={() => setShowAbout(false)}>&#x2715;</button>
            <svg className="about-app-icon" viewBox="0 0 24 24" fill="#fff">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            <h2 className="about-app-name">ElecTube</h2>
            <div className="about-version">v1.0.0</div>
            <div className="about-desc">First-class YouTube client with grid view and native playback</div>
            <div className="about-license">MIT License | Jason Paul Michaels</div>
            <button className="about-github-badge" onClick={handleGithubClick}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </button>
            <div className="about-email">software@jasonpaulmichaels.co</div>
          </div>
        </div>
      )}
    </>
  );
}

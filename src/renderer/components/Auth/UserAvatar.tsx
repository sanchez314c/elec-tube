import { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../../types/electron';

export function UserAvatar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const configured = await window.electube.auth.isConfigured();
      setIsConfigured(configured);

      const loggedIn = await window.electube.auth.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const userProfile = await window.electube.auth.getProfile();
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await window.electube.auth.login();
      await checkAuthStatus();
      setShowMenu(false);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Make sure YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET are set.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await window.electube.auth.logout();
      setIsLoggedIn(false);
      setProfile(null);
      setShowMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-full skeleton-glass" />
    );
  }

  if (!isConfigured) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="btn-setup-warning"
          title="OAuth not configured"
        >
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-[#9a9aa6]">Setup</span>
        </button>

        {showMenu && (
          <div className="dropdown-glass absolute right-0 top-full mt-3 w-80 z-50 animate-scale-in p-5">
            <h3 className="font-semibold text-white mb-3">OAuth Not Configured</h3>
            <p className="text-sm text-[#9a9aa6] mb-4">
              Add these to your ~/.bashrc:
            </p>
            <code className="block text-xs bg-[rgba(0,0,0,0.3)] p-3 rounded-xl text-[#14b8a6] mb-4 font-mono">
              export YOUTUBE_CLIENT_ID="..."<br/>
              export YOUTUBE_CLIENT_SECRET="..."
            </code>
            <p className="text-xs text-[#5c5c6a]">
              Get credentials from Google Cloud Console → APIs & Services → Credentials
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={handleLogin}
        className="btn-sign-in"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="relative p-1 rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200 group"
      >
        {profile?.picture ? (
          <img
            src={profile.picture}
            alt={profile.name}
            className="w-9 h-9 rounded-full ring-2 ring-[#1e1e24] group-hover:ring-[#14b8a6]/40 transition-all"
          />
        ) : (
          <div className="user-avatar-placeholder">
            {profile?.name?.charAt(0) || '?'}
          </div>
        )}
      </button>

      {showMenu && (
        <div className="dropdown-glass absolute right-0 top-full mt-3 w-72 z-50 animate-scale-in">
          {/* Profile header */}
          <div className="p-5 border-b border-[#2a2a30] bg-gradient-to-br from-[rgba(20,184,166,0.08)] to-transparent">
            <div className="flex items-center gap-4">
              {profile?.picture ? (
                <img
                  src={profile.picture}
                  alt={profile.name}
                  className="w-14 h-14 rounded-full ring-2 ring-[#2a2a30]"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#14b8a6] flex items-center justify-center text-white text-xl font-semibold">
                  {profile?.name?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {profile?.name || 'User'}
                </p>
                <p className="text-sm text-[#9a9aa6] truncate">
                  {profile?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="dropdown-item w-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

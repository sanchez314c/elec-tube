import { useAppStore, AGE_FILTER_OPTIONS } from '../../store/appStore';

export function FilterBar() {
  const { maxAgeDays, setMaxAgeDays, refreshCurrentView, isLoadingVideos, currentView, isLoadingMore } = useAppStore();

  // Show on views that support infinite scroll
  const showFilterBar = ['subscriptions', 'trending', 'liked', 'history'].includes(currentView);
  if (!showFilterBar) return null;

  // Only subscriptions has the age filter
  const showAgeFilter = currentView === 'subscriptions';

  const handleFilterChange = async (days: number) => {
    setMaxAgeDays(days);
    // Refresh with new filter
    await refreshCurrentView();
  };

  const isLoading = isLoadingVideos || isLoadingMore;

  return (
    <div className="filter-bar">
      {/* Age filter dropdown - only for subscriptions */}
      {showAgeFilter && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-[#9a9aa6] font-medium">Show videos from:</label>
          <select
            value={maxAgeDays}
            onChange={(e) => handleFilterChange(Number(e.target.value))}
            disabled={isLoading}
          >
            {AGE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Refresh button */}
      <button
        onClick={() => refreshCurrentView()}
        disabled={isLoading}
        className="btn-refresh"
      >
        <svg
          className={`w-4 h-4 ${isLoadingVideos ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isLoadingVideos ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}

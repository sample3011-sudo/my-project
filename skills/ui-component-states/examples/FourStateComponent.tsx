import React from 'react';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
}

export interface UserProfileViewProps {
  isLoading: boolean;
  data: UserProfileData | null;
  error: string | null;
  onRetry?: () => void;
}

/**
 * Reference component demonstrating explicit handling of all 4 UI states:
 * 1. Loading state (Skeleton/Spinner)
 * 2. Error state (User-friendly message + Retry button)
 * 3. Empty state (Explicit empty message, not a blank screen)
 * 4. Success state (Data presentation)
 */
export const UserProfileView: React.FC<UserProfileViewProps> = ({
  isLoading,
  data,
  error,
  onRetry,
}) => {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="p-6 rounded-lg bg-gray-50 animate-pulse" data-testid="loading-state">
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="p-6 rounded-lg border border-red-200 bg-red-50 text-red-700" data-testid="error-state">
        <h3 className="font-semibold text-lg mb-1">Unable to load profile</h3>
        <p className="text-sm mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (!data) {
    return (
      <div className="p-6 text-center rounded-lg border border-gray-200 bg-white text-gray-500" data-testid="empty-state">
        <p className="text-base font-medium">No profile data available.</p>
        <p className="text-sm text-gray-400 mt-1">Please create or update your profile to view details.</p>
      </div>
    );
  }

  // 4. Success State
  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm" data-testid="success-state">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{data.name}</h2>
      <p className="text-sm text-gray-600">{data.email}</p>
      <span className="inline-block mt-3 px-2 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded">
        ID: {data.id}
      </span>
    </div>
  );
};

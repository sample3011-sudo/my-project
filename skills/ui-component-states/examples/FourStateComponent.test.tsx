import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfileView, UserProfileData } from './FourStateComponent';

describe('UserProfileView (4-State Enforcement)', () => {
  const mockData: UserProfileData = {
    id: 'usr_123',
    name: 'Alice Johnson',
    email: 'alice@example.com',
  };

  it('1. should render loading skeleton state when isLoading is true', () => {
    render(<UserProfileView isLoading={true} data={null} error={null} />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('success-state')).not.toBeInTheDocument();
  });

  it('2. should render error state with user message and trigger retry callback', () => {
    const handleRetry = jest.fn();
    render(
      <UserProfileView
        isLoading={false}
        data={null}
        error="Network timeout"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Network timeout')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('3. should render empty state when data is null and not loading/error', () => {
    render(<UserProfileView isLoading={false} data={null} error={null} />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no profile data available/i)).toBeInTheDocument();
  });

  it('4. should render success state with complete data view', () => {
    render(<UserProfileView isLoading={false} data={mockData} error={null} />);

    expect(screen.getByTestId('success-state')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText(/usr_123/)).toBeInTheDocument();
  });
});

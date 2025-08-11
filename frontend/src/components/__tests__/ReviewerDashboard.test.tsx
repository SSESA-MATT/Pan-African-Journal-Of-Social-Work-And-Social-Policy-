import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReviewerDashboard from '../ReviewerDashboard';
import { reviewApi } from '../../lib/reviewApi';

// Mock the reviewApi
jest.mock('../../lib/reviewApi');
const mockedReviewApi = reviewApi as jest.Mocked<typeof reviewApi>;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('ReviewerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockedReviewApi.getReviewerDashboard.mockImplementation(() => new Promise(() => {}));
    
    render(<ReviewerDashboard />);
    
    expect(screen.getByText('Loading reviewer dashboard...')).toBeInTheDocument();
  });

  it('should render dashboard data when loaded', async () => {
    const mockDashboardData = {
      pendingReviews: [
        {
          id: 'submission-1',
          title: 'Test Submission',
          abstract: 'This is a test abstract for the submission.',
          status: 'under_review',
          submitted_at: '2024-01-01T00:00:00Z',
          first_name: 'John',
          last_name: 'Doe',
        },
      ],
      completedReviews: [
        {
          id: 'review-1',
          submission_id: 'submission-2',
          reviewer_id: 'reviewer-id',
          comments: 'This is a good paper with minor issues.',
          recommendation: 'minor_revisions' as const,
          submitted_at: '2024-01-02T00:00:00Z',
          title: 'Completed Submission',
          abstract: 'This is a completed submission abstract.',
          status: 'accepted',
          submission_date: '2023-12-01T00:00:00Z',
          first_name: 'Jane',
          last_name: 'Smith',
        },
      ],
      reviewStats: {
        totalReviews: 1,
        pendingCount: 1,
      },
    };

    mockedReviewApi.getReviewerDashboard.mockResolvedValue(mockDashboardData);

    render(<ReviewerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Reviewer Dashboard')).toBeInTheDocument();
    });

    // Check stats cards
    expect(screen.getByText('1')).toBeInTheDocument(); // Pending reviews count
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
    expect(screen.getByText('Completed Reviews')).toBeInTheDocument();

    // Check tabs
    expect(screen.getByText('Pending Reviews (1)')).toBeInTheDocument();
    expect(screen.getByText('Completed Reviews (1)')).toBeInTheDocument();

    // Check pending review content
    expect(screen.getByText('Test Submission')).toBeInTheDocument();
    expect(screen.getByText('Author: John Doe')).toBeInTheDocument();
    expect(screen.getByText('Start Review')).toBeInTheDocument();
  });

  it('should render error state when API fails', async () => {
    const errorMessage = 'Failed to load dashboard data';
    mockedReviewApi.getReviewerDashboard.mockRejectedValue(new Error(errorMessage));

    render(<ReviewerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should render empty state when no pending reviews', async () => {
    const mockDashboardData = {
      pendingReviews: [],
      completedReviews: [],
      reviewStats: {
        totalReviews: 0,
        pendingCount: 0,
      },
    };

    mockedReviewApi.getReviewerDashboard.mockResolvedValue(mockDashboardData);

    render(<ReviewerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Reviewer Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('No Pending Reviews')).toBeInTheDocument();
    expect(screen.getByText('You have no manuscripts waiting for review at this time.')).toBeInTheDocument();
  });
});
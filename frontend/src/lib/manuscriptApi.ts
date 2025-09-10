import { 
  Manuscript, 
  ManuscriptSubmissionRequest, 
  ManuscriptUpdateRequest,
  Review,
  ReviewSubmissionRequest 
} from '../types/manuscript';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' // Use relative URLs for Next.js API routes in production
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Author-related API functions
export async function submitManuscript(manuscriptData: ManuscriptSubmissionRequest): Promise<Manuscript> {
  const response = await fetch(`${API_BASE}/manuscripts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(manuscriptData),
  });

  if (!response.ok) {
    throw new Error('Failed to submit manuscript');
  }

  return response.json();
}

export async function getUserManuscripts(userId: string): Promise<Manuscript[]> {
  const response = await fetch(`${API_BASE}/manuscripts/user/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch manuscripts');
  }

  return response.json();
}

export async function getManuscriptById(manuscriptId: string): Promise<Manuscript> {
  const response = await fetch(`${API_BASE}/manuscripts/${manuscriptId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch manuscript');
  }

  return response.json();
}

export async function updateManuscript(manuscriptId: string, updateData: ManuscriptUpdateRequest): Promise<Manuscript> {
  const response = await fetch(`${API_BASE}/manuscripts/${manuscriptId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error('Failed to update manuscript');
  }

  return response.json();
}

export async function deleteManuscript(manuscriptId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/manuscripts/${manuscriptId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete manuscript');
  }
}

// Reviewer-related API functions
export async function getAssignedManuscripts(reviewerId: string): Promise<Manuscript[]> {
  const response = await fetch(`${API_BASE}/reviews/assigned/${reviewerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch assigned manuscripts');
  }

  return response.json();
}

export async function submitReview(reviewData: ReviewSubmissionRequest): Promise<Review> {
  const response = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    throw new Error('Failed to submit review');
  }

  return response.json();
}

export async function getReviewById(reviewId: string): Promise<Review> {
  const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch review');
  }

  return response.json();
}

export async function updateReview(reviewId: string, reviewData: Partial<ReviewSubmissionRequest>): Promise<Review> {
  const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    throw new Error('Failed to update review');
  }

  return response.json();
}

// Admin-related API functions
export async function getAllManuscripts(): Promise<Manuscript[]> {
  const response = await fetch(`${API_BASE}/manuscripts/admin/all`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch all manuscripts');
  }

  return response.json();
}

export async function assignReviewer(manuscriptId: string, reviewerId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/manuscripts/${manuscriptId}/assign-reviewer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ reviewerId }),
  });

  if (!response.ok) {
    throw new Error('Failed to assign reviewer');
  }
}

export async function updateManuscriptStatus(manuscriptId: string, status: string): Promise<Manuscript> {
  const response = await fetch(`${API_BASE}/manuscripts/${manuscriptId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update manuscript status');
  }

  return response.json();
}

export async function getAllReviewers(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/users/reviewers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch reviewers');
  }

  return response.json();
}

// File upload functions
export async function uploadManuscriptFile(manuscriptId: string, file: File, fileType: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('manuscriptId', manuscriptId);
  formData.append('fileType', fileType);

  const response = await fetch(`${API_BASE}/manuscripts/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  return response.json();
}

export async function downloadManuscriptFile(fileId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/manuscripts/files/${fileId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  return response.blob();
}

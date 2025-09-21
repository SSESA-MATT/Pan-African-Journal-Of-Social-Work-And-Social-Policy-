import { 
  Manuscript, 
  ManuscriptSubmissionRequest, 
  ManuscriptUpdateRequest,
  Review,
  ReviewSubmissionRequest 
} from '../types/manuscript';

// API base URL for Next.js API routes
const API_BASE = '/api'; // Always use Next.js API routes

// Author-related API functions
export async function submitManuscript(manuscriptData: ManuscriptSubmissionRequest): Promise<{
  success: boolean;
  message: string;
  submission?: Manuscript;
  id?: string;
}> {
  console.log('*** submitManuscript DEBUG ***');
  console.log('submitManuscript - manuscriptData.title:', manuscriptData.title);
  console.log('submitManuscript - API_BASE:', API_BASE);
  
  // Remove author_id from the data since it will be extracted from session
  const { author_id, ...cleanData } = manuscriptData;
  
  // Use session-based authentication (no token needed)
  const response = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session authentication
    body: JSON.stringify(cleanData),
  });

  console.log('submitManuscript - Response status:', response.status);
  console.log('submitManuscript - Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('submitManuscript - Error response:', errorText);
    throw new Error('Failed to submit manuscript');
  }

  const result = await response.json();
  console.log('submitManuscript - Success response:', result);
  
  return result;
}

export async function getUserManuscripts(userId: string): Promise<Manuscript[]> {
  console.log('*** getUserManuscripts DEBUG ***');
  console.log('getUserManuscripts - API_BASE:', API_BASE);
  console.log('getUserManuscripts - Note: userId parameter ignored, using session authentication');
  
  // Use session-based authentication - no userId parameter needed
  const response = await fetch(`${API_BASE}/submissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session authentication
  });

  console.log('getUserManuscripts - Response status:', response.status);
  console.log('getUserManuscripts - Response ok:', response.ok);

  if (!response.ok) {
    console.error('getUserManuscripts - Response not OK:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('getUserManuscripts - Error details:', errorText);
    throw new Error('Failed to fetch manuscripts');
  }

  const manuscripts = await response.json();
  console.log('getUserManuscripts - Raw response:', manuscripts);
  console.log('getUserManuscripts - Manuscripts count:', manuscripts.length);
  
  return manuscripts;
}

export async function getManuscriptById(manuscriptId: string): Promise<Manuscript> {
  const response = await fetch(`${API_BASE}/manuscripts/${manuscriptId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session authentication
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

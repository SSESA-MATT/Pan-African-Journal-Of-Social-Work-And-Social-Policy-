// Simple API endpoint test
// Copy and paste this URL into your browser to test the API directly:

// For Vercel deployment:
// https://pan-african-journal-v3-of-social-wo.vercel.app/api/reviews/dashboard

// For local development:
// http://localhost:3000/api/reviews/dashboard

// This will show you the raw API response without the frontend

// To test in browser console:
fetch('/api/reviews/dashboard', {
  credentials: 'include'
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  return response.json();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('API Error:', error);
});
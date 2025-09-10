-- Clean slate: Remove all test data
-- Run this in Supabase SQL Editor if you want to start fresh

-- Delete test submissions and reviews
DELETE FROM reviews WHERE reviewer_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

DELETE FROM submissions WHERE author_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

-- Delete test users (keep the table structure)
DELETE FROM users WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

-- Keep volumes and issues as they're structural
-- DELETE FROM issues WHERE id = 1;
-- DELETE FROM volumes WHERE id = 1;

-- Reset auto-increment sequences (if needed)
-- SELECT setval('submissions_id_seq', 1, false);
-- SELECT setval('reviews_id_seq', 1, false);

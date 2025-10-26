#!/usr/bin/env node
/**
 * Seed script to create auth users and seed reviewer test data in Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://<project>.supabase.co SUPABASE_SERVICE_KEY=<service_role_key> node scripts/seed-reviewers.js
 *
 * This script will:
 *  1. Create auth users (using the service_role key) for the test accounts.
 *  2. Upsert profile rows into the `users` table.
 *  3. Upsert a few submissions and review assignments into `submissions` and `reviews`.
 *
 * Note: This is idempotent (uses upsert) and safe to run multiple times. Keep
 * your SUPABASE_SERVICE_KEY secret. Do not commit it to source control.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
  console.error('Example: SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_KEY=xxxx node scripts/seed-reviewers.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const authUsers = [
  { id: '00000000-0000-0000-0000-000000000001', email: 'author@test.com', password: 'TempPass!23' },
  { id: '00000000-0000-0000-0000-000000000002', email: 'reviewer@test.com', password: 'TempPass!23' },
  { id: '00000000-0000-0000-0000-000000000003', email: 'editor@test.com', password: 'TempPass!23' },
  { id: '11111111-1111-1111-1111-111111111111', email: 'reviewer2@test.com', password: 'TempPass!23' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'reviewer3@test.com', password: 'TempPass!23' },
];

const profiles = [
  { id: '00000000-0000-0000-0000-000000000001', email: 'author@test.com', first_name: 'Amara', last_name: 'Okonkwo', role: 'author', affiliation: 'University of Cape Town', expertise: ['Ubuntu philosophy','community social work'] },
  { id: '00000000-0000-0000-0000-000000000002', email: 'reviewer@test.com', first_name: 'Kwame', last_name: 'Asante', role: 'reviewer', affiliation: 'University of Ghana', expertise: ['decolonial practice','child protection'] },
  { id: '00000000-0000-0000-0000-000000000003', email: 'editor@test.com', first_name: 'Thandiwe', last_name: 'Mthembu', role: 'editor', affiliation: 'University of the Witwatersrand', expertise: ['editorial management','social justice'] },
  { id: '11111111-1111-1111-1111-111111111111', email: 'reviewer2@test.com', first_name: 'Dr. Aisha', last_name: 'Ngozi', role: 'reviewer', affiliation: 'University of Lagos', expertise: ['gender studies','community development'] },
  { id: '22222222-2222-2222-2222-222222222222', email: 'reviewer3@test.com', first_name: 'Prof. Mandla', last_name: 'Sibeko', role: 'reviewer', affiliation: 'University of Pretoria', expertise: ['social policy','child welfare'] },
];

const submissions = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Ubuntu Philosophy and Community-Based Social Work: A Decolonial Approach to Practice',
    abstract: 'This study examines the integration of Ubuntu philosophy into community-based social work practice across three African countries...',
    keywords: ['Ubuntu','decolonial practice','community-based social work','Indigenous knowledge','participatory action research'],
    author_id: '00000000-0000-0000-0000-000000000001',
    status: 'submitted',
    submission_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Digital Divides and Social Justice: Technology Access in Post-Apartheid South Africa',
    abstract: 'An exploration of how digital inequalities perpetuate social injustices in contemporary South Africa...',
    keywords: ['digital divide','social justice','technology access','post-apartheid','digital inclusion'],
    author_id: '00000000-0000-0000-0000-000000000001',
    status: 'submitted',
    submission_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Gender-Based Violence Prevention in West African Communities',
    abstract: 'This ethnographic study documents innovative approaches to GBV prevention developed by women\'s cooperatives in Ghana, Nigeria, and Senegal...',
    keywords: ['gender-based violence','women cooperatives','West Africa','community prevention','ethnography'],
    author_id: '00000000-0000-0000-0000-000000000001',
    status: 'submitted',
    submission_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const reviews = [
  {
    id: 'review-001',
    submission_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    reviewer_id: '00000000-0000-0000-0000-000000000002',
    status: 'pending',
    assigned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-002',
    submission_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    reviewer_id: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-003',
    submission_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    reviewer_id: '22222222-2222-2222-2222-222222222222',
    status: 'pending',
    assigned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-004',
    submission_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    reviewer_id: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    assigned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

async function createAuthUsers() {
  console.log('Creating auth users...');
  for (const u of authUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        id: u.id,
        email: u.email,
        password: u.password,
        email_confirm: true,
      });
      if (error) {
        // If user exists, Supabase returns an error; we'll log and continue
        console.warn('auth.createUser warning for', u.email, error.message || error);
      } else {
        console.log('Created auth user:', data?.id || u.email);
      }
    } catch (err) {
      console.error('Error creating auth user', u.email, err.message || err);
    }
  }
}

async function upsertProfiles() {
  console.log('Upserting profile rows into public.users...');
  // Ensure the table exists then upsert and request returned rows with .select()
  try {
    const { data, error } = await supabase.from('users').upsert(profiles, { onConflict: 'id' }).select();
    if (error) throw error;
    console.log('Profiles upserted into public.users:', (data || []).length);
  } catch (err) {
    console.warn('Could not upsert into public.users:', (err && err.message) || err);
    // If the project uses `profiles` instead of `users`, try that table as a fallback
    try {
      const { data: data2, error: err2 } = await supabase.from('profiles').upsert(profiles, { onConflict: 'id' }).select();
      if (err2) throw err2;
      console.log('Profiles upserted into public.profiles:', (data2 || []).length);
    } catch (err3) {
      // Table may not exist or another issue; log and continue
      console.warn('Could not upsert into public.profiles either:', (err3 && err3.message) || err3);
    }
  }
}

async function tableExists(tableName) {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)
    .limit(1);
  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

async function postSeedVerify(insertedSubmissionIds = []) {
  console.log('\nPost-seed verification:');
  try {
    const { data: authUsers } = await supabase.rpc('', {}); // noop placeholder to keep pattern
  } catch (e) {
    // ignore
  }

  // Counts
  try {
    const { data: subCount } = await supabase.from('submissions').select('id', { count: 'exact' });
    const { data: revCount } = await supabase.from('reviews').select('id', { count: 'exact' });
    console.log('submissions count:', Array.isArray(subCount) ? subCount.length : 0);
    console.log('reviews count   :', Array.isArray(revCount) ? revCount.length : 0);
  } catch (e) {
    console.warn('Could not fetch counts:', e.message || e);
  }

  // Sample rows we just inserted (if we have IDs)
  if (Array.isArray(insertedSubmissionIds) && insertedSubmissionIds.length > 0) {
    try {
      const { data: subs } = await supabase.from('submissions').select('id,title,author_id').in('id', insertedSubmissionIds);
      console.log('Inserted submissions sample:', subs || []);
      const { data: revs } = await supabase.from('reviews').select('id,submission_id,reviewer_id,status').in('submission_id', insertedSubmissionIds);
      console.log('Inserted reviews sample:', revs || []);
    } catch (e) {
      console.warn('Could not fetch sample rows:', e.message || e);
    }
  }
}

async function upsertSubmissions() {
  console.log('Upserting submissions...');
  // First try a simple upsert (works when submissions.id is UUID-able)
  try {
    const { data, error } = await supabase.from('submissions').upsert(submissions, { onConflict: 'id' });
    if (error) throw error;
    console.log('Submissions upserted (fast path):', (data || []).length);
    // build id map from provided ids -> resulting ids (they should match)
    const idMap = {};
    (data || []).forEach((r) => {
      if (r && r.id) idMap[String(r.id)] = r.id;
    });
    return idMap;
  } catch (err) {
    const msg = (err && err.message) || String(err || '');
    // If the DB expects integer ids this will commonly fail with invalid input syntax for type integer
    if (!/invalid input syntax for type integer/i.test(msg)) {
      console.error('Error upserting submissions (unexpected):', msg);
      throw err;
    }

    console.warn('Submissions upsert failed due to id type mismatch. Falling back to find-or-insert strategy (DB likely uses integer PKs).');

    // Fallback: for each submission, try to find an existing row by a unique-ish key (title + author_id), otherwise insert without id
    const idMap = {};
    for (const s of submissions) {
      try {
        // Try to find existing by title + author_id
        const { data: found, error: findErr } = await supabase
          .from('submissions')
          .select('id')
          .eq('title', s.title)
          .eq('author_id', s.author_id)
          .limit(1);
        if (findErr) throw findErr;
        if (Array.isArray(found) && found.length > 0) {
          idMap[String(s.id)] = found[0].id;
          console.log('Found existing submission for', s.title, '->', found[0].id);
          continue;
        }

        // Insert without id so DB assigns integer PK
        const insertObj = Object.assign({}, s);
        delete insertObj.id;
        const { data: inserted, error: insertErr } = await supabase
          .from('submissions')
          .insert(insertObj)
          .select('id')
          .limit(1);
        if (insertErr) throw insertErr;
        if (Array.isArray(inserted) && inserted.length > 0) {
          idMap[String(s.id)] = inserted[0].id;
          console.log('Inserted submission (fallback) for', s.title, '->', inserted[0].id);
        } else if (inserted && inserted.id) {
          idMap[String(s.id)] = inserted.id;
          console.log('Inserted submission (fallback) for', s.title, '->', inserted.id);
        } else {
          throw new Error('Unexpected insert response for submission ' + s.title);
        }
      } catch (e) {
        console.error('Error handling submission', s.title, e.message || e);
        throw e;
      }
    }

    console.log('Submissions processed (fallback).');
    return idMap;
  }
}

async function upsertReviews() {
  console.log('Upserting reviews...');
  // Simple fast-path upsert. If the DB rejects the seeded review ids (e.g. reviews.id is integer),
  // higher-level code should call the fallback flow that inserts per-review without an explicit id.
  try {
    const { data, error } = await supabase.from('reviews').upsert(reviews, { onConflict: 'id' });
    if (error) throw error;
    console.log('Reviews upserted (fast path):', (data || []).length);
    return { ok: true };
  } catch (err) {
    const msg = (err && err.message) || String(err || '');
    console.warn('Fast-path reviews upsert failed:', msg);
    return { ok: false, error: err };
  }
}

async function run() {
  try {
    await createAuthUsers();
    // Give auth system a moment to persist
    await new Promise((r) => setTimeout(r, 1000));

    await upsertProfiles();
    // Upsert submissions. This function now returns an idMap when it had to
    // translate seeded UUIDs to DB-generated integer ids.
    const idMap = await upsertSubmissions();

    // If idMap exists and contains mappings, rebuild reviews to use the mapped submission ids
    if (idMap && Object.keys(idMap).length > 0) {
      const resolvedReviews = reviews.map((r) => {
        const mapped = Object.prototype.hasOwnProperty.call(idMap, String(r.submission_id))
          ? idMap[String(r.submission_id)]
          : r.submission_id;
        return Object.assign({}, r, { submission_id: mapped });
      });

      // Try fast upsert for resolved reviews first
      try {
        const { data, error } = await supabase.from('reviews').upsert(resolvedReviews, { onConflict: 'id' });
        if (error) throw error;
        console.log('Reviews upserted (resolved fast path):', (data || []).length);
      } catch (err) {
        const msg = (err && err.message) || String(err || '');
        console.warn('Resolved reviews upsert failed (likely id type mismatch). Falling back to per-review find-or-insert.');

        // Fallback: per-review find-or-insert using (submission_id + reviewer_id) as unique key
        for (const r of resolvedReviews) {
          try {
            // try to find existing by submission_id + reviewer_id
            const { data: found, error: findErr } = await supabase
              .from('reviews')
              .select('id')
              .eq('submission_id', r.submission_id)
              .eq('reviewer_id', r.reviewer_id)
              .limit(1);
            if (findErr) throw findErr;
            if (Array.isArray(found) && found.length > 0) {
              console.log('Found existing review for submission', r.submission_id, 'reviewer', r.reviewer_id, '->', found[0].id);
              continue;
            }

            // Insert without id so DB assigns PK
            const insertObj = Object.assign({}, r);
            delete insertObj.id;
            const { data: inserted, error: insertErr } = await supabase
              .from('reviews')
              .insert(insertObj)
              .select('id')
              .limit(1);
            if (insertErr) throw insertErr;
            if (Array.isArray(inserted) && inserted.length > 0) {
              console.log('Inserted review (fallback) for submission', r.submission_id, '->', inserted[0].id);
            } else if (inserted && inserted.id) {
              console.log('Inserted review (fallback) for submission', r.submission_id, '->', inserted.id);
            } else {
              throw new Error('Unexpected insert response for review (submission ' + r.submission_id + ')');
            }
          } catch (e) {
            console.error('Error handling review for submission', r.submission_id, e.message || e);
            throw e;
          }
        }
        console.log('Reviews processed (fallback).');
      }
    } else {
      // Fast path: try to upsert reviews (they may or may not use seeded ids). Use helper which returns status.
      const result = await upsertReviews();
      if (!result.ok) {
        // Fast upsert failed (likely id type mismatch). Perform per-review find-or-insert for the original reviews array.
        console.warn('Reviews fast upsert failed, falling back to per-review insert for original reviews.');
        for (const r of reviews) {
          try {
            const { data: found, error: findErr } = await supabase
              .from('reviews')
              .select('id')
              .eq('submission_id', r.submission_id)
              .eq('reviewer_id', r.reviewer_id)
              .limit(1);
            if (findErr) throw findErr;
            if (Array.isArray(found) && found.length > 0) {
              console.log('Found existing review for submission', r.submission_id, 'reviewer', r.reviewer_id, '->', found[0].id);
              continue;
            }

            const insertObj = Object.assign({}, r);
            delete insertObj.id;
            const { data: inserted, error: insertErr } = await supabase
              .from('reviews')
              .insert(insertObj)
              .select('id')
              .limit(1);
            if (insertErr) throw insertErr;
            if (Array.isArray(inserted) && inserted.length > 0) {
              console.log('Inserted review (fallback) for submission', r.submission_id, '->', inserted[0].id);
            } else if (inserted && inserted.id) {
              console.log('Inserted review (fallback) for submission', r.submission_id, '->', inserted.id);
            } else {
              throw new Error('Unexpected insert response for review (submission ' + r.submission_id + ')');
            }
          } catch (e) {
            console.error('Error handling review for submission', r.submission_id, e.message || e);
            throw e;
          }
        }
        console.log('Reviews processed (fallback).');
      }
    }

    console.log('\nSeed completed. Verify with queries in Supabase SQL editor:');
    console.log("SELECT id,email FROM auth.users WHERE email LIKE '%@test.com';");
    console.log("SELECT id,first_name,last_name,role FROM users WHERE email LIKE '%@test.com';");
    console.log("SELECT id,title FROM submissions WHERE id LIKE 'aaaaaaaa%';");
    console.log("SELECT id,submission_id,reviewer_id,status FROM reviews WHERE id LIKE 'review-%';");
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exitCode = 1;
  }
}

run();

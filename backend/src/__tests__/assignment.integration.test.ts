/// <reference types="jest" />
/// <reference types="node" />

import request from 'supertest';
import express from 'express';

// Mock the authenticate middleware so we can inject an editor context during the test.
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn()
}));

import reviewRoutes from '../routes/reviews';
import { authenticate } from '../middleware/auth';
import { databaseSeeder } from '../database/seeds';
import pool from '../config/database';
import { UserRepository } from '../models/UserRepository';

// Mock the authenticate middleware so we can inject an editor context during the test.
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn()
}));

const mockedAuthenticate = authenticate as any;
// Increase default timeout for slow local runs
jest.setTimeout(300000);
 // Removed stray 'a' line
// If editor/TS can't resolve @types/jest at workspace level, declare the common globals
// so the language server stops reporting missing symbols. These are only for editor-time
// recognition and do not affect runtime (Jest provides the implementations).
declare const jest: any;
declare function describe(name: string, fn: () => void): void;
declare function beforeAll(fn: () => Promise<void> | void, timeout?: number): void;
declare function beforeEach(fn: () => Promise<void> | void, timeout?: number): void;
declare function afterAll(fn: () => Promise<void> | void, timeout?: number): void;
declare function it(name: string, fn: () => Promise<void> | void, timeout?: number): void;
declare function expect(actual: any): any;

describe('Reviewer assignment end-to-end', () => {
  let app: express.Application;
  let editorId: string;
  let reviewerId: string;
  let manuscriptId: string;

  // Allow skipping DB setup when SKIP_DB_SETUP is set (so you can seed manually)
  if (!process.env.SKIP_DB_SETUP) {
    beforeAll(async () => {
    // Ensure we have a clean DB and seed baseline data (users, volumes, sample submissions)
    if (!pool) {
      throw new Error('Database pool is not configured; set local DB env vars (DB_HOST/DB_NAME/etc)');
    }

    await databaseSeeder.clearDatabase();
    await databaseSeeder.seedDatabase();

    // Create test users directly to avoid conflicts with other tests
    const editorEmail = `test-editor-${Date.now()}@test.com`;
    const reviewerEmail = `test-reviewer-${Date.now()}@test.com`;
    
    const { rows: editorRows } = await pool!.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, affiliation, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [editorEmail, 'hash', 'Test', 'Editor', 'Test Org', 'editor']);
    
    const { rows: reviewerRows } = await pool!.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, affiliation, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [reviewerEmail, 'hash', 'Test', 'Reviewer', 'Test Org', 'reviewer']);

    editorId = editorRows[0].id;
    reviewerId = reviewerRows[0].id;

    // Create both a submission and a manuscript with the same ID
    // This is needed because ReviewService checks submissions but ManuscriptRepository.assignReviewer uses manuscripts
    const testId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Fixed UUID for testing
    
    await pool!.query(`
      INSERT INTO submissions (id, title, abstract, keywords, author_id, status, manuscript_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      testId,
      'Integration Test Manuscript',
      'Test abstract for integration assignment flow',
      JSON.stringify(['test']),
      editorId,
      'submitted',
      'https://example.com/manuscript.pdf'
    ]);

    await pool!.query(`
      INSERT INTO manuscripts (id, title, abstract, content, keywords, authors, corresponding_author, author_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      testId,
      'Integration Test Manuscript',
      'Test abstract for integration assignment flow',
      'Test content',
      JSON.stringify(['test']),
      JSON.stringify(['Integration Author']),
      'author@example.com',
      editorId,
      'submitted'
    ]);

    manuscriptId = testId;
    }, 300000);
  } else {
    // When SKIP_DB_SETUP is set, assume the DB is already seeded externally.
    // Query the DB for seeded editor/reviewer/manuscript IDs so the test can run.
    beforeAll(async () => {
      if (!pool) {
        throw new Error('Database pool is not configured; set local DB env vars (DB_HOST/DB_NAME/etc)');
      }

      // Ensure seeded editor/reviewer exist
      const { rows: editors } = await pool!.query("SELECT id FROM users WHERE email = 'editor@africajournal.org' LIMIT 1");
      const { rows: reviewers } = await pool!.query("SELECT id FROM users WHERE email = 'reviewer1@university.ac.ug' LIMIT 1");

      // Prefer reading from `submissions` (many seeds populate this). If no submitted
      // row exists there, fall back to `manuscripts` even if the table exists but is empty.
      let manuscriptRowResult = await pool!.query("SELECT id FROM submissions WHERE status = 'submitted' LIMIT 1");
      if (!manuscriptRowResult.rows[0]) {
        // either submissions doesn't exist or has no submitted rows; try manuscripts
        manuscriptRowResult = await pool!.query("SELECT id FROM manuscripts WHERE status = 'submitted' LIMIT 1");
      }

      // Debug: log what we found so we can triage SKIP_DB_SETUP cases quickly
      // (this is a temporary test-only log; remove after debugging)
      // eslint-disable-next-line no-console
      console.log('SKIP_DB_SETUP DB check — editors:', editors, 'reviewers:', reviewers, 'manuscriptRowResult:', manuscriptRowResult.rows);

      if (!editors[0] || !reviewers[0] || !manuscriptRowResult.rows[0]) {
        throw new Error('Required seeded data not present in DB (editor/reviewer/manuscript/submission)');
      }

      editorId = editors[0].id;
      reviewerId = reviewers[0].id;
      manuscriptId = manuscriptRowResult.rows[0].id;
    }, 300000);
  }

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Make authenticate inject editor user for the assignment route
    // Cast to any to avoid strict handler return-type mismatch with Express types in tests
    (mockedAuthenticate as any).mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        userId: editorId,
        role: 'editor',
        email: 'editor@africajournal.org'
      };
      return (next as any)();
    });

    app.use('/api/reviews', reviewRoutes);
  });

  if (!process.env.SKIP_DB_SETUP) {
    afterAll(async () => {
      // Clean up and close pool
      await databaseSeeder.clearDatabase();
      if (pool) await pool.end();
    });
  } else {
    afterAll(async () => {
      if (pool) await pool.end();
    });
  }

  it('assigns a reviewer and creates a manuscript_reviews row', async () => {
    // Verify our test data exists before making the request
    const { rows: editorCheck } = await pool!.query('SELECT id, email FROM users WHERE id = $1', [editorId]);
    const { rows: reviewerCheck } = await pool!.query('SELECT id, email FROM users WHERE id = $1', [reviewerId]);
    const { rows: manuscriptCheck } = await pool!.query('SELECT id FROM manuscripts WHERE id = $1', [manuscriptId]);
    
    console.log('Pre-test data check:', { 
      editor: editorCheck[0], 
      reviewer: reviewerCheck[0],
      manuscript: manuscriptCheck[0],
      manuscriptId,
      sendingToAPI: { submissionId: manuscriptId, reviewerId }
    });

    const res = await request(app)
      .post('/api/reviews/assign')
      .send({ submissionId: manuscriptId, reviewerId });

    // Debug the error
    if (res.status !== 200) {
      console.log('Error response:', res.status, res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.reviewer).toBeDefined();
    expect(res.body.reviewer.id).toBe(reviewerId);

    // Verify the manuscript_reviews table has the assignment
    const { rows } = await pool!.query(
      'SELECT * FROM manuscript_reviews WHERE manuscript_id = $1 AND reviewer_id = $2',
      [manuscriptId, reviewerId]
    );

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].status).toBe('assigned');
  }, 20000);
});

/// <reference types="jest" />
/// <reference types="node" />

import request from 'supertest';
import express from 'express';
import reviewRoutes from '../routes/reviews';
import { authenticate } from '../middleware/auth';
import { databaseSeeder } from '../database/seeds';
import pool from '../config/database';
import { UserRepository } from '../models/UserRepository';
import { ManuscriptRepository } from '../models/ManuscriptRepository';

// Mock the authenticate middleware so we can inject an editor context during the test.
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn()
}));

const mockedAuthenticate = authenticate as any;

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

  beforeAll(async () => {
    // Ensure we have a clean DB and seed baseline data (users, volumes, sample submissions)
    if (!pool) {
      throw new Error('Database pool is not configured; set local DB env vars (DB_HOST/DB_NAME/etc)');
    }

    await databaseSeeder.clearDatabase();
    await databaseSeeder.seedDatabase();

    // Find seeded editor and reviewer
    const { rows: editors } = await pool!.query("SELECT id FROM users WHERE email = 'editor@africajournal.org' LIMIT 1");
    const { rows: reviewers } = await pool!.query("SELECT id FROM users WHERE email = 'reviewer1@university.ac.ug' LIMIT 1");

    if (!editors[0] || !reviewers[0]) {
      throw new Error('Seeded users not found');
    }

    editorId = editors[0].id;
    reviewerId = reviewers[0].id;

    // Create a manuscript using the ManuscriptRepository so it exists in manuscripts table
    const manuscriptRepo = new ManuscriptRepository();
    const created = await manuscriptRepo.create({
      title: 'Integration Test Manuscript',
      abstract: 'Test abstract for integration assignment flow',
      content: 'Test content',
      keywords: ['test'],
      authors: ['Integration Author'],
      corresponding_author: 'author@example.com',
      author_id: editors[0].id, // use editor as author for simplicity
      status: 'submitted'
    });

    manuscriptId = created.id;
  }, 30000);

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

  afterAll(async () => {
    // Clean up and close pool
    await databaseSeeder.clearDatabase();
    if (pool) await pool.end();
  });

  it('assigns a reviewer and creates a manuscript_reviews row', async () => {
    const res = await request(app)
      .post('/api/reviews/assign')
      .send({ submissionId: manuscriptId, reviewerId });

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

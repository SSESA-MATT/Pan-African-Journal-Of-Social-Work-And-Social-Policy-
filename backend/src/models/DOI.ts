import { Pool, PoolClient } from 'pg';
import { DOIMetadata, DOIRegistrationResult } from '../services/doiService';

export interface DOIRegistration {
  id: number;
  articleId: number;
  doi: string;
  status: 'pending' | 'registered' | 'failed' | 'updating';
  registrationDate?: Date;
  crossrefResponse?: any;
  metadata: DOIMetadata;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DOISequence {
  id: number;
  year: number;
  volume: number;
  issue: number;
  lastArticleNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export class DOIModel {
  constructor(private pool: Pool) {}

  /**
   * Create a new DOI registration record
   */
  async createRegistration(
    articleId: number,
    doi: string,
    metadata: DOIMetadata,
    status: 'pending' | 'registered' | 'failed' = 'pending'
  ): Promise<DOIRegistration> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert DOI registration
      const registrationResult = await client.query(`
        INSERT INTO doi_registrations (
          article_id, doi, status, metadata, retry_count
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [articleId, doi, status, JSON.stringify(metadata), 0]);

      // Update article with DOI and status
      await client.query(`
        UPDATE articles 
        SET doi = $1, doi_status = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [doi, status, articleId]);

      await client.query('COMMIT');

      return this.mapRegistrationRow(registrationResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update DOI registration status
   */
  async updateRegistrationStatus(
    registrationId: number,
    status: 'pending' | 'registered' | 'failed' | 'updating',
    result?: DOIRegistrationResult
  ): Promise<DOIRegistration> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      const updateFields = ['status = $2'];
      const updateValues = [registrationId, status];
      let paramIndex = 3;

      if (result) {
        if (result.registrationDate) {
          updateFields.push(`registration_date = $${paramIndex}`);
          updateValues.push(result.registrationDate);
          paramIndex++;
        }

        if (result.crossRefResponse) {
          updateFields.push(`crossref_response = $${paramIndex}`);
          updateValues.push(JSON.stringify(result.crossRefResponse));
          paramIndex++;
        }

        if (result.errors && result.errors.length > 0) {
          updateFields.push(`error_message = $${paramIndex}`);
          updateValues.push(result.errors.join('; '));
          paramIndex++;
        }

        if (status === 'failed') {
          updateFields.push(`retry_count = retry_count + 1`);
        }
      }

      const updateQuery = `
        UPDATE doi_registrations 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const registrationResult = await client.query(updateQuery, updateValues);

      if (registrationResult.rows.length === 0) {
        throw new Error(`DOI registration with ID ${registrationId} not found`);
      }

      const registration = registrationResult.rows[0];

      // Update article DOI status
      await client.query(`
        UPDATE articles 
        SET doi_status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [status, registration.article_id]);

      await client.query('COMMIT');

      return this.mapRegistrationRow(registration);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get DOI registration by ID
   */
  async getRegistrationById(id: number): Promise<DOIRegistration | null> {
    const result = await this.pool.query(`
      SELECT * FROM doi_registrations WHERE id = $1
    `, [id]);

    return result.rows.length > 0 ? this.mapRegistrationRow(result.rows[0]) : null;
  }

  /**
   * Get DOI registration by article ID
   */
  async getRegistrationByArticleId(articleId: number): Promise<DOIRegistration | null> {
    const result = await this.pool.query(`
      SELECT * FROM doi_registrations WHERE article_id = $1
    `, [articleId]);

    return result.rows.length > 0 ? this.mapRegistrationRow(result.rows[0]) : null;
  }

  /**
   * Get DOI registration by DOI string
   */
  async getRegistrationByDOI(doi: string): Promise<DOIRegistration | null> {
    const result = await this.pool.query(`
      SELECT * FROM doi_registrations WHERE doi = $1
    `, [doi]);

    return result.rows.length > 0 ? this.mapRegistrationRow(result.rows[0]) : null;
  }

  /**
   * Get all registrations with optional filtering
   */
  async getRegistrations(filters: {
    status?: string;
    limit?: number;
    offset?: number;
    articleId?: number;
  } = {}): Promise<{ registrations: DOIRegistration[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.articleId) {
      conditions.push(`article_id = $${paramIndex}`);
      values.push(filters.articleId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await this.pool.query(`
      SELECT COUNT(*) as total FROM doi_registrations ${whereClause}
    `, values);

    const total = parseInt(countResult.rows[0].total);

    // Get registrations with pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const dataResult = await this.pool.query(`
      SELECT * FROM doi_registrations 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...values, limit, offset]);

    const registrations = dataResult.rows.map(row => this.mapRegistrationRow(row));

    return { registrations, total };
  }

  /**
   * Get failed registrations that can be retried
   */
  async getRetryableRegistrations(maxRetries: number = 3): Promise<DOIRegistration[]> {
    const result = await this.pool.query(`
      SELECT * FROM doi_registrations 
      WHERE status = 'failed' AND retry_count < $1
      ORDER BY updated_at ASC
    `, [maxRetries]);

    return result.rows.map(row => this.mapRegistrationRow(row));
  }

  /**
   * Generate next DOI for given parameters
   */
  async generateNextDOI(
    prefix: string = '10.5555',
    year: number,
    volume: number,
    issue: number
  ): Promise<string> {
    const result = await this.pool.query(`
      SELECT generate_doi($1, $2, $3, $4) as doi
    `, [prefix, year, volume, issue]);

    return result.rows[0].doi;
  }

  /**
   * Get DOI sequence information
   */
  async getDOISequence(year: number, volume: number, issue: number): Promise<DOISequence | null> {
    const result = await this.pool.query(`
      SELECT * FROM doi_sequences 
      WHERE year = $1 AND volume = $2 AND issue = $3
    `, [year, volume, issue]);

    return result.rows.length > 0 ? this.mapSequenceRow(result.rows[0]) : null;
  }

  /**
   * Get all existing DOIs for conflict checking
   */
  async getExistingDOIs(): Promise<string[]> {
    const result = await this.pool.query(`
      SELECT doi FROM doi_registrations WHERE doi IS NOT NULL
      UNION
      SELECT doi FROM articles WHERE doi IS NOT NULL
    `);

    return result.rows.map(row => row.doi);
  }

  /**
   * Delete DOI registration
   */
  async deleteRegistration(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get registration info first
      const registrationResult = await client.query(`
        SELECT article_id FROM doi_registrations WHERE id = $1
      `, [id]);

      if (registrationResult.rows.length === 0) {
        return false;
      }

      const articleId = registrationResult.rows[0].article_id;

      // Delete registration
      await client.query(`DELETE FROM doi_registrations WHERE id = $1`, [id]);

      // Update article to remove DOI
      await client.query(`
        UPDATE articles 
        SET doi = NULL, doi_status = 'none', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [articleId]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Map database row to DOIRegistration object
   */
  private mapRegistrationRow(row: any): DOIRegistration {
    return {
      id: row.id,
      articleId: row.article_id,
      doi: row.doi,
      status: row.status,
      registrationDate: row.registration_date,
      crossrefResponse: row.crossref_response,
      metadata: row.metadata,
      errorMessage: row.error_message,
      retryCount: row.retry_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Map database row to DOISequence object
   */
  private mapSequenceRow(row: any): DOISequence {
    return {
      id: row.id,
      year: row.year,
      volume: row.volume,
      issue: row.issue,
      lastArticleNumber: row.last_article_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
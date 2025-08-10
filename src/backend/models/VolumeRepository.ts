import { BaseRepository } from './BaseRepository';
import { Volume, Issue } from './types';

export class VolumeRepository extends BaseRepository<Volume> {
  constructor() {
    super('volumes');
  }

  /**
   * Find volume by volume number
   */
  async findByVolumeNumber(volumeNumber: number): Promise<Volume | null> {
    const result = await this.query(
      'SELECT * FROM volumes WHERE volume_number = $1',
      [volumeNumber]
    );
    return result.rows[0] || null;
  }

  /**
   * Find volumes by year
   */
  async findByYear(year: number): Promise<Volume[]> {
    const result = await this.query(
      'SELECT * FROM volumes WHERE year = $1 ORDER BY volume_number DESC',
      [year]
    );
    return result.rows;
  }

  /**
   * Get volumes with their issues
   */
  async findWithIssues(): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        v.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', i.id,
              'issue_number', i.issue_number,
              'description', i.description,
              'published_at', i.published_at
            ) ORDER BY i.issue_number
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'
        ) as issues
      FROM volumes v
      LEFT JOIN issues i ON v.id = i.volume_id
      GROUP BY v.id
      ORDER BY v.volume_number DESC
    `);
    
    return result.rows;
  }

  /**
   * Get volume with issue count
   */
  async findWithIssueCounts(): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        v.*,
        COALESCE(i.issue_count, 0) as issue_count
      FROM volumes v
      LEFT JOIN (
        SELECT volume_id, COUNT(*) as issue_count
        FROM issues
        GROUP BY volume_id
      ) i ON v.id = i.volume_id
      ORDER BY v.volume_number DESC
    `);
    
    return result.rows;
  }

  /**
   * Get the latest volume
   */
  async findLatest(): Promise<Volume | null> {
    const result = await this.query(
      'SELECT * FROM volumes ORDER BY volume_number DESC LIMIT 1'
    );
    return result.rows[0] || null;
  }

  /**
   * Get volume statistics
   */
  async getVolumeStats(): Promise<{
    total_volumes: number;
    volumes_by_year: Record<string, number>;
    latest_volume: number | null;
  }> {
    const [totalResult, yearResult, latestResult] = await Promise.all([
      this.query('SELECT COUNT(*) as total FROM volumes'),
      this.query(`
        SELECT year, COUNT(*) as count
        FROM volumes
        GROUP BY year
        ORDER BY year DESC
      `),
      this.query('SELECT MAX(volume_number) as latest FROM volumes')
    ]);

    const volumesByYear: Record<string, number> = {};
    yearResult.rows.forEach((row: any) => {
      volumesByYear[row.year] = parseInt(row.count);
    });

    return {
      total_volumes: parseInt(totalResult.rows[0].total),
      volumes_by_year: volumesByYear,
      latest_volume: latestResult.rows[0].latest
    };
  }
}

export class IssueRepository extends BaseRepository<Issue> {
  constructor() {
    super('issues');
  }

  /**
   * Find issues by volume
   */
  async findByVolume(volumeId: string): Promise<Issue[]> {
    const result = await this.query(
      'SELECT * FROM issues WHERE volume_id = $1 ORDER BY issue_number ASC',
      [volumeId]
    );
    return result.rows;
  }

  /**
   * Find issue by volume and issue number
   */
  async findByVolumeAndIssueNumber(volumeId: string, issueNumber: number): Promise<Issue | null> {
    const result = await this.query(
      'SELECT * FROM issues WHERE volume_id = $1 AND issue_number = $2',
      [volumeId, issueNumber]
    );
    return result.rows[0] || null;
  }

  /**
   * Get issues with volume details
   */
  async findWithVolumeDetails(): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        i.*,
        v.volume_number,
        v.year,
        v.description as volume_description
      FROM issues i
      JOIN volumes v ON i.volume_id = v.id
      ORDER BY v.volume_number DESC, i.issue_number DESC
    `);
    
    return result.rows;
  }

  /**
   * Get issues with article counts
   */
  async findWithArticleCounts(): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        i.*,
        v.volume_number,
        v.year,
        COALESCE(a.article_count, 0) as article_count
      FROM issues i
      JOIN volumes v ON i.volume_id = v.id
      LEFT JOIN (
        SELECT issue_id, COUNT(*) as article_count
        FROM articles
        GROUP BY issue_id
      ) a ON i.id = a.issue_id
      ORDER BY v.volume_number DESC, i.issue_number DESC
    `);
    
    return result.rows;
  }

  /**
   * Get the latest issue
   */
  async findLatest(): Promise<any | null> {
    const result = await this.query(`
      SELECT 
        i.*,
        v.volume_number,
        v.year
      FROM issues i
      JOIN volumes v ON i.volume_id = v.id
      ORDER BY v.volume_number DESC, i.issue_number DESC
      LIMIT 1
    `);
    
    return result.rows[0] || null;
  }

  /**
   * Get issue statistics
   */
  async getIssueStats(): Promise<{
    total_issues: number;
    issues_by_volume: Record<string, number>;
    latest_issue: { volume_number: number; issue_number: number } | null;
  }> {
    const [totalResult, volumeResult, latestResult] = await Promise.all([
      this.query('SELECT COUNT(*) as total FROM issues'),
      this.query(`
        SELECT v.volume_number, COUNT(i.id) as count
        FROM issues i
        JOIN volumes v ON i.volume_id = v.id
        GROUP BY v.volume_number
        ORDER BY v.volume_number DESC
      `),
      this.query(`
        SELECT v.volume_number, i.issue_number
        FROM issues i
        JOIN volumes v ON i.volume_id = v.id
        ORDER BY v.volume_number DESC, i.issue_number DESC
        LIMIT 1
      `)
    ]);

    const issuesByVolume: Record<string, number> = {};
    volumeResult.rows.forEach((row: any) => {
      issuesByVolume[row.volume_number] = parseInt(row.count);
    });

    const latestIssue = latestResult.rows[0] ? {
      volume_number: latestResult.rows[0].volume_number,
      issue_number: latestResult.rows[0].issue_number
    } : null;

    return {
      total_issues: parseInt(totalResult.rows[0].total),
      issues_by_volume: issuesByVolume,
      latest_issue: latestIssue
    };
  }
}
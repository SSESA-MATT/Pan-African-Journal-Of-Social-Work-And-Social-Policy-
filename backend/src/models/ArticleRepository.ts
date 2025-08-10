import { BaseRepository } from './BaseRepository';
import { Article } from './types';

export class ArticleRepository extends BaseRepository<Article> {
  constructor() {
    super('articles');
  }

  /**
   * Find articles by issue
   */
  async findByIssue(issueId: string): Promise<Article[]> {
    const result = await this.query(
      'SELECT * FROM articles WHERE issue_id = $1 ORDER BY published_at DESC',
      [issueId]
    );
    return result.rows;
  }

  /**
   * Find published articles with issue and volume details
   */
  async findWithIssueDetails(): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        a.*,
        i.issue_number,
        i.description as issue_description,
        v.volume_number,
        v.year,
        v.description as volume_description
      FROM articles a
      JOIN issues i ON a.issue_id = i.id
      JOIN volumes v ON i.volume_id = v.id
      ORDER BY a.published_at DESC
    `);
    
    return result.rows;
  }

  /**
   * Search articles by title, abstract, or authors
   */
  async search(searchTerm: string): Promise<Article[]> {
    const result = await this.query(`
      SELECT * FROM articles
      WHERE 
        LOWER(title) LIKE LOWER($1) OR
        LOWER(abstract) LIKE LOWER($1) OR
        authors::text ILIKE $1
      ORDER BY published_at DESC
    `, [`%${searchTerm}%`]);
    
    return result.rows;
  }

  /**
   * Get articles by volume and issue
   */
  async findByVolumeAndIssue(volumeNumber: number, issueNumber: number): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        a.*,
        i.issue_number,
        v.volume_number,
        v.year
      FROM articles a
      JOIN issues i ON a.issue_id = i.id
      JOIN volumes v ON i.volume_id = v.id
      WHERE v.volume_number = $1 AND i.issue_number = $2
      ORDER BY a.published_at DESC
    `, [volumeNumber, issueNumber]);
    
    return result.rows;
  }

  /**
   * Get recent articles (for homepage)
   */
  async findRecent(limit: number = 10): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        a.*,
        i.issue_number,
        v.volume_number,
        v.year
      FROM articles a
      JOIN issues i ON a.issue_id = i.id
      JOIN volumes v ON i.volume_id = v.id
      ORDER BY a.published_at DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }

  /**
   * Get article statistics
   */
  async getArticleStats(): Promise<{
    total_articles: number;
    articles_by_year: Record<string, number>;
    articles_by_volume: Record<string, number>;
  }> {
    const [totalResult, yearResult, volumeResult] = await Promise.all([
      this.query('SELECT COUNT(*) as total FROM articles'),
      this.query(`
        SELECT v.year, COUNT(a.id) as count
        FROM articles a
        JOIN issues i ON a.issue_id = i.id
        JOIN volumes v ON i.volume_id = v.id
        GROUP BY v.year
        ORDER BY v.year DESC
      `),
      this.query(`
        SELECT v.volume_number, COUNT(a.id) as count
        FROM articles a
        JOIN issues i ON a.issue_id = i.id
        JOIN volumes v ON i.volume_id = v.id
        GROUP BY v.volume_number
        ORDER BY v.volume_number DESC
      `)
    ]);

    const articlesByYear: Record<string, number> = {};
    yearResult.rows.forEach((row: any) => {
      articlesByYear[row.year] = parseInt(row.count);
    });

    const articlesByVolume: Record<string, number> = {};
    volumeResult.rows.forEach((row: any) => {
      articlesByVolume[row.volume_number] = parseInt(row.count);
    });

    return {
      total_articles: parseInt(totalResult.rows[0].total),
      articles_by_year: articlesByYear,
      articles_by_volume: articlesByVolume
    };
  }

  /**
   * Get articles with pagination
   */
  async findWithPagination(page: number = 1, limit: number = 10): Promise<{
    articles: any[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;
    
    const [articlesResult, countResult] = await Promise.all([
      this.query(`
        SELECT 
          a.*,
          i.issue_number,
          v.volume_number,
          v.year
        FROM articles a
        JOIN issues i ON a.issue_id = i.id
        JOIN volumes v ON i.volume_id = v.id
        ORDER BY a.published_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]),
      this.query('SELECT COUNT(*) FROM articles')
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);
    
    return {
      articles: articlesResult.rows,
      total,
      totalPages,
      currentPage: page
    };
  }
}
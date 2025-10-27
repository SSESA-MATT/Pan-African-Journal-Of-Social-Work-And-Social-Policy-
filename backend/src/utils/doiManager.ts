import { Pool } from 'pg';
import { DOIService, DOIMetadata } from '../services/doiService';
import { DOIModel, DOIRegistration } from '../models/DOI';
import { getDOIServiceConfig, getJournalMetadata } from '../config/doi';

export interface ArticleData {
  id: number;
  title: string;
  authors: string;
  abstract?: string;
  publicationDate: Date;
  volume: number;
  issue: number;
  keywords?: string;
  language: string;
  url?: string;
}

export interface DOIGenerationOptions {
  forceRegenerate?: boolean;
  skipValidation?: boolean;
  customPrefix?: string;
}

export interface DOIBatchResult {
  successful: number;
  failed: number;
  results: Array<{
    articleId: number;
    doi?: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * High-level DOI management utility that coordinates between DOIService and DOIModel
 */
export class DOIManager {
  private doiService: DOIService;
  private doiModel: DOIModel;
  private journalMetadata: ReturnType<typeof getJournalMetadata>;

  constructor(pool: Pool) {
    const config = getDOIServiceConfig();
    this.doiService = new DOIService(config);
    this.doiModel = new DOIModel(pool);
    this.journalMetadata = getJournalMetadata();
  }

  /**
   * Generate and register DOI for a single article
   */
  async generateDOIForArticle(
    articleData: ArticleData,
    options: DOIGenerationOptions = {}
  ): Promise<{ success: boolean; doi?: string; registration?: DOIRegistration; error?: string }> {
    try {
      // Check if article already has a DOI
      const existingRegistration = await this.doiModel.getRegistrationByArticleId(articleData.id);
      
      if (existingRegistration && !options.forceRegenerate) {
        return {
          success: true,
          doi: existingRegistration.doi,
          registration: existingRegistration
        };
      }

      // Generate DOI
      const prefix = options.customPrefix || getDOIServiceConfig().doiPrefix;
      const doi = await this.doiModel.generateNextDOI(
        prefix,
        articleData.publicationDate.getFullYear(),
        articleData.volume,
        articleData.issue
      );

      // Prepare metadata
      const metadata = this.prepareMetadata(articleData, doi);

      // Validate DOI format if not skipped
      if (!options.skipValidation) {
        const validation = this.doiService.validateDOI(doi);
        if (!validation.isValid) {
          return {
            success: false,
            error: `DOI validation failed: ${validation.errors.join(', ')}`
          };
        }
      }

      // Create registration record
      const registration = await this.doiModel.createRegistration(
        articleData.id,
        doi,
        metadata,
        'pending'
      );

      // Register with CrossRef
      const registrationResult = await this.doiService.registerDOI(doi, metadata);

      // Update registration status
      const updatedRegistration = await this.doiModel.updateRegistrationStatus(
        registration.id,
        registrationResult.success ? 'registered' : 'failed',
        registrationResult
      );

      return {
        success: registrationResult.success,
        doi,
        registration: updatedRegistration,
        error: registrationResult.success ? undefined : registrationResult.message
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Batch generate DOIs for multiple articles
   */
  async batchGenerateDOIs(
    articles: ArticleData[],
    options: DOIGenerationOptions = {}
  ): Promise<DOIBatchResult> {
    const result: DOIBatchResult = {
      successful: 0,
      failed: 0,
      results: []
    };

    // Process articles in smaller batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (article) => {
        const doiResult = await this.generateDOIForArticle(article, options);
        
        const articleResult = {
          articleId: article.id,
          doi: doiResult.doi,
          success: doiResult.success,
          error: doiResult.error
        };

        if (doiResult.success) {
          result.successful++;
        } else {
          result.failed++;
        }

        return articleResult;
      });

      const batchResults = await Promise.all(batchPromises);
      result.results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < articles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return result;
  }

  /**
   * Retry failed DOI registrations
   */
  async retryFailedRegistrations(maxRetries: number = 3): Promise<{
    processed: number;
    successful: number;
    stillFailed: number;
  }> {
    const failedRegistrations = await this.doiModel.getRetryableRegistrations(maxRetries);
    
    let successful = 0;
    let stillFailed = 0;

    for (const registration of failedRegistrations) {
      try {
        // Retry registration with CrossRef
        const retryResult = await this.doiService.registerDOI(registration.doi, registration.metadata);
        
        // Update registration status
        await this.doiModel.updateRegistrationStatus(
          registration.id,
          retryResult.success ? 'registered' : 'failed',
          retryResult
        );

        if (retryResult.success) {
          successful++;
        } else {
          stillFailed++;
        }

        // Small delay between retries
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        stillFailed++;
        console.error(`Failed to retry DOI registration ${registration.id}:`, error);
      }
    }

    return {
      processed: failedRegistrations.length,
      successful,
      stillFailed
    };
  }

  /**
   * Update DOI metadata for existing registration
   */
  async updateDOIMetadata(
    articleId: number,
    updatedArticleData: ArticleData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const registration = await this.doiModel.getRegistrationByArticleId(articleId);
      
      if (!registration) {
        return { success: false, error: 'No DOI registration found for article' };
      }

      // Prepare updated metadata
      const metadata = this.prepareMetadata(updatedArticleData, registration.doi);

      // Update with CrossRef
      const updateResult = await this.doiService.updateDOIMetadata(registration.doi, metadata);

      // Update registration record
      await this.doiModel.updateRegistrationStatus(
        registration.id,
        updateResult.success ? 'registered' : 'failed',
        updateResult
      );

      return {
        success: updateResult.success,
        error: updateResult.success ? undefined : updateResult.message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check DOI status with CrossRef
   */
  async checkDOIStatus(doi: string): Promise<{
    exists: boolean;
    status?: string;
    metadata?: any;
    localRegistration?: DOIRegistration;
    error?: string;
  }> {
    try {
      // Check local registration
      const localRegistration = await this.doiModel.getRegistrationByDOI(doi);
      
      // Check with CrossRef
      const crossRefStatus = await this.doiService.checkDOIStatus(doi);

      return {
        exists: crossRefStatus.exists,
        status: crossRefStatus.status,
        metadata: crossRefStatus.metadata,
        localRegistration: localRegistration || undefined,
        error: crossRefStatus.error
      };
    } catch (error) {
      return {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get DOI statistics
   */
  async getDOIStatistics(): Promise<{
    total: number;
    registered: number;
    pending: number;
    failed: number;
    byYear: Record<number, number>;
    byVolume: Record<number, number>;
  }> {
    const { registrations } = await this.doiModel.getRegistrations({ limit: 10000 });
    
    const stats = {
      total: registrations.length,
      registered: 0,
      pending: 0,
      failed: 0,
      byYear: {} as Record<number, number>,
      byVolume: {} as Record<number, number>
    };

    registrations.forEach(registration => {
      // Count by status
      switch (registration.status) {
        case 'registered':
          stats.registered++;
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }

      // Extract year and volume from DOI
      const doiMatch = registration.doi.match(/pajswsp\.(\d{4})\.(\d{2})\./);
      if (doiMatch) {
        const year = parseInt(doiMatch[1]);
        const volume = parseInt(doiMatch[2]);
        
        stats.byYear[year] = (stats.byYear[year] || 0) + 1;
        stats.byVolume[volume] = (stats.byVolume[volume] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Prepare DOI metadata from article data
   */
  private prepareMetadata(articleData: ArticleData, doi: string): DOIMetadata {
    // Parse authors string into structured format
    const authors = this.parseAuthors(articleData.authors);
    
    // Generate article URL if not provided
    const url = articleData.url || `${this.journalMetadata.baseUrl}/articles/${articleData.id}`;

    return {
      title: articleData.title,
      authors,
      abstract: articleData.abstract,
      publicationDate: articleData.publicationDate,
      volume: articleData.volume,
      issue: articleData.issue,
      articleNumber: this.extractArticleNumber(doi),
      keywords: articleData.keywords ? articleData.keywords.split(',').map(k => k.trim()) : undefined,
      language: articleData.language,
      url,
      publisher: this.journalMetadata.publisher,
      journalTitle: this.journalMetadata.title,
      issn: this.journalMetadata.issn,
      eissn: this.journalMetadata.eissn
    };
  }

  /**
   * Parse authors string into structured format
   */
  private parseAuthors(authorsString: string): DOIMetadata['authors'] {
    return authorsString.split(',').map(author => {
      const trimmed = author.trim();
      const parts = trimmed.split(' ');
      
      if (parts.length >= 2) {
        const family = parts.pop() || '';
        const given = parts.join(' ');
        return { given, family };
      } else {
        return { family: trimmed };
      }
    });
  }

  /**
   * Extract article number from DOI
   */
  private extractArticleNumber(doi: string): number {
    const match = doi.match(/\.(\d{3})$/);
    return match ? parseInt(match[1]) : 1;
  }
}
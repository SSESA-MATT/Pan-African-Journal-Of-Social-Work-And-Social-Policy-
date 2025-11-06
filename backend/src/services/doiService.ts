import axios from 'axios';
import { z } from 'zod';

// DOI validation schema
const doiSchema = z.string().regex(
  /^10\.\d{4,}\/pajswsp\.\d{4}\.\d{2}\.\d{2}\.\d{3}$/,
  'DOI must follow format: 10.xxxx/pajswsp.YYYY.VV.II.NNN'
);

// CrossRef API response schemas
const crossRefResponseSchema = z.object({
  status: z.string(),
  'message-type': z.string(),
  'message-version': z.string(),
  message: z.object({
    DOI: z.string(),
    URL: z.string().optional(),
    title: z.array(z.string()).optional(),
    author: z.array(z.object({
      given: z.string().optional(),
      family: z.string().optional(),
      ORCID: z.string().optional()
    })).optional()
  }).optional()
});

export interface DOIMetadata {
  title: string;
  authors: Array<{
    given?: string;
    family: string;
    orcid?: string;
    affiliation?: string;
  }>;
  abstract?: string;
  publicationDate: Date;
  volume: number;
  issue: number;
  articleNumber: number;
  pages?: {
    first: string;
    last: string;
  };
  keywords?: string[];
  language: string;
  url: string;
  publisher: string;
  journalTitle: string;
  issn: string;
  eissn?: string;
}

export interface DOIRegistrationResult {
  success: boolean;
  doi: string;
  status: 'registered' | 'pending' | 'failed';
  message?: string;
  crossRefResponse?: any;
  registrationDate?: Date;
  errors?: string[];
}

export interface DOIValidationResult {
  isValid: boolean;
  doi?: string;
  errors: string[];
  format: {
    prefix: string;
    suffix: string;
    year: number;
    volume: number;
    issue: number;
    articleNumber: number;
  } | null;
}

export class DOIService {
  private crossRefApiUrl: string;
  private crossRefUsername: string;
  private crossRefPassword: string;
  private doiPrefix: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: {
    crossRefApiUrl?: string;
    crossRefUsername: string;
    crossRefPassword: string;
    doiPrefix?: string;
    maxRetries?: number;
    retryDelay?: number;
  }) {
    this.crossRefApiUrl = config.crossRefApiUrl || 'https://api.crossref.org';
    this.crossRefUsername = config.crossRefUsername;
    this.crossRefPassword = config.crossRefPassword;
    this.doiPrefix = config.doiPrefix || '10.5555'; // Default test prefix
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Generate a DOI following the format: 10.xxxx/pajswsp.YYYY.VV.II.NNN
   */
  generateDOI(year: number, volume: number, issue: number, articleNumber: number): string {
    const yearStr = year.toString();
    const volumeStr = volume.toString().padStart(2, '0');
    const issueStr = issue.toString().padStart(2, '0');
    const articleStr = articleNumber.toString().padStart(3, '0');
    
    return `${this.doiPrefix}/pajswsp.${yearStr}.${volumeStr}.${issueStr}.${articleStr}`;
  }

  /**
   * Validate DOI format and extract components
   */
  validateDOI(doi: string): DOIValidationResult {
    const result: DOIValidationResult = {
      isValid: false,
      errors: [],
      format: null
    };

    try {
      // Basic format validation
      const validationResult = doiSchema.safeParse(doi);
      if (!validationResult.success) {
        result.errors.push('Invalid DOI format. Expected: 10.xxxx/pajswsp.YYYY.VV.II.NNN');
        return result;
      }

      // Extract components using regex
      const match = doi.match(/^10\.(\d{4,})\/pajswsp\.(\d{4})\.(\d{2})\.(\d{2})\.(\d{3})$/);
      if (!match) {
        result.errors.push('Failed to parse DOI components');
        return result;
      }

      const [, prefix, year, volume, issue, articleNumber] = match;
      
      // Validate year (reasonable range)
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (yearNum < 2000 || yearNum > currentYear + 1) {
        result.errors.push(`Invalid year: ${yearNum}. Must be between 2000 and ${currentYear + 1}`);
      }

      // Validate volume and issue (must be positive)
      const volumeNum = parseInt(volume);
      const issueNum = parseInt(issue);
      const articleNum = parseInt(articleNumber);

      if (volumeNum < 1 || volumeNum > 99) {
        result.errors.push(`Invalid volume: ${volumeNum}. Must be between 1 and 99`);
      }

      if (issueNum < 1 || issueNum > 99) {
        result.errors.push(`Invalid issue: ${issueNum}. Must be between 1 and 99`);
      }

      if (articleNum < 1 || articleNum > 999) {
        result.errors.push(`Invalid article number: ${articleNum}. Must be between 1 and 999`);
      }

      if (result.errors.length === 0) {
        result.isValid = true;
        result.doi = doi;
        result.format = {
          prefix,
          suffix: `pajswsp.${year}.${volume}.${issue}.${articleNumber}`,
          year: yearNum,
          volume: volumeNum,
          issue: issueNum,
          articleNumber: articleNum
        };
      }

      return result;
    } catch (error) {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  } 
 /**
   * Register DOI with CrossRef
   */
  async registerDOI(doi: string, metadata: DOIMetadata): Promise<DOIRegistrationResult> {
    const result: DOIRegistrationResult = {
      success: false,
      doi,
      status: 'failed',
      errors: []
    };

    try {
      // Validate DOI format first
      const validation = this.validateDOI(doi);
      if (!validation.isValid) {
        result.errors = validation.errors;
        return result;
      }

      // Prepare CrossRef XML metadata
      const crossRefXML = this.buildCrossRefXML(doi, metadata);
      
      // Register with retry logic
      const registrationResponse = await this.registerWithRetry(crossRefXML);
      
      if (registrationResponse.success) {
        result.success = true;
        result.status = 'registered';
        result.crossRefResponse = registrationResponse.data;
        result.registrationDate = new Date();
        result.message = 'DOI successfully registered with CrossRef';
      } else {
        result.status = 'failed';
        result.errors = registrationResponse.errors || ['Registration failed'];
        result.message = registrationResponse.message || 'Failed to register DOI';
      }

      return result;
    } catch (error) {
      result.errors = result.errors || [];
      result.errors.push(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.message = 'Unexpected error during DOI registration';
      return result;
    }
  }

  /**
   * Check DOI status with CrossRef
   */
  async checkDOIStatus(doi: string): Promise<{
    exists: boolean;
    status?: string;
    metadata?: any;
    error?: string;
  }> {
    try {
      const response = await axios.get(`${this.crossRefApiUrl}/works/${doi}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Pan-African Journal of Social Work and Social Policy/1.0'
        },
        timeout: 10000
      });

      const validatedResponse = crossRefResponseSchema.safeParse(response.data);
      if (!validatedResponse.success) {
        return {
          exists: false,
          error: 'Invalid response format from CrossRef'
        };
      }

      return {
        exists: true,
        status: validatedResponse.data.status,
        metadata: validatedResponse.data.message
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return { exists: false };
        }
        return {
          exists: false,
          error: `CrossRef API error: ${error.response?.status} ${error.response?.statusText}`
        };
      }
      return {
        exists: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update DOI metadata with CrossRef
   */
  async updateDOIMetadata(doi: string, metadata: DOIMetadata): Promise<DOIRegistrationResult> {
    // For updates, we use the same registration process
    // CrossRef handles updates by overwriting existing metadata
    return this.registerDOI(doi, metadata);
  }

  /**
   * Build CrossRef XML for DOI registration
   */
  private buildCrossRefXML(doi: string, metadata: DOIMetadata): string {
    const timestamp = Date.now();
    const publicationYear = metadata.publicationDate.getFullYear();
    const publicationMonth = metadata.publicationDate.getMonth() + 1;
    const publicationDay = metadata.publicationDate.getDate();

    // Build authors XML
    const authorsXML = metadata.authors.map((author, index) => `
      <person_name sequence="${index === 0 ? 'first' : 'additional'}" contributor_role="author">
        ${author.given ? `<given_name>${this.escapeXML(author.given)}</given_name>` : ''}
        <surname>${this.escapeXML(author.family)}</surname>
        ${author.orcid ? `<ORCID authenticated="true">${author.orcid}</ORCID>` : ''}
        ${author.affiliation ? `<affiliation>${this.escapeXML(author.affiliation)}</affiliation>` : ''}
      </person_name>
    `).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="4.4.2" xmlns="http://www.crossref.org/schema/4.4.2" 
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
           xsi:schemaLocation="http://www.crossref.org/schema/4.4.2 
           http://www.crossref.org/schemas/crossref4.4.2.xsd">
  <head>
    <doi_batch_id>pajswsp_${timestamp}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>Pan-African Journal of Social Work and Social Policy</depositor_name>
      <email_address>editor@pajswsp.org</email_address>
    </depositor>
    <registrant>${metadata.publisher}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata language="${metadata.language}">
        <full_title>${this.escapeXML(metadata.journalTitle)}</full_title>
        <issn media_type="print">${metadata.issn}</issn>
        ${metadata.eissn ? `<issn media_type="electronic">${metadata.eissn}</issn>` : ''}
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <month>${publicationMonth.toString().padStart(2, '0')}</month>
          <day>${publicationDay.toString().padStart(2, '0')}</day>
          <year>${publicationYear}</year>
        </publication_date>
        <journal_volume>
          <volume>${metadata.volume}</volume>
        </journal_volume>
        <issue>${metadata.issue}</issue>
      </journal_issue>
      <journal_article publication_type="full_text" language="${metadata.language}">
        <titles>
          <title>${this.escapeXML(metadata.title)}</title>
        </titles>
        <contributors>
          ${authorsXML}
        </contributors>
        ${metadata.abstract ? `<jats:abstract xmlns:jats="http://www.ncbi.nlm.nih.gov/JATS1">
          <jats:p>${this.escapeXML(metadata.abstract)}</jats:p>
        </jats:abstract>` : ''}
        <publication_date media_type="online">
          <month>${publicationMonth.toString().padStart(2, '0')}</month>
          <day>${publicationDay.toString().padStart(2, '0')}</day>
          <year>${publicationYear}</year>
        </publication_date>
        ${metadata.pages ? `<pages>
          <first_page>${metadata.pages.first}</first_page>
          <last_page>${metadata.pages.last}</last_page>
        </pages>` : ''}
        <doi_data>
          <doi>${doi}</doi>
          <resource>${metadata.url}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;
  }

  /**
   * Register with retry logic
   */
  private async registerWithRetry(xmlData: string): Promise<{
    success: boolean;
    data?: any;
    errors?: string[];
    message?: string;
  }> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `${this.crossRefApiUrl}/deposits`,
          xmlData,
          {
            headers: {
              'Content-Type': 'application/vnd.crossref.deposit+xml',
              'User-Agent': 'Pan-African Journal of Social Work and Social Policy/1.0'
            },
            auth: {
              username: this.crossRefUsername,
              password: this.crossRefPassword
            },
            timeout: 30000
          }
        );

        return {
          success: true,
          data: response.data
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    return {
      success: false,
      errors: [`Failed after ${this.maxRetries} attempts`],
      message: lastError?.message || 'Registration failed'
    };
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate next available DOI for a given year, volume, and issue
   */
  async generateNextDOI(year: number, volume: number, issue: number, existingDOIs: string[]): Promise<string> {
    let articleNumber = 1;
    let doi: string;

    do {
      doi = this.generateDOI(year, volume, issue, articleNumber);
      articleNumber++;
    } while (existingDOIs.includes(doi) && articleNumber <= 999);

    if (articleNumber > 999) {
      throw new Error(`No available DOI numbers for ${year}, volume ${volume}, issue ${issue}`);
    }

    return doi;
  }

  /**
   * Batch register multiple DOIs
   */
  async batchRegisterDOIs(registrations: Array<{ doi: string; metadata: DOIMetadata }>): Promise<DOIRegistrationResult[]> {
    const results: DOIRegistrationResult[] = [];
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < registrations.length; i += batchSize) {
      const batch = registrations.slice(i, i + batchSize);
      
      const batchPromises = batch.map(({ doi, metadata }) => 
        this.registerDOI(doi, metadata)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < registrations.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}
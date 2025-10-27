import { z } from 'zod';

// DOI configuration schema
const doiConfigSchema = z.object({
  crossref: z.object({
    apiUrl: z.string().url().default('https://api.crossref.org'),
    testApiUrl: z.string().url().default('https://test.crossref.org'),
    username: z.string().min(1, 'CrossRef username is required'),
    password: z.string().min(1, 'CrossRef password is required'),
    useTestApi: z.boolean().default(false)
  }),
  doi: z.object({
    prefix: z.string().regex(/^\d{2}\.\d{4,}$/, 'DOI prefix must be in format XX.XXXX').default('10.5555'),
    suffix: z.string().default('pajswsp'),
    maxRetries: z.number().int().min(1).max(10).default(3),
    retryDelay: z.number().int().min(100).max(10000).default(1000)
  }),
  journal: z.object({
    title: z.string().default('Pan-African Journal of Social Work and Social Policy'),
    issn: z.string().regex(/^\d{4}-\d{3}[\dX]$/, 'ISSN must be in format XXXX-XXXX').default('2789-6234'),
    eissn: z.string().regex(/^\d{4}-\d{3}[\dX]$/, 'eISSN must be in format XXXX-XXXX').optional(),
    publisher: z.string().default('Pan-African Journal of Social Work and Social Policy'),
    language: z.string().length(2).default('en'),
    baseUrl: z.string().url().default('https://pajswsp.org')
  }),
  email: z.object({
    depositorName: z.string().default('Pan-African Journal of Social Work and Social Policy'),
    depositorEmail: z.string().email().default('editor@pajswsp.org'),
    notificationEmail: z.string().email().optional()
  })
});

export type DOIConfig = z.infer<typeof doiConfigSchema>;

/**
 * Load and validate DOI configuration from environment variables
 */
export function loadDOIConfig(): DOIConfig {
  const config = {
    crossref: {
      apiUrl: process.env.CROSSREF_API_URL,
      testApiUrl: process.env.CROSSREF_TEST_API_URL,
      username: process.env.CROSSREF_USERNAME,
      password: process.env.CROSSREF_PASSWORD,
      useTestApi: process.env.NODE_ENV !== 'production' || process.env.CROSSREF_USE_TEST_API === 'true'
    },
    doi: {
      prefix: process.env.DOI_PREFIX,
      suffix: process.env.DOI_SUFFIX,
      maxRetries: process.env.DOI_MAX_RETRIES ? parseInt(process.env.DOI_MAX_RETRIES) : undefined,
      retryDelay: process.env.DOI_RETRY_DELAY ? parseInt(process.env.DOI_RETRY_DELAY) : undefined
    },
    journal: {
      title: process.env.JOURNAL_TITLE,
      issn: process.env.JOURNAL_ISSN,
      eissn: process.env.JOURNAL_EISSN,
      publisher: process.env.JOURNAL_PUBLISHER,
      language: process.env.JOURNAL_LANGUAGE,
      baseUrl: process.env.JOURNAL_BASE_URL
    },
    email: {
      depositorName: process.env.DOI_DEPOSITOR_NAME,
      depositorEmail: process.env.DOI_DEPOSITOR_EMAIL,
      notificationEmail: process.env.DOI_NOTIFICATION_EMAIL
    }
  };

  try {
    return doiConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`DOI configuration validation failed:\n${missingFields.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Get DOI service configuration with environment-specific settings
 */
export function getDOIServiceConfig(): {
  crossRefApiUrl: string;
  crossRefUsername: string;
  crossRefPassword: string;
  doiPrefix: string;
  maxRetries: number;
  retryDelay: number;
} {
  const config = loadDOIConfig();
  
  return {
    crossRefApiUrl: config.crossref.useTestApi ? config.crossref.testApiUrl : config.crossref.apiUrl,
    crossRefUsername: config.crossref.username,
    crossRefPassword: config.crossref.password,
    doiPrefix: config.doi.prefix,
    maxRetries: config.doi.maxRetries,
    retryDelay: config.doi.retryDelay
  };
}

/**
 * Get journal metadata for DOI registration
 */
export function getJournalMetadata() {
  const config = loadDOIConfig();
  return {
    title: config.journal.title,
    issn: config.journal.issn,
    eissn: config.journal.eissn,
    publisher: config.journal.publisher,
    language: config.journal.language,
    baseUrl: config.journal.baseUrl
  };
}

/**
 * Get email configuration for DOI notifications
 */
export function getEmailConfig() {
  const config = loadDOIConfig();
  return {
    depositorName: config.email.depositorName,
    depositorEmail: config.email.depositorEmail,
    notificationEmail: config.email.notificationEmail
  };
}

/**
 * Validate DOI configuration on startup
 */
export function validateDOIConfiguration(): { valid: boolean; errors: string[] } {
  try {
    loadDOIConfig();
    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof Error ? [error.message] : ['Unknown configuration error']
    };
  }
}

/**
 * Get example environment variables for DOI configuration
 */
export function getExampleEnvVars(): Record<string, string> {
  return {
    // CrossRef API Configuration
    CROSSREF_USERNAME: 'your_crossref_username',
    CROSSREF_PASSWORD: 'your_crossref_password',
    CROSSREF_USE_TEST_API: 'true',
    
    // DOI Configuration
    DOI_PREFIX: '10.5555',
    DOI_SUFFIX: 'pajswsp',
    DOI_MAX_RETRIES: '3',
    DOI_RETRY_DELAY: '1000',
    
    // Journal Information
    JOURNAL_TITLE: 'Pan-African Journal of Social Work and Social Policy',
    JOURNAL_ISSN: '2789-6234',
    JOURNAL_EISSN: '2789-6242',
    JOURNAL_PUBLISHER: 'Pan-African Journal of Social Work and Social Policy',
    JOURNAL_LANGUAGE: 'en',
    JOURNAL_BASE_URL: 'https://pajswsp.org',
    
    // Email Configuration
    DOI_DEPOSITOR_NAME: 'Pan-African Journal of Social Work and Social Policy',
    DOI_DEPOSITOR_EMAIL: 'editor@pajswsp.org',
    DOI_NOTIFICATION_EMAIL: 'admin@pajswsp.org'
  };
}
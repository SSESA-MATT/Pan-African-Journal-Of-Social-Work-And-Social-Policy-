import { DOIService, DOIMetadata } from '../doiService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DOIService', () => {
  let doiService: DOIService;
  
  const mockConfig = {
    crossRefUsername: 'test_user',
    crossRefPassword: 'test_pass',
    doiPrefix: '10.5555',
    maxRetries: 2,
    retryDelay: 100
  };

  const mockMetadata: DOIMetadata = {
    title: 'Test Article Title',
    authors: [
      { given: 'John', family: 'Doe', orcid: '0000-0000-0000-0000' },
      { family: 'Smith' }
    ],
    abstract: 'This is a test abstract',
    publicationDate: new Date('2024-01-15'),
    volume: 1,
    issue: 1,
    articleNumber: 1,
    pages: { first: '1', last: '10' },
    keywords: ['test', 'article'],
    language: 'en',
    url: 'https://pajswsp.org/articles/test',
    publisher: 'Test Publisher',
    journalTitle: 'Test Journal',
    issn: '1234-5678'
  };

  beforeEach(() => {
    doiService = new DOIService(mockConfig);
    jest.clearAllMocks();
  });

  describe('generateDOI', () => {
    it('should generate DOI with correct format', () => {
      const doi = doiService.generateDOI(2024, 1, 2, 5);
      expect(doi).toBe('10.5555/pajswsp.2024.01.02.005');
    });

    it('should pad numbers correctly', () => {
      const doi = doiService.generateDOI(2024, 15, 3, 123);
      expect(doi).toBe('10.5555/pajswsp.2024.15.03.123');
    });
  });

  describe('validateDOI', () => {
    it('should validate correct DOI format', () => {
      const result = doiService.validateDOI('10.5555/pajswsp.2024.01.02.005');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.format).toEqual({
        prefix: '5555',
        suffix: 'pajswsp.2024.01.02.005',
        year: 2024,
        volume: 1,
        issue: 2,
        articleNumber: 5
      });
    });

    it('should reject invalid DOI format', () => {
      const result = doiService.validateDOI('invalid-doi');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid DOI format. Expected: 10.xxxx/pajswsp.YYYY.VV.II.NNN');
    });

    it('should reject invalid year', () => {
      const result = doiService.validateDOI('10.5555/pajswsp.1999.01.02.005');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid year: 1999. Must be between 2000 and 2025');
    });

    it('should reject invalid volume', () => {
      const result = doiService.validateDOI('10.5555/pajswsp.2024.00.02.005');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid volume: 0. Must be between 1 and 99');
    });

    it('should reject invalid issue', () => {
      const result = doiService.validateDOI('10.5555/pajswsp.2024.01.00.005');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid issue: 0. Must be between 1 and 99');
    });

    it('should reject invalid article number', () => {
      const result = doiService.validateDOI('10.5555/pajswsp.2024.01.02.000');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid article number: 0. Must be between 1 and 999');
    });
  });

  describe('registerDOI', () => {
    const validDOI = '10.5555/pajswsp.2024.01.01.001';

    it('should successfully register DOI', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { status: 'success', message: 'DOI registered' }
      });

      const result = await doiService.registerDOI(validDOI, mockMetadata);

      expect(result.success).toBe(true);
      expect(result.status).toBe('registered');
      expect(result.doi).toBe(validDOI);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should fail with invalid DOI format', async () => {
      const result = await doiService.registerDOI('invalid-doi', mockMetadata);

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
      expect(result.errors).toContain('Invalid DOI format. Expected: 10.xxxx/pajswsp.YYYY.VV.II.NNN');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should retry on failure', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { status: 'success', message: 'DOI registered' }
        });

      const result = await doiService.registerDOI(validDOI, mockMetadata);

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const result = await doiService.registerDOI(validDOI, mockMetadata);

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2); // maxRetries = 2
    });
  });

  describe('checkDOIStatus', () => {
    const validDOI = '10.5555/pajswsp.2024.01.01.001';

    it('should return existing DOI status', async () => {
      const mockResponse = {
        status: 'ok',
        'message-type': 'work',
        'message-version': '1.0.0',
        message: {
          DOI: validDOI,
          title: ['Test Article']
        }
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await doiService.checkDOIStatus(validDOI);

      expect(result.exists).toBe(true);
      expect(result.status).toBe('ok');
      expect(result.metadata).toEqual(mockResponse.message);
    });

    it('should return false for non-existent DOI', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404, statusText: 'Not Found' }
      });

      const result = await doiService.checkDOIStatus(validDOI);

      expect(result.exists).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 500, statusText: 'Internal Server Error' }
      });

      const result = await doiService.checkDOIStatus(validDOI);

      expect(result.exists).toBe(false);
      expect(result.error).toBe('CrossRef API error: 500 Internal Server Error');
    });
  });

  describe('generateNextDOI', () => {
    it('should generate next available DOI', async () => {
      const existingDOIs = [
        '10.5555/pajswsp.2024.01.01.001',
        '10.5555/pajswsp.2024.01.01.002'
      ];

      const nextDOI = await doiService.generateNextDOI(2024, 1, 1, existingDOIs);

      expect(nextDOI).toBe('10.5555/pajswsp.2024.01.01.003');
    });

    it('should throw error when no DOI numbers available', async () => {
      const existingDOIs = Array.from({ length: 999 }, (_, i) => 
        `10.5555/pajswsp.2024.01.01.${(i + 1).toString().padStart(3, '0')}`
      );

      await expect(
        doiService.generateNextDOI(2024, 1, 1, existingDOIs)
      ).rejects.toThrow('No available DOI numbers for 2024, volume 1, issue 1');
    });
  });

  describe('batchRegisterDOIs', () => {
    it('should register multiple DOIs in batches', async () => {
      const registrations = [
        { doi: '10.5555/pajswsp.2024.01.01.001', metadata: mockMetadata },
        { doi: '10.5555/pajswsp.2024.01.01.002', metadata: mockMetadata }
      ];

      mockedAxios.post.mockResolvedValue({
        data: { status: 'success', message: 'DOI registered' }
      });

      const results = await doiService.batchRegisterDOIs(registrations);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('buildCrossRefXML', () => {
    it('should build valid CrossRef XML', () => {
      // Access private method for testing
      const xml = (doiService as any).buildCrossRefXML('10.5555/pajswsp.2024.01.01.001', mockMetadata);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<doi_batch version="4.4.2"');
      expect(xml).toContain('<doi>10.5555/pajswsp.2024.01.01.001</doi>');
      expect(xml).toContain('<title>Test Article Title</title>');
      expect(xml).toContain('<given_name>John</given_name>');
      expect(xml).toContain('<surname>Doe</surname>');
      expect(xml).toContain('<ORCID authenticated="true">0000-0000-0000-0000</ORCID>');
    });

    it('should escape XML special characters', () => {
      const metadataWithSpecialChars = {
        ...mockMetadata,
        title: 'Test & Article <Title> "With" \'Quotes\'',
        abstract: 'Abstract with <tags> & "quotes"'
      };

      const xml = (doiService as any).buildCrossRefXML('10.5555/pajswsp.2024.01.01.001', metadataWithSpecialChars);

      expect(xml).toContain('Test &amp; Article &lt;Title&gt; &quot;With&quot; &apos;Quotes&apos;');
      expect(xml).toContain('Abstract with &lt;tags&gt; &amp; &quot;quotes&quot;');
    });
  });
});
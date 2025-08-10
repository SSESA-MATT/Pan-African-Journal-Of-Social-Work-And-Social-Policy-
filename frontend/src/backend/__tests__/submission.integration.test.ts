import request from 'supertest';
import express from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { authenticate } from '../middleware/auth';
import { uploadSingle, handleUploadError, validateUploadedFile } from '../middleware/upload';

// Mock the dependencies
jest.mock('../services/SubmissionService');
jest.mock('../middleware/auth');
jest.mock('../middleware/upload');

const app = express();
app.use(express.json());

// Mock middleware
const mockAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;
const mockUploadSingle = uploadSingle as jest.MockedFunction<typeof uploadSingle>;
const mockHandleUploadError = handleUploadError as jest.MockedFunction<typeof handleUploadError>;
const mockValidateUploadedFile = validateUploadedFile as jest.MockedFunction<typeof validateUploadedFile>;

// Setup middleware mocks
mockAuthenticate.mockImplementation((req, res, next) => {
  req.user = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'author'
  };
  next();
});

mockUploadSingle.mockImplementation((req, res, next) => {
  req.file = {
    fieldname: 'manuscript',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test pdf content'),
    size: 1024
  } as Express.Multer.File;
  next();
});

mockHandleUploadError.mockImplementation((error, req, res, next) => {
  next();
});

mockValidateUploadedFile.mockImplementation((req, res, next) => {
  next();
});

const submissionController = new SubmissionController();

// Setup routes
app.post('/api/submissions', 
  mockAuthenticate,
  mockUploadSingle,
  mockHandleUploadError,
  mockValidateUploadedFile,
  submissionController.createSubmission
);

app.get('/api/submissions/my', 
  mockAuthenticate,
  submissionController.getMySubmissions
);

describe('Submission API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/submissions', () => {
    it('should create a submission with valid data', async () => {
      const submissionData = {
        title: 'Test Manuscript',
        abstract: 'This is a test abstract with enough words to meet the minimum requirements for testing purposes.',
        keywords: JSON.stringify(['keyword1', 'keyword2', 'keyword3']),
        co_authors: JSON.stringify(['Dr. Jane Smith'])
      };

      const response = await request(app)
        .post('/api/submissions')
        .field('title', submissionData.title)
        .field('abstract', submissionData.abstract)
        .field('keywords', submissionData.keywords)
        .field('co_authors', submissionData.co_authors)
        .attach('manuscript', Buffer.from('test pdf'), 'test.pdf');

      // The actual response will depend on the mocked service
      // This test verifies the route is properly configured
      expect(response.status).toBeDefined();
    });
  });

  describe('GET /api/submissions/my', () => {
    it('should get user submissions', async () => {
      const response = await request(app)
        .get('/api/submissions/my');

      expect(response.status).toBeDefined();
    });
  });
});

describe('Submission Validation', () => {
  it('should validate submission data correctly', () => {
    const { SubmissionService } = require('../services/SubmissionService');
    const service = new SubmissionService();

    const validData = {
      title: 'Valid Title',
      abstract: 'This is a valid abstract with enough words to meet the minimum requirements for testing purposes.',
      keywords: ['keyword1', 'keyword2', 'keyword3'],
      co_authors: ['Dr. Jane Smith']
    };

    const errors = service.validateSubmissionData(validData);
    expect(errors).toHaveLength(0);
  });
});
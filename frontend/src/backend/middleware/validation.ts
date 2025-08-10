import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Base validation middleware that takes a Zod schema
export const validateRequest = (schema: z.ZodSchema, type: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate;
      
      switch (type) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }
      
      const validatedData = schema.parse(dataToValidate);
      
      // Replace the original data with the validated data
      switch (type) {
        case 'body':
          req.body = validatedData;
          break;
        case 'query':
          req.query = validatedData as any;
          break;
        case 'params':
          req.params = validatedData as any;
          break;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      next(error);
    }
  };
};

// Extended validation schemas for different parts of the application
// ================================================================

// Submission validation schema
export const submissionSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  abstract: z
    .string()
    .min(100, 'Abstract must be at least 100 characters long')
    .max(5000, 'Abstract must be less than 5000 characters')
    .trim(),
  keywords: z
    .array(z.string())
    .min(3, 'At least 3 keywords are required')
    .max(8, 'Maximum of 8 keywords allowed'),
  authors: z
    .array(
      z.object({
        name: z.string().min(1, 'Author name is required'),
        email: z.string().email('Invalid email format').optional(),
        affiliation: z.string().optional(),
        isCorresponding: z.boolean().optional().default(false),
      })
    )
    .min(1, 'At least one author is required'),
  submissionType: z
    .enum(['article', 'review', 'case-study', 'research'], {
      errorMap: () => ({
        message:
          'Submission type must be one of: article, review, case-study, research',
      }),
    })
    .default('article'),
  comments: z
    .string()
    .max(1000, 'Comments must be less than 1000 characters')
    .optional(),
});

// Review validation schema
export const reviewSchema = z.object({
  submissionId: z.string().uuid('Invalid submission ID'),
  recommendation: z.enum(['accept', 'minor-revisions', 'major-revisions', 'reject'], {
    errorMap: () => ({
      message:
        'Recommendation must be one of: accept, minor-revisions, major-revisions, reject',
    }),
  }),
  comments: z
    .string()
    .min(50, 'Review comments must be at least 50 characters long')
    .max(5000, 'Review comments must be less than 5000 characters'),
  privateComments: z
    .string()
    .max(2000, 'Private comments must be less than 2000 characters')
    .optional(),
  reviewCriteria: z.object({
    methodologyScore: z.number().min(1).max(5),
    significanceScore: z.number().min(1).max(5),
    noveltyScore: z.number().min(1).max(5),
    presentationScore: z.number().min(1).max(5),
    literatureScore: z.number().min(1).max(5),
  }),
});

// User query params schema
export const userQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Page must be a number',
    })
    .transform((val) => (val ? Number(val) : 1)),
  limit: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Limit must be a number',
    })
    .transform((val) => (val ? Number(val) : 10)),
  role: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        ['author', 'reviewer', 'editor', 'admin'].includes(val),
      {
        message: 'Role must be one of: author, reviewer, editor, admin',
      }
    ),
  search: z.string().optional(),
});

// Article query params schema
export const articleQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Page must be a number',
    })
    .transform((val) => (val ? Number(val) : 1)),
  limit: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Limit must be a number',
    })
    .transform((val) => (val ? Number(val) : 12)),
  category: z.string().optional(),
  search: z.string().optional(),
  author: z.string().optional(),
  year: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Year must be a number',
    }),
  volume: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Volume must be a number',
    }),
  issue: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Issue must be a number',
    }),
  sort: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || ['newest', 'oldest', 'title-asc', 'title-desc'].includes(val),
      {
        message: 'Sort must be one of: newest, oldest, title-asc, title-desc',
      }
    ),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

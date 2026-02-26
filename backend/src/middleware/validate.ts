import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Validate request body/query/params against a Zod schema
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    // Replace the source with the parsed (and potentially transformed) data
    (req as any)[source] = result.data;
    next();
  };
};

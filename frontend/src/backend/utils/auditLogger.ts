import { Request } from 'express';
import { pool } from '../database';
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'audit-service' },
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'info.log'), level: 'info' }),
    new winston.transports.File({ filename: path.join(logDir, 'access.log') })
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

interface AuditLogEntry {
  userId?: number;
  action: string;
  entityType?: string;
  entityId?: string | number;
  ipAddress?: string;
  userAgent?: string;
  requestData?: Record<string, any>;
  additionalDetails?: Record<string, any>;
  status: 'success' | 'failed' | 'warning';
}

/**
 * Service for logging audit events
 */
export class AuditLogger {
  /**
   * Log an audit event to both database and file
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      if (!pool) {
        throw new Error('Database pool not available');
      }
      
      // Log to database
      await pool.query(
        `INSERT INTO audit_logs 
        (user_id, action, entity_type, entity_id, ip_address, user_agent, request_data, additional_details, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          entry.userId,
          entry.action,
          entry.entityType,
          entry.entityId ? String(entry.entityId) : null,
          entry.ipAddress,
          entry.userAgent,
          entry.requestData ? JSON.stringify(entry.requestData) : null,
          entry.additionalDetails ? JSON.stringify(entry.additionalDetails) : null,
          entry.status
        ]
      );
    } catch (error) {
      // If database logging fails, ensure we still have a file record
      logger.error('Failed to write audit log to database', {
        error: error instanceof Error ? error.message : String(error),
        entry
      });
    }

    // Always log to file
    logger.info('Audit event', { ...entry });
  }

  /**
   * Log from an Express request
   */
  static async logFromRequest(
    req: Request, 
    action: string, 
    status: 'success' | 'failed' | 'warning' = 'success', 
    entityType?: string,
    entityId?: string | number,
    additionalDetails?: Record<string, any>
  ): Promise<void> {
    const userId = (req as any).user?.id; // Type assertion for user property
    const ipAddress = req.ip || 
                      req.headers['x-forwarded-for'] as string || 
                      'unknown';
                      
    // Safely extract request data, excluding sensitive fields
    const requestData = this.sanitizeRequestData(req);

    await this.log({
      userId,
      action,
      entityType,
      entityId,
      ipAddress,
      userAgent: req.headers['user-agent'],
      requestData,
      additionalDetails,
      status,
    });
  }

  /**
   * Query audit logs
   */
  static async query(options: {
    userId?: number;
    action?: string;
    entityType?: string;
    entityId?: string | number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    ipAddress?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    if (!pool) {
      throw new Error('Database pool not available');
    }
    
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (options.userId !== undefined) {
      conditions.push(`user_id = $${paramCount++}`);
      values.push(options.userId);
    }

    if (options.action) {
      conditions.push(`action = $${paramCount++}`);
      values.push(options.action);
    }

    if (options.entityType) {
      conditions.push(`entity_type = $${paramCount++}`);
      values.push(options.entityType);
    }

    if (options.entityId !== undefined) {
      conditions.push(`entity_id = $${paramCount++}`);
      values.push(String(options.entityId));
    }

    if (options.status) {
      conditions.push(`status = $${paramCount++}`);
      values.push(options.status);
    }

    if (options.ipAddress) {
      conditions.push(`ip_address = $${paramCount++}`);
      values.push(options.ipAddress);
    }

    if (options.startDate) {
      conditions.push(`timestamp >= $${paramCount++}`);
      values.push(options.startDate);
    }

    if (options.endDate) {
      conditions.push(`timestamp <= $${paramCount++}`);
      values.push(options.endDate);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const limitClause = options.limit 
      ? `LIMIT $${paramCount++}` 
      : '';
    
    if (options.limit) {
      values.push(options.limit);
    }
    
    const offsetClause = options.offset !== undefined 
      ? `OFFSET $${paramCount++}` 
      : '';
      
    if (options.offset !== undefined) {
      values.push(options.offset);
    }

    const query = `
      SELECT * FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
      ${limitClause}
      ${offsetClause}
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      logger.error('Failed to query audit logs', {
        error: error instanceof Error ? error.message : String(error),
        query,
        options
      });
      throw error;
    }
  }

  /**
   * Extract relevant request data while excluding sensitive fields
   */
  private static sanitizeRequestData(req: Request): Record<string, any> {
    // List of sensitive fields to redact
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 
                           'credit_card', 'cardNumber', 'cvv'];
    
    // Extract basic request info
    const requestData: Record<string, any> = {
      method: req.method,
      path: req.path,
      query: {},
      body: {}
    };

    // Safely extract and sanitize query parameters
    if (req.query) {
      for (const key in req.query) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          requestData.query[key] = '[REDACTED]';
        } else {
          requestData.query[key] = req.query[key];
        }
      }
    }

    // Safely extract and sanitize request body
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          requestData.body[key] = '[REDACTED]';
        } else {
          // Avoid logging large file uploads
          if (
            req.body[key] !== null && 
            typeof req.body[key] === 'object' && 
            (req.body[key] instanceof Buffer || 
             (req.body[key].data instanceof Buffer))
          ) {
            requestData.body[key] = '[FILE DATA]';
          } else {
            requestData.body[key] = req.body[key];
          }
        }
      }
    }

    return requestData;
  }
}

export default AuditLogger;

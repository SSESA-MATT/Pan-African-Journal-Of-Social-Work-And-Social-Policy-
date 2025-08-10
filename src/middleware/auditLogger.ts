import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import pool from '../config/database';

// Log levels
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Audit log interface
interface AuditLog {
  level: LogLevel;
  userId?: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  path: string;
  method: string;
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const infoLogPath = path.join(logsDir, 'info.log');
const errorLogPath = path.join(logsDir, 'error.log');
const accessLogPath = path.join(logsDir, 'access.log');

/**
 * Write log to file
 */
const writeToFile = (filePath: string, message: string): void => {
  fs.appendFile(filePath, message + '\n', (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
};

/**
 * Save audit log to database
 */
const saveToDatabase = async (log: AuditLog): Promise<void> => {
  try {
    if (!pool) {
      throw new Error('Database pool not available');
    }
    
    const query = `
      INSERT INTO audit_logs (
        level, user_id, action, details, ip_address, user_agent, timestamp, path, method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    await pool.query(query, [
      log.level,
      log.userId || null,
      log.action,
      log.details,
      log.ipAddress,
      log.userAgent,
      log.timestamp,
      log.path,
      log.method,
    ]);
  } catch (error) {
    console.error('Error saving audit log to database:', error);
    
    // Fallback to file logging if database fails
    const timestamp = format(log.timestamp, 'yyyy-MM-dd HH:mm:ss');
    const message = `${timestamp} [${log.level.toUpperCase()}] ${log.action} - ${log.details} - User: ${log.userId || 'anonymous'} - IP: ${log.ipAddress} - ${log.method} ${log.path}`;
    
    if (log.level === LogLevel.ERROR) {
      writeToFile(errorLogPath, message);
    } else {
      writeToFile(infoLogPath, message);
    }
  }
};

/**
 * Create audit log entry
 */
export const createAuditLog = async (
  level: LogLevel,
  action: string,
  details: string,
  req: Request,
): Promise<void> => {
  const userId = req.user?.userId;
  const ipAddress = 
    req.headers['x-forwarded-for'] as string || 
    req.socket.remoteAddress || 
    'unknown';
  
  const log: AuditLog = {
    level,
    userId,
    action,
    details,
    ipAddress: ipAddress.split(',')[0], // Get first IP if multiple are forwarded
    userAgent: req.headers['user-agent'] || 'unknown',
    timestamp: new Date(),
    path: req.path,
    method: req.method,
  };
  
  await saveToDatabase(log);
};

/**
 * Audit logging middleware for all requests
 */
export const auditLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log when request is received
  const ipAddress = 
    req.headers['x-forwarded-for'] as string || 
    req.socket.remoteAddress || 
    'unknown';
  
  const userId = req.user?.userId || 'anonymous';
  
  // Create access log entry
  const accessLogEntry = `${timestamp} - ${ipAddress} - ${userId} - ${req.method} ${req.path} - ${req.headers['user-agent'] || 'unknown'}`;
  writeToFile(accessLogPath, accessLogEntry);

  // Capture response data
  const originalSend = res.send;
  res.send = function(body): Response {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log response time and status code
    const responseLog = `${timestamp} - ${ipAddress} - ${userId} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`;
    writeToFile(accessLogPath, responseLog);
    
    // If it's an error response, create a detailed error log
    if (res.statusCode >= 400) {
      const errorDetails = typeof body === 'string' ? body : JSON.stringify(body);
      const errorLogEntry = `${timestamp} - ${ipAddress} - ${userId} - ${req.method} ${req.path} - ${res.statusCode} - ${errorDetails}`;
      writeToFile(errorLogPath, errorLogEntry);
      
      // Attempt to log to database asynchronously
      createAuditLog(
        LogLevel.ERROR,
        `Error response: ${res.statusCode}`,
        errorDetails,
        req
      ).catch(err => console.error('Error creating audit log:', err));
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Audit logging helper for important actions
 */
export const auditAction = (action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Get request body for audit but exclude sensitive fields
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive data
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.refreshToken) sanitizedBody.refreshToken = '[REDACTED]';
    
    const details = JSON.stringify(sanitizedBody);
    
    // Log the action
    createAuditLog(
      LogLevel.INFO,
      action,
      details,
      req
    ).catch(err => console.error('Error creating audit log:', err));
    
    next();
  };
};

// Export a migration to create the audit_logs table
export const auditLogsMigration = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL,
  user_id UUID,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50) NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL,
  path VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level);
`;

-- Create audit_logs table for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_data JSONB,
  additional_details JSONB,
  status VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);

-- Create view for security monitoring
CREATE OR REPLACE VIEW security_events AS
SELECT 
  a.id,
  a.action,
  a.timestamp,
  a.ip_address,
  a.status,
  u.email,
  u.role
FROM audit_logs a
LEFT JOIN users u ON a.user_id = u.id
WHERE 
  a.action IN ('login', 'login_failed', 'password_reset', 'role_change', 'permission_change')
  OR a.status = 'failed';

-- Grant permissions (adjust as needed based on your application roles)
GRANT SELECT ON audit_logs TO api_user;
GRANT SELECT ON security_events TO security_admin;

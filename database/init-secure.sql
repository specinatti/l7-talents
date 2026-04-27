-- Secure Database Schema with LGPD Compliance

-- Main Curriculos Table with Encryption
CREATE TABLE IF NOT EXISTS curriculos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  telefone_encrypted JSONB, -- Encrypted phone number
  linkedin VARCHAR(255),
  cargo_desejado VARCHAR(255),
  area_atuacao VARCHAR(255),
  nivel_experiencia VARCHAR(50),
  pretensao_salarial DECIMAL(10, 2),
  disponibilidade VARCHAR(50),
  resumo_profissional TEXT,
  habilidades TEXT[],
  arquivo_curriculo VARCHAR(500),
  status VARCHAR(50) DEFAULT 'novo',
  consent_data_processing BOOLEAN DEFAULT true,
  consent_marketing BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT unique_email_active UNIQUE (email)
);

-- Audit Log Table for LGPD Compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  user_id INTEGER,
  data_type VARCHAR(100),
  action VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Access Log (Who accessed what data)
CREATE TABLE IF NOT EXISTS data_access_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  accessed_user_id INTEGER,
  data_type VARCHAR(100),
  action VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consent Management Table
CREATE TABLE IF NOT EXISTS user_consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES curriculos(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL,
  granted BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Retention Policy Table
CREATE TABLE IF NOT EXISTS data_retention (
  id SERIAL PRIMARY KEY,
  data_type VARCHAR(100) NOT NULL,
  retention_days INTEGER NOT NULL,
  last_cleanup TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_curriculos_email ON curriculos(email);
CREATE INDEX IF NOT EXISTS idx_curriculos_created_at ON curriculos(created_at);
CREATE INDEX IF NOT EXISTS idx_curriculos_status ON curriculos(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_curriculos_updated_at ON curriculos;
CREATE TRIGGER update_curriculos_updated_at
  BEFORE UPDATE ON curriculos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default data retention policies
INSERT INTO data_retention (data_type, retention_days) VALUES
  ('curriculum', 730),  -- 2 years
  ('audit_logs', 1825), -- 5 years (legal requirement)
  ('security_events', 365) -- 1 year
ON CONFLICT DO NOTHING;

-- Function for LGPD Right to Erasure (Soft Delete)
CREATE OR REPLACE FUNCTION soft_delete_user_data(user_email VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE curriculos 
  SET 
    deleted_at = CURRENT_TIMESTAMP,
    nome = 'DELETED',
    email = CONCAT('deleted_', id, '@deleted.com'),
    telefone = NULL,
    telefone_encrypted = NULL,
    linkedin = NULL,
    resumo_profissional = NULL,
    arquivo_curriculo = NULL
  WHERE email = user_email AND deleted_at IS NULL;
  
  INSERT INTO audit_logs (event_type, data_type, action, details)
  VALUES ('DATA_DELETION', 'curriculum', 'soft_delete', 
          jsonb_build_object('email', user_email, 'reason', 'user_request'));
END;
$$ LANGUAGE plpgsql;

-- Function to permanently delete old data (Data Retention)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
DECLARE
  retention_policy RECORD;
BEGIN
  FOR retention_policy IN SELECT * FROM data_retention LOOP
    IF retention_policy.data_type = 'curriculum' THEN
      DELETE FROM curriculos 
      WHERE deleted_at IS NOT NULL 
        AND deleted_at < CURRENT_TIMESTAMP - (retention_policy.retention_days || ' days')::INTERVAL;
    END IF;
    
    UPDATE data_retention 
    SET last_cleanup = CURRENT_TIMESTAMP 
    WHERE id = retention_policy.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON curriculos TO your_app_user;
-- GRANT SELECT, INSERT ON audit_logs TO your_app_user;

COMMENT ON TABLE curriculos IS 'Main table for storing curriculum data with encryption support';
COMMENT ON TABLE audit_logs IS 'LGPD compliance audit trail';
COMMENT ON TABLE user_consents IS 'User consent management for LGPD compliance';
COMMENT ON TABLE data_retention IS 'Data retention policies';
COMMENT ON COLUMN curriculos.telefone_encrypted IS 'Encrypted phone number using AES-256-GCM';
COMMENT ON FUNCTION soft_delete_user_data IS 'LGPD Right to Erasure - Soft delete user data';
COMMENT ON FUNCTION cleanup_old_data IS 'Automated data retention cleanup';

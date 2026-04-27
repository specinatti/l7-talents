const fs = require('fs');
const path = require('path');

class AuditLogger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(event, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      data: this.sanitizeLogData(data),
      ip: data.ip || 'unknown',
      userAgent: data.userAgent || 'unknown'
    };

    const logFile = path.join(this.logDir, `audit-${this.getDateString()}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(logFile, logLine, 'utf8');
    
    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📝 AUDIT: ${event}`, logEntry);
    }
  }

  // LGPD Compliance Logs
  logDataAccess(userId, dataType, ip, userAgent) {
    this.log('DATA_ACCESS', {
      userId,
      dataType,
      ip,
      userAgent,
      action: 'read'
    });
  }

  logDataModification(userId, dataType, action, ip, userAgent) {
    this.log('DATA_MODIFICATION', {
      userId,
      dataType,
      action, // create, update, delete
      ip,
      userAgent
    });
  }

  logDataExport(userId, dataType, ip, userAgent) {
    this.log('DATA_EXPORT', {
      userId,
      dataType,
      ip,
      userAgent,
      lgpdCompliance: 'data_portability'
    });
  }

  logDataDeletion(userId, reason, ip, userAgent) {
    this.log('DATA_DELETION', {
      userId,
      reason, // user_request, retention_policy, etc
      ip,
      userAgent,
      lgpdCompliance: 'right_to_erasure'
    });
  }

  logSecurityEvent(eventType, details, ip, userAgent) {
    this.log('SECURITY_EVENT', {
      eventType, // failed_login, suspicious_activity, etc
      details,
      ip,
      userAgent,
      severity: this.getSeverity(eventType)
    });
  }

  logConsentChange(userId, consentType, granted, ip, userAgent) {
    this.log('CONSENT_CHANGE', {
      userId,
      consentType,
      granted,
      ip,
      userAgent,
      lgpdCompliance: 'consent_management'
    });
  }

  getSeverity(eventType) {
    const highSeverity = ['failed_login', 'unauthorized_access', 'data_breach'];
    const mediumSeverity = ['suspicious_activity', 'rate_limit_exceeded'];
    
    if (highSeverity.includes(eventType)) return 'HIGH';
    if (mediumSeverity.includes(eventType)) return 'MEDIUM';
    return 'LOW';
  }

  sanitizeLogData(data) {
    const sanitized = { ...data };
    
    // Remove sensitive fields from logs
    const sensitiveFields = ['password', 'token', 'creditCard', 'ssn', 'cpf'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  getDateString() {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  // Get logs for compliance reporting
  getAuditTrail(startDate, endDate, eventType = null) {
    const logs = [];
    const files = fs.readdirSync(this.logDir);
    
    files.forEach(file => {
      if (file.startsWith('audit-')) {
        const content = fs.readFileSync(path.join(this.logDir, file), 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            const entry = JSON.parse(line);
            const entryDate = new Date(entry.timestamp);
            
            if (entryDate >= startDate && entryDate <= endDate) {
              if (!eventType || entry.event === eventType) {
                logs.push(entry);
              }
            }
          } catch (e) {
            console.error('Error parsing log line:', e);
          }
        });
      }
    });
    
    return logs;
  }
}

module.exports = new AuditLogger();

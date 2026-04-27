const crypto = require('crypto');

// AES-256-GCM Encryption for sensitive data
class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = this.deriveKey(process.env.ENCRYPTION_KEY || 'default-key-change-in-production');
  }

  deriveKey(password) {
    return crypto.scryptSync(password, 'salt', 32);
  }

  encrypt(text) {
    if (!text) return null;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    if (!encryptedData || !encryptedData.encrypted) return null;
    
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(encryptedData.iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('❌ Decryption error:', error);
      return null;
    }
  }

  // Hash for one-way encryption (passwords, etc)
  hash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  // Tokenize sensitive data (for PCI compliance)
  tokenize(data) {
    const token = crypto.randomBytes(32).toString('hex');
    return {
      token: token,
      hash: this.hash(data)
    };
  }
}

module.exports = new DataEncryption();

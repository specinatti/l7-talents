const validator = require('validator');
const xss = require('xss');

class InputValidator {
  // Sanitize all inputs
  sanitize(input) {
    if (typeof input !== 'string') return input;
    return xss(validator.trim(input));
  }

  // Validate email
  validateEmail(email) {
    if (!email || !validator.isEmail(email)) {
      throw new Error('Email inválido');
    }
    return validator.normalizeEmail(email);
  }

  // Validate phone
  validatePhone(phone) {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 11) {
      throw new Error('Telefone inválido');
    }
    return cleaned;
  }

  // Validate URL
  validateURL(url) {
    if (!url) return url;
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      throw new Error('URL inválida');
    }
    return url;
  }

  // Validate and sanitize text
  validateText(text, minLength = 1, maxLength = 5000) {
    if (!text) return text;
    const sanitized = this.sanitize(text);
    if (sanitized.length < minLength || sanitized.length > maxLength) {
      throw new Error(`Texto deve ter entre ${minLength} e ${maxLength} caracteres`);
    }
    return sanitized;
  }

  // Validate file
  validateFile(file) {
    if (!file) return null;
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido. Use PDF, DOC ou DOCX');
    }
    
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB');
    }
    
    return file;
  }

  // Sanitize object recursively
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = this.sanitize(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }

  // Prevent SQL injection
  escapeSQLInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/['";\\]/g, '');
  }
}

module.exports = new InputValidator();

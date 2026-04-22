// Validation utilities for consistent data validation across the app

/**
 * Validation error object
 */
class ValidationError {
  constructor(field, message) {
    this.field = field;
    this.message = message;
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate phone number format (Indonesian)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
  const regex = /^(\+62|0)[0-9]{7,}$/;
  return regex.test(cleaned);
}

/**
 * Validate number is within range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if valid
 */
function isValidNumber(value, min = null, max = null) {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
}

/**
 * Validate string is not empty
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if valid
 */
function isValidString(value, minLength = 1, maxLength = 255) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < minLength) return false;
  if (trimmed.length > maxLength) return false;
  return true;
}

/**
 * Validate integer value
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid integer
 */
function isValidInteger(value) {
  const num = parseInt(value);
  return !isNaN(num) && String(num) === String(value);
}

/**
 * Validate positive number
 * @param {number} value - Value to validate
 * @returns {boolean} True if positive
 */
function isPositive(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate non-negative number
 * @param {number} value - Value to validate
 * @returns {boolean} True if non-negative
 */
function isNonNegative(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Validate percentage
 * @param {number} value - Value to validate (0-100)
 * @returns {boolean} True if valid percentage
 */
function isValidPercentage(value) {
  return isValidNumber(value, 0, 100);
}

/**
 * Validate date format YYYY-MM-DD
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate alphanumeric string
 * @param {string} value - String to validate
 * @returns {boolean} True if valid
 */
function isAlphanumeric(value) {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(value);
}

/**
 * Validate code format (usually alphanumeric and/or dashes)
 * @param {string} code - Code to validate
 * @returns {boolean} True if valid
 */
function isValidCode(code) {
  const regex = /^[A-Z0-9]{2,}$/;
  return regex.test(code);
}

/**
 * Validate bank account format
 * @param {string} account - Account number to validate
 * @returns {boolean} True if valid
 */
function isValidBankAccount(account) {
  const cleaned = account.replace(/\s/g, '');
  // Most bank accounts are 8-20 digits
  return /^\d{8,20}$/.test(cleaned);
}

/**
 * Validate required field
 * @param {*} value - Value to check
 * @returns {boolean} True if value is not empty
 */
function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate form field
 * @param {string} fieldName - Name of field for error message
 * @param {*} value - Field value
 * @param {Object} rules - Validation rules { required: true, minLength: 2, ... }
 * @returns {ValidationError|null} Error object if invalid, null if valid
 */
function validateField(fieldName, value, rules = {}) {
  if (rules.required && !isRequired(value)) {
    return new ValidationError(fieldName, `${fieldName} harus diisi`);
  }

  if (!isRequired(value) && !rules.required) {
    return null; // Not required and empty is valid
  }

  if (rules.email && !isValidEmail(value)) {
    return new ValidationError(fieldName, `${fieldName} harus format email yang valid`);
  }

  if (rules.phone && !isValidPhone(value)) {
    return new ValidationError(fieldName, `${fieldName} harus format nomor telepon yang valid`);
  }

  if (rules.minLength && String(value).length < rules.minLength) {
    return new ValidationError(fieldName, `${fieldName} minimal ${rules.minLength} karakter`);
  }

  if (rules.maxLength && String(value).length > rules.maxLength) {
    return new ValidationError(fieldName, `${fieldName} maksimal ${rules.maxLength} karakter`);
  }

  if (rules.min !== undefined && !isValidNumber(value, rules.min)) {
    return new ValidationError(fieldName, `${fieldName} minimal ${rules.min}`);
  }

  if (rules.max !== undefined && !isValidNumber(value, undefined, rules.max)) {
    return new ValidationError(fieldName, `${fieldName} maksimal ${rules.max}`);
  }

  if (rules.pattern && !rules.pattern.test(String(value))) {
    return new ValidationError(fieldName, `${fieldName} format tidak valid`);
  }

  if (rules.custom && !rules.custom(value)) {
    return new ValidationError(fieldName, rules.customMessage || `${fieldName} tidak valid`);
  }

  return null;
}

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Rules object { fieldName: { required: true, ... } }
 * @returns {Array} Array of ValidationError objects, empty if all valid
 */
function validateForm(formData, validationRules) {
  const errors = [];

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const error = validateField(fieldName, formData[fieldName], rules);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Display validation errors in form
 * @param {Array} errors - Array of ValidationError objects
 * @param {string} containerId - ID of container for error messages
 */
function displayValidationErrors(errors, containerId = 'form-errors') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (errors.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  const errorHtml = errors
    .map(error => `<div class="error-item">• ${escapeHtml(error.message)}</div>`)
    .join('');

  container.innerHTML = `
    <div class="validation-error-box" style="
      background-color: #ffebee;
      border: 1px solid #ef5350;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
      color: #c62828;
    ">
      <strong>Kesalahan validasi:</strong>
      ${errorHtml}
    </div>
  `;
}

/**
 * Mark invalid fields with visual feedback
 * @param {Array} errors - Array of ValidationError objects
 */
function markInvalidFields(errors) {
  // Clear previous marks
  document.querySelectorAll('.form-field-error').forEach(el => {
    el.classList.remove('form-field-error');
  });

  // Mark new errors
  errors.forEach(error => {
    const field = document.querySelector(`[name="${error.field}"]`);
    if (field) {
      field.classList.add('form-field-error');
      field.style.borderColor = '#d32f2f';
    }
  });
}

/**
 * Add CSS for form field error styling
 */
function initValidationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .form-field-error {
      border-color: #d32f2f !important;
      background-color: #ffebee;
    }

    .error-item {
      margin: 4px 0;
      font-size: 14px;
    }

    .validation-error-box strong {
      display: block;
      margin-bottom: 8px;
      color: #b71c1c;
    }
  `;
  document.head.appendChild(style);
}

// Initialize validation styles on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidationStyles);
} else {
  initValidationStyles();
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ValidationError,
    isValidEmail,
    isValidPhone,
    isValidNumber,
    isValidString,
    isValidInteger,
    isPositive,
    isNonNegative,
    isValidPercentage,
    isValidDate,
    isAlphanumeric,
    isValidCode,
    isValidBankAccount,
    isRequired,
    validateField,
    validateForm,
    displayValidationErrors,
    markInvalidFields,
    initValidationStyles,
  };
}

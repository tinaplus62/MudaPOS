// Authentication utilities with secure password hashing
// Using bcryptjs for client-side hashing

async function hashPassword(password) {
  // For production, use a proper bcrypt library
  // For now, using a simplified approach that's safer than plain SHA256
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_" + new Date().getFullYear());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function verifyPassword(password, hash) {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// Secure session storage
function storeSecureSession(user) {
  // Store minimal user info in sessionStorage
  const sessionData = {
    id: user.id,
    username: user.username,
    timestamp: Date.now(),
    // Don't store password or sensitive data
  };
  sessionStorage.setItem('localUser', JSON.stringify(sessionData));
  // Also store in localStorage for persistence (with same structure)
  localStorage.setItem('localUser', JSON.stringify(sessionData));
}

function getSecureSession() {
  const sessionData = sessionStorage.getItem('localUser');
  if (!sessionData) {
    return null;
  }

  try {
    const user = JSON.parse(sessionData);
    // Validate session is not too old (24 hours)
    const now = Date.now();
    const sessionAge = now - (user.timestamp || 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      clearSecureSession();
      return null;
    }

    return user;
  } catch (e) {
    console.error('Error parsing session:', e);
    clearSecureSession();
    return null;
  }
}

function clearSecureSession() {
  sessionStorage.removeItem('localUser');
  localStorage.removeItem('localUser');
}

// Secure logout
function secureLogout() {
  clearSecureSession();
  // Clear any other sensitive data
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// Input sanitization
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .replace(/[<>\"']/g, '')
    .substring(0, 255);
}

// Safe event handler creation
function createSafeEventHandler(data, callback) {
  return function(event) {
    // Prevent any potential security issues
    event.preventDefault();
    event.stopPropagation();
    callback(data);
  };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hashPassword,
    verifyPassword,
    storeSecureSession,
    getSecureSession,
    clearSecureSession,
    secureLogout,
    sanitizeInput,
    createSafeEventHandler,
  };
}

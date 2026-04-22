// Common utilities shared across all pages

// Date Formatting
function formatDate(timestamp) {
  if (!timestamp) return '-';

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('id-ID', options).format(date);
}

// Format Currency
function formatCurrency(value) {
  if (!value && value !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format Number
function formatNumber(value) {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
}

// Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

// Modal Functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

// Logout Function
function logout() {
  sessionStorage.removeItem('localUser');
  localStorage.removeItem('localUser');
  window.location.href = 'index.html';
}

// Local Authentication Check
function checkLocalAuth() {
  const savedLocalSession = sessionStorage.getItem('localUser');
  if (savedLocalSession) {
    try {
      return JSON.parse(savedLocalSession);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Require Authentication
function requireAuth() {
  const user = checkLocalAuth();
  if (!user) {
    window.location.href = 'index.html?redirect=' + encodeURIComponent(window.location.pathname);
    return null;
  }
  return user;
}

// Initialize feather icons
function initFeatherIcons() {
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
}

// Set Active Menu Item
function setActiveMenuItem(path) {
  // Remove active class from all menu items
  document.querySelectorAll('.sidebar-menu a, .sidebar-submenu a').forEach(item => {
    item.classList.remove('active');
  });

  // Add active class to current page
  document.querySelectorAll('.sidebar-menu a, .sidebar-submenu a').forEach(item => {
    if (item.getAttribute('href') === path) {
      item.classList.add('active');
    }
  });
}

// Get Current Page Name
function getCurrentPageName() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  return filename;
}

// Input Validation Functions
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  const regex = /^(\+62|0)[0-9]{7,}$/;
  return regex.test(phone.replace(/\s/g, ''));
}

function validateNumber(value, min = null, max = null) {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
}

function validateRequired(value) {
  return value && value.trim().length > 0;
}

// Escape HTML for safe output
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Event listener helper for dynamic elements
function addDelegatedEventListener(parentSelector, eventType, targetSelector, callback) {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;

  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(targetSelector);
    if (target) {
      callback.call(target, e);
    }
  });
}

// Debounce function for search/input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Deep clone object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Initialize page (common setup)
function initPage() {
  initFeatherIcons();
  setActiveMenuItem(getCurrentPageName());

  // Setup sidebar toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }

  // Close sidebar when clicking on a link
  document.querySelectorAll('.sidebar-menu a, .sidebar-submenu a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  // Close modal when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Close modal when clicking close button
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    formatCurrency,
    formatNumber,
    toggleSidebar,
    closeSidebar,
    openModal,
    closeModal,
    logout,
    checkLocalAuth,
    requireAuth,
    initFeatherIcons,
    setActiveMenuItem,
    getCurrentPageName,
    validateEmail,
    validatePhone,
    validateNumber,
    validateRequired,
    escapeHtml,
    addDelegatedEventListener,
    debounce,
    deepClone,
    initPage,
  };
}

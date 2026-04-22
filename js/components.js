// Shared UI Components for MUDA POS
// This module provides reusable UI components for consistent layout across all pages

/**
 * Render sidebar with menu items
 * @param {string} activePage - The current page filename (e.g., 'index.html')
 * @returns {string} HTML string for sidebar
 */
export function renderSidebar(activePage) {
  const menuItems = [
    { href: 'index.html', icon: 'home', label: 'Home' },
    { href: 'masterdata.html', icon: 'package', label: 'Master Data' },
    { href: 'sales.html', icon: 'shopping-cart', label: 'Sales' },
    { href: 'purchase.html', icon: 'truck', label: 'Purchase' },
    { href: 'finance.html', icon: 'dollar-sign', label: 'Finance' },
    { href: 'inventory.html', icon: 'layers', label: 'Inventory' },
    { href: 'relation.html', icon: 'users', label: 'Relation' },
    { href: 'report.html', icon: 'bar-chart-2', label: 'Report' },
    { href: 'setting.html', icon: 'settings', label: 'Setting' }
  ];

  const menuHtml = menuItems.map(item => {
    const isActive = item.href === activePage ? 'active' : '';
    return `
      <li>
        <a href="${item.href}" class="menu-link ${isActive}">
          <i data-feather="${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      </li>
    `;
  }).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <h2>MUDA POS</h2>
        <button class="close-sidebar" id="closeSidebar" aria-label="Tutup menu">
          <i data-feather="x"></i>
        </button>
      </div>
      <ul class="sidebar-menu">
        ${menuHtml}
      </ul>
    </aside>
  `;
}

/**
 * Render header with page title and login/logout button
 * @param {string} pageTitle - The title to display in header
 * @returns {string} HTML string for header
 */
export function renderHeader(pageTitle) {
  return `
    <header class="header">
      <div class="header-left">
        <button class="menu-toggle" id="menuToggle" aria-label="Buka menu">
          <i data-feather="menu"></i>
        </button>
        <h1 class="header-title">${escapeHtml(pageTitle)}</h1>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" id="loginBtn">
          <i data-feather="log-in"></i>
          <span>Login</span>
        </button>
      </div>
    </header>
  `;
}

/**
 * Render overlay for sidebar
 * @returns {string} HTML string for overlay
 */
export function renderOverlay() {
  return `<div class="overlay" id="overlay"></div>`;
}

/**
 * Initialize sidebar toggle functionality
 */
export function initSidebarToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  if (!menuToggle || !closeSidebar || !sidebar || !overlay) {
    console.warn('Sidebar elements not found');
    return;
  }

  const openSidebar = () => {
    sidebar.classList.add('open');
    overlay.classList.add('active');
  };

  const closeSidebarFunc = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  };

  menuToggle.addEventListener('click', openSidebar);
  closeSidebar.addEventListener('click', closeSidebarFunc);
  overlay.addEventListener('click', closeSidebarFunc);

  // Close sidebar when clicking on a menu link (mobile)
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeSidebarFunc();
      }
    });
  });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format currency to Indonesian Rupiah
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  if (!value && value !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format number with thousand separators
 * @param {number} value - Value to format
 * @returns {string} Formatted number string
 */
export function formatNumber(value) {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Format date to Indonesian format
 * @param {Date|string|object} timestamp - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
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
    minute: '2-digit'
  };

  return new Intl.DateTimeFormat('id-ID', options).format(date);
}

/**
 * Show loading spinner
 * @param {string} containerId - ID of container element
 */
export function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="loading-spinner" style="text-align: center; padding: 2rem;">
        <div class="spinner" style="
          border: 4px solid #f3f3f3;
          border-top: 4px solid #006B54;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <p style="color: #666;">Memuat data...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }
}

/**
 * Disable button and show loading state
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Text to show while loading
 */
export function setButtonLoading(button, loadingText = 'Memproses...') {
  if (!button) return;
  button.disabled = true;
  button.dataset.originalText = button.innerHTML;
  button.innerHTML = `<span class="spin" style="display:inline-block;">⟳</span> ${loadingText}`;
}

/**
 * Reset button to original state
 * @param {HTMLElement} button - Button element
 */
export function resetButton(button) {
  if (!button) return;
  button.disabled = false;
  if (button.dataset.originalText) {
    button.innerHTML = button.dataset.originalText;
  }
}

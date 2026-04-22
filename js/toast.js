// Toast Notification System for MUDA POS
// Provides modern toast notifications to replace alert()

/**
 * Toast notification manager
 */
const ToastManager = {
  container: null,

  /**
   * Initialize toast container
   */
  init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(this.container);

    // Add styles for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(400px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(400px);
        }
      }

      @keyframes progressShrink {
        from { width: 100%; }
        to { width: 0%; }
      }

      .toast-item {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        animation: slideIn 0.3s ease;
        position: relative;
        overflow: hidden;
        min-width: 300px;
        max-width: 400px;
      }

      .toast-item.removing {
        animation: slideOut 0.3s ease forwards;
      }

      .toast-icon {
        font-size: 20px;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-content {
        flex: 1;
        word-wrap: break-word;
      }

      .toast-title {
        font-weight: 600;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .toast-message {
        font-size: 13px;
        color: #666;
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(0,0,0,0.2);
        animation: progressShrink linear forwards;
      }

      .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #999;
        font-size: 18px;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .toast-close:hover {
        color: #333;
      }

      /* Toast types */
      .toast-success { border-left: 4px solid #4caf50; }
      .toast-success .toast-icon { color: #4caf50; }

      .toast-error { border-left: 4px solid #f44336; }
      .toast-error .toast-icon { color: #f44336; }

      .toast-warning { border-left: 4px solid #ff9800; }
      .toast-warning .toast-icon { color: #ff9800; }

      .toast-info { border-left: 4px solid #2196f3; }
      .toast-info .toast-icon { color: #2196f3; }

      @media (max-width: 768px) {
        #toast-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .toast-item {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (0 for no auto-dismiss)
   * @param {string} title - Optional title
   * @returns {HTMLElement} Toast element
   */
  show(message, type = 'info', duration = 3000, title = null) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const icon = this.getIcon(type);
    const defaultTitle = this.getDefaultTitle(type);
    const displayTitle = title || defaultTitle;

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${this.escapeHtml(displayTitle)}</div>
        <div class="toast-message">${this.escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Tutup">&times;</button>
      ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
    `;

    this.container.appendChild(toast);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  },

  /**
   * Remove a toast
   * @param {HTMLElement} toast - Toast element to remove
   */
  remove(toast) {
    if (!toast || !toast.parentNode) return;

    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  },

  /**
   * Get icon for toast type
   * @param {string} type - Toast type
   * @returns {string} Icon character
   */
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },

  /**
   * Get default title for toast type
   * @param {string} type - Toast type
   * @returns {string} Default title
   */
  getDefaultTitle(type) {
    const titles = {
      success: 'Berhasil',
      error: 'Kesalahan',
      warning: 'Peringatan',
      info: 'Informasi'
    };
    return titles[type] || titles.info;
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
};

/**
 * Show a success toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 * @param {string} title - Optional title
 */
export function showSuccess(message, duration = 3000, title = null) {
  return ToastManager.show(message, 'success', duration, title);
}

/**
 * Show an error toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 * @param {string} title - Optional title
 */
export function showError(message, duration = 5000, title = null) {
  return ToastManager.show(message, 'error', duration, title);
}

/**
 * Show a warning toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 * @param {string} title - Optional title
 */
export function showWarning(message, duration = 4000, title = null) {
  return ToastManager.show(message, 'warning', duration, title);
}

/**
 * Show an info toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 * @param {string} title - Optional title
 */
export function showInfo(message, duration = 3000, title = null) {
  return ToastManager.show(message, 'info', duration, title);
}

/**
 * Show a toast with custom type
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds
 * @param {string} title - Optional title
 */
export function showToast(message, type = 'info', duration = 3000, title = null) {
  return ToastManager.show(message, type, duration, title);
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ToastManager.init());
} else {
  ToastManager.init();
}

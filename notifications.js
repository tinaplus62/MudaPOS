// Notification system to replace alert() and confirm()

const NotificationManager = {
  init() {
    // Create notification container
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
    `;
    document.body.appendChild(container);

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'notification-modal-overlay';
    modalOverlay.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 299;
    `;
    document.body.appendChild(modalOverlay);

    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'notification-modal-container';
    modalContainer.style.cssText = `
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
      z-index: 300;
      min-width: 300px;
      max-width: 500px;
    `;
    document.body.appendChild(modalContainer);
  },

  showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notification-container');
    if (!container) {
      console.warn('Notification container not initialized');
      return;
    }

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-${type}`;
    toast.style.cssText = `
      background-color: ${this.getBackgroundColor(type)};
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      animation: slideIn 0.3s ease;
      word-break: break-word;
    `;

    const icon = this.getIcon(type);
    toast.innerHTML = `
      <span style="font-size: 20px; flex-shrink: 0;">${icon}</span>
      <span style="flex: 1; word-wrap: break-word;">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  },

  showAlert(message, title = 'Notifikasi', type = 'info') {
    return new Promise((resolve) => {
      const overlay = document.getElementById('notification-modal-overlay');
      const modalContainer = document.getElementById('notification-modal-container');

      if (!overlay || !modalContainer) {
        console.warn('Modal container not initialized');
        resolve();
        return;
      }

      overlay.style.display = 'block';
      modalContainer.style.display = 'block';
      modalContainer.innerHTML = `
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">
            ${escapeHtml(title)}
          </h2>
          <p style="margin: 0 0 24px 0; color: #666; word-break: break-word; white-space: pre-wrap;">
            ${escapeHtml(message)}
          </p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="notification-alert-ok" class="btn btn-primary" style="cursor: pointer;">
              OK
            </button>
          </div>
        </div>
      `;

      const okButton = document.getElementById('notification-alert-ok');
      const closeAlert = () => {
        overlay.style.display = 'none';
        modalContainer.style.display = 'none';
        resolve();
      };

      okButton.addEventListener('click', closeAlert);
      overlay.addEventListener('click', closeAlert);
    });
  },

  showConfirm(message, title = 'Konfirmasi', options = {}) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('notification-modal-overlay');
      const modalContainer = document.getElementById('notification-modal-container');

      if (!overlay || !modalContainer) {
        console.warn('Modal container not initialized');
        resolve(false);
        return;
      }

      const okText = options.okText || 'Ya';
      const cancelText = options.cancelText || 'Batal';
      const okColor = options.okColor || 'btn-danger';

      overlay.style.display = 'block';
      modalContainer.style.display = 'block';
      modalContainer.innerHTML = `
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">
            ${escapeHtml(title)}
          </h2>
          <p style="margin: 0 0 24px 0; color: #666; word-break: break-word; white-space: pre-wrap;">
            ${escapeHtml(message)}
          </p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="notification-confirm-cancel" class="btn btn-secondary" style="cursor: pointer;">
              ${escapeHtml(cancelText)}
            </button>
            <button id="notification-confirm-ok" class="btn ${okColor}" style="cursor: pointer;">
              ${escapeHtml(okText)}
            </button>
          </div>
        </div>
      `;

      const okButton = document.getElementById('notification-confirm-ok');
      const cancelButton = document.getElementById('notification-confirm-cancel');

      const closeConfirm = (result) => {
        overlay.style.display = 'none';
        modalContainer.style.display = 'none';
        resolve(result);
      };

      okButton.addEventListener('click', () => closeConfirm(true));
      cancelButton.addEventListener('click', () => closeConfirm(false));
      overlay.addEventListener('click', () => closeConfirm(false));
    });
  },

  showInputDialog(message, title = 'Input', defaultValue = '', options = {}) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('notification-modal-overlay');
      const modalContainer = document.getElementById('notification-modal-container');

      if (!overlay || !modalContainer) {
        console.warn('Modal container not initialized');
        resolve(null);
        return;
      }

      overlay.style.display = 'block';
      modalContainer.style.display = 'block';
      modalContainer.innerHTML = `
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">
            ${escapeHtml(title)}
          </h2>
          <p style="margin: 0 0 12px 0; color: #666;">
            ${escapeHtml(message)}
          </p>
          <input
            id="notification-input-field"
            type="${options.type || 'text'}"
            placeholder="${options.placeholder || ''}"
            value="${escapeHtml(defaultValue)}"
            style="
              width: 100%;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 14px;
              margin-bottom: 16px;
              font-family: inherit;
            "
          />
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="notification-input-cancel" class="btn btn-secondary" style="cursor: pointer;">
              Batal
            </button>
            <button id="notification-input-ok" class="btn btn-primary" style="cursor: pointer;">
              OK
            </button>
          </div>
        </div>
      `;

      const inputField = document.getElementById('notification-input-field');
      const okButton = document.getElementById('notification-input-ok');
      const cancelButton = document.getElementById('notification-input-cancel');

      const closeInputDialog = (result) => {
        overlay.style.display = 'none';
        modalContainer.style.display = 'none';
        resolve(result);
      };

      inputField.focus();
      okButton.addEventListener('click', () => closeInputDialog(inputField.value));
      cancelButton.addEventListener('click', () => closeInputDialog(null));
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          closeInputDialog(inputField.value);
        }
      });
      overlay.addEventListener('click', () => closeInputDialog(null));
    });
  },

  getBackgroundColor(type) {
    const colors = {
      success: '#4caf50',
      error: '#d32f2f',
      warning: '#ff9800',
      info: '#2196f3',
    };
    return colors[type] || colors.info;
  },

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type] || icons.info;
  },
};

// Global functions to replace alert and confirm
function showNotification(message, type = 'info', duration = 4000) {
  NotificationManager.showToast(message, type, duration);
}

function showSuccess(message, duration = 4000) {
  NotificationManager.showToast(message, 'success', duration);
}

function showError(message, duration = 5000) {
  NotificationManager.showToast(message, 'error', duration);
}

function showWarning(message, duration = 4000) {
  NotificationManager.showToast(message, 'warning', duration);
}

function showInfo(message, duration = 4000) {
  NotificationManager.showToast(message, 'info', duration);
}

async function alert(message) {
  return NotificationManager.showAlert(message);
}

async function confirm(message, options = {}) {
  return NotificationManager.showConfirm(message, options.title || 'Konfirmasi', {
    okText: options.okText || 'Ya',
    cancelText: options.cancelText || 'Batal',
    okColor: options.okColor || 'btn-danger',
  });
}

async function prompt(message, defaultValue = '', options = {}) {
  return NotificationManager.showInputDialog(message, options.title || 'Input', defaultValue, options);
}

// Add styles
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

  @media (max-width: 768px) {
    #notification-container {
      top: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }

    #notification-modal-container {
      width: 90vw;
      max-width: 90vw;
    }
  }
`;
document.head.appendChild(style);

// Initialize on document ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NotificationManager.init());
} else {
  NotificationManager.init();
}

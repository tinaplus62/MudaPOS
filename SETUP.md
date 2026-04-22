# MUDA POS - Setup & Development Guide

Panduan lengkap untuk setup dan development lingkungan MUDA POS.

---

## Prerequisites

- Node.js >= 16.0.0
- npm atau yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VSCode recommended)

---

## Installation

### 1. Clone Repository
```bash
git clone [repository-url]
cd muda-pos
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

**Buat file `.env`** (copy dari `.env.example`):
```bash
cp .env.example .env
```

**Edit `.env` dan masukkan kredensial Anda**:
```env
VITE_FIREBASE_API_KEY=your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... (lihat .env.example untuk field lengkap)
```

**PENTING**: 
- Jangan commit `.env` ke git (sudah di `.gitignore`)
- Setiap developer harus membuat `.env` mereka sendiri
- API keys disimpan di `.env`, bukan di source code

### 4. Start Development Server
```bash
npm run dev
```

Server akan mulai di `http://localhost:5173`

---

## Project Structure

```
muda-pos/
├── css/
│   └── shared.css              # Global styles & design tokens
├── js/
│   ├── common.js               # Utility functions
│   ├── auth-utils.js           # Auth & session management
│   ├── notifications.js        # Toast & modal system
│   ├── validation-utils.js     # Form validation
│   ├── export-utils.js         # CSV export
│   ├── firebase-config-safe.js # Firebase config (safe)
│   └── firebase-config.js      # (DEPRECATED - use firebase-config-safe.js)
├── *.html                       # Page files
├── .env                         # Environment variables (local, not committed)
├── .env.example                 # Template for .env
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── IMPROVEMENTS.md             # Detailed improvements documentation
├── MIGRATION_GUIDE.md          # Step-by-step migration guide
└── SETUP.md                    # This file
```

---

## Key Files Explained

### css/shared.css
- **Purpose**: Global stylesheet dengan design tokens
- **Contains**: 
  - CSS variables untuk warna, spacing, fonts, shadows
  - Global components (header, sidebar, buttons, forms, modals, tables)
  - Responsive breakpoints
  - Utility classes

**Usage**:
```html
<link rel="stylesheet" href="css/shared.css">
```

### js/common.js
- **Purpose**: Shared utility functions
- **Key functions**: 
  - formatDate, formatCurrency, formatNumber
  - toggleSidebar, openModal, closeModal
  - checkLocalAuth, logout, initPage
  - Validation helpers
  - HTML escaping, debounce, deep clone

**Usage**:
```html
<script src="js/common.js"></script>
<script>
  formatCurrency(50000); // "Rp 50.000"
  openModal('myModal');
</script>
```

### js/notifications.js
- **Purpose**: Toast & modal notifications menggantikan alert()
- **Key functions**:
  - showSuccess, showError, showWarning, showInfo (toast)
  - alert, confirm, prompt (modal dialogs)

**Usage**:
```html
<script src="js/notifications.js"></script>
<script>
  showSuccess('Data saved!');
  const result = await confirm('Are you sure?');
</script>
```

### js/auth-utils.js
- **Purpose**: Secure authentication & session management
- **Key functions**:
  - hashPassword, verifyPassword
  - storeSecureSession, getSecureSession, clearSecureSession
  - sanitizeInput, createSafeEventHandler

**Usage**:
```javascript
const hash = await hashPassword('password');
storeSecureSession({ id: 123, username: 'john' });
const user = getSecureSession();
```

### js/validation-utils.js
- **Purpose**: Form & input validation
- **Key functions**:
  - validateForm, validateField
  - isValidEmail, isValidPhone, isValidNumber, etc.
  - displayValidationErrors, markInvalidFields

**Usage**:
```javascript
const errors = validateForm(data, {
  email: { required: true, email: true },
  age: { min: 18, max: 100 }
});
if (errors.length > 0) displayValidationErrors(errors);
```

### js/export-utils.js
- **Purpose**: Export data to CSV & printing
- **Key functions**:
  - exportToCSV, exportTableToCSV, exportTransactions
  - printHTML, copyTableToClipboard

**Usage**:
```html
<button onclick="exportTableToCSV('myTable', 'data.csv')">Export</button>
```

### .env
- **Purpose**: Store environment variables locally
- **Includes**:
  - Firebase API keys & config
  - Supabase credentials (if using)
  - App configuration
- **Security**: Never commit this file

---

## Development Workflow

### 1. Create a New Page

Use `index-new.html` sebagai template:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MUDA POS - My Page</title>
    <link rel="stylesheet" href="css/shared.css">
    <script src="https://unpkg.com/feather-icons"></script>
    <script src="js/notifications.js"></script>
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <h2>MUDA POS</h2>
            <button class="close-sidebar" id="closeSidebar">
                <i data-feather="x"></i>
            </button>
        </div>
        <ul class="sidebar-menu">
            <!-- menu items -->
        </ul>
    </aside>

    <!-- Header -->
    <header class="header">
        <div class="header-left">
            <button class="menu-toggle" id="menuToggle">
                <i data-feather="menu"></i>
            </button>
            <h1 class="header-title">My Page</h1>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <!-- page content -->
    </main>

    <!-- Scripts -->
    <script src="js/common.js"></script>
    <script src="js/auth-utils.js"></script>
    <script src="js/validation-utils.js"></script>
    <script>
        initPage();
    </script>
</body>
</html>
```

### 2. Update Existing Pages

Ikuti panduan di `MIGRATION_GUIDE.md`.

### 3. Add Authentication Guard

```javascript
<script>
    const user = requireAuth();
    if (!user) return; // Auto-redirect
</script>
```

### 4. Test Locally

```bash
npm run dev
# Open http://localhost:5173
# Test di berbagai device sizes
```

### 5. Build for Production

```bash
npm run build
# Output akan di folder 'dist/'
```

---

## Code Style Guidelines

### HTML
- Gunakan semantic HTML5 (`<section>`, `<article>`, `<nav>`)
- Selalu include `lang` attribute di `<html>`
- Meta tags: charset, viewport, title

### CSS
- Gunakan CSS variables dari `shared.css`
- Hindari hardcode colors/spacing
- Mobile-first approach
- Responsive breakpoints: 480px, 768px, 1024px

**BAIK**:
```css
.section {
    background: var(--color-bg-white);
    padding: var(--space-lg);
    border-radius: var(--border-radius-md);
}
```

**BURUK**:
```css
.section {
    background: white;
    padding: 24px;
    border-radius: 8px;
}
```

### JavaScript
- Gunakan `const` & `let`, hindari `var`
- Async/await daripada promises
- Template literals untuk strings
- Input validation sebelum submit
- Error handling dengan try/catch

**BAIK**:
```javascript
async function saveData() {
    try {
        const result = await submitForm(data);
        showSuccess('Saved!');
    } catch (error) {
        showError('Failed: ' + error.message);
    }
}
```

**BURUK**:
```javascript
function saveData() {
    submitForm(data).then(result => {
        alert('Saved!');
    }).catch(error => {
        alert('Error: ' + error);
    });
}
```

---

## Common Tasks

### Add a Toast Notification
```javascript
showSuccess('Data saved!');      // Green
showError('Error message');      // Red
showWarning('Warning');          // Orange
showInfo('Info');                // Blue
```

### Show a Confirmation Dialog
```javascript
const confirmed = await confirm('Delete this item?', {
    title: 'Confirm Delete',
    okText: 'Delete',
    okColor: 'btn-danger'
});
if (confirmed) {
    // delete item
}
```

### Validate a Form
```javascript
const errors = validateForm(formData, {
    email: { required: true, email: true },
    name: { required: true, minLength: 3 },
    age: { min: 0, max: 150 }
});

if (errors.length > 0) {
    displayValidationErrors(errors);
    markInvalidFields(errors);
} else {
    // submit form
}
```

### Export Table to CSV
```html
<button onclick="exportTableToCSV('myTable', 'export.csv')">
    <i data-feather="download"></i> Export
</button>
```

### Format Values
```javascript
formatCurrency(50000)   // "Rp 50.000"
formatNumber(1000000)   // "1.000.000"
formatDate(new Date())  // "15/01/2024 14:30"
```

### Sidebar Toggle
```javascript
toggleSidebar();  // Toggle buka/tutup
closeSidebar();   // Tutup sidebar
```

### Modal Operations
```javascript
openModal('myModal');   // Buka modal dengan ID 'myModal'
closeModal('myModal');  // Tutup modal
```

---

## Browser Support

Tested & supported:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Troubleshooting

### Issue: "Cannot find module 'notifications.js'"
**Solution**: Pastikan path relative benar, gunakan `./js/notifications.js`

### Issue: "alert is not defined"
**Solution**: Pastikan `<script src="js/notifications.js"></script>` ditambahkan sebelum scripts lain

### Issue: Styles tidak apply
**Solution**: Pastikan `<link rel="stylesheet" href="css/shared.css">` ditambahkan di head

### Issue: Sidebar tidak muncul
**Solution**: Pastikan element dengan id `sidebar` ada di HTML

### Issue: Modal tidak close
**Solution**: Pastikan modal memiliki `id` attribute dan gunakan `closeModal(id)` yang benar

### Issue: console error "initPage is not defined"
**Solution**: Pastikan `<script src="js/common.js"></script>` ditambahkan

---

## Performance Tips

1. **Minimize CSS duplication**: Gunakan shared.css
2. **Reuse JavaScript functions**: Gunakan common.js
3. **Lazy load images**: Gunakan `loading="lazy"` attribute
4. **Optimize database queries**: Gunakan indexes, limit results
5. **Cache static assets**: Configure caching headers

---

## Security Checklist

- [ ] API keys di `.env`, bukan di source code
- [ ] User input di-validate sebelum submit
- [ ] User input di-escape sebelum render
- [ ] Gunakan HTTPS untuk semua komunikasi
- [ ] Session timeout implemented
- [ ] Auth guard di protected pages
- [ ] Password di-hash dengan salt

---

## Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript Info](https://javascript.info/)
- [Feather Icons](https://feathericons.com/)
- [Firebase Docs](https://firebase.google.com/docs)

---

## Contact & Support

Untuk pertanyaan atau issues, contact development team atau lihat dokumentasi di:
- `IMPROVEMENTS.md` - Detailed improvements
- `MIGRATION_GUIDE.md` - Step-by-step migration
- Inline comments di setiap file

---

Last updated: 2024
Version: 1.0.0

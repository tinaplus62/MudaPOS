# MUDA POS - Migration Guide untuk Halaman Existing

Panduan lengkap untuk mengupdate semua halaman existing agar menggunakan sistem baru (shared.css, common.js, notifications, validation, dll).

---

## Langkah 1: Update HTML Head

Ganti bagian `<head>` setiap halaman dengan struktur berikut:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MUDA POS - [Page Title]</title>
    
    <!-- Shared Stylesheet dengan Design Tokens -->
    <link rel="stylesheet" href="css/shared.css">
    
    <!-- External Libraries -->
    <script src="https://unpkg.com/feather-icons"></script>
    <script src="https://unpkg.com/dexie/dist/dexie.js"></script>
    
    <!-- Notification System -->
    <script src="js/notifications.js"></script>
    
    <!-- Page-specific styles (minimal) -->
    <style>
        /* Hanya CSS spesifik halaman, gunakan shared.css untuk umum */
        .custom-section {
            /* custom styles */
        }
    </style>
</head>
```

**Apa yang dihapus**:
- Semua CSS umum yang terduplikasi (header, sidebar, buttons, modals, tables)
- Semua inline `<style>` yang mendefinisikan `.header`, `.sidebar`, `.btn`, dll

**Apa yang ditambahkan**:
- Link ke `css/shared.css`
- Script untuk `notifications.js`

---

## Langkah 2: Replace Alert & Confirm

### Alert
**SEBELUM**:
```javascript
alert('Berhasil disimpan!');
alert('Error: ' + error.message);
```

**SESUDAH**:
```javascript
showSuccess('Berhasil disimpan!');
showError('Error: ' + error.message);
showInfo('Informasi penting');
showWarning('Peringatan');
```

### Confirm
**SEBELUM**:
```javascript
if (confirm('Apakah Anda yakin?')) {
    deleteItem();
}
```

**SESUDAH**:
```javascript
const result = await confirm('Apakah Anda yakin?', {
    title: 'Konfirmasi Hapus',
    okText: 'Hapus',
    cancelText: 'Batal',
    okColor: 'btn-danger'
});
if (result) {
    deleteItem();
}
```

### Prompt (Input)
**SEBELUM**:
```javascript
const value = prompt('Masukkan nilai:');
if (value !== null) {
    // process
}
```

**SESUDAH**:
```javascript
const value = await prompt('Masukkan nilai:', 'default value', {
    title: 'Input Nilai',
    placeholder: 'Ketikkan di sini...',
    type: 'text'
});
if (value !== null) {
    // process
}
```

---

## Langkah 3: Replace Firebase Config

**SEBELUM**:
```javascript
import { ... } from './js/firebase-config.js';
```

**SESUDAH**:
```javascript
import { ... } from './js/firebase-config-safe.js';
```

---

## Langkah 4: Add Common Scripts

Di akhir `</body>` sebelum closing tag, tambahkan:

```html
    <!-- Common utilities -->
    <script src="js/common.js"></script>
    <script src="js/auth-utils.js"></script>
    <script src="js/validation-utils.js"></script>
    <script src="js/export-utils.js"></script>
    
    <!-- Page initialization -->
    <script>
        // Initialize page (sidebar toggle, active menu, etc)
        document.addEventListener('DOMContentLoaded', () => {
            initPage();
        });
    </script>
    
    <!-- Page-specific module scripts -->
    <script type="module">
        // Your module scripts here
    </script>
</body>
```

---

## Langkah 5: Add Authentication Guard (untuk Protected Pages)

Untuk halaman yang memerlukan login (sales, purchase, finance, inventory, report, dll):

**Di awal script, tambahkan**:
```javascript
// Require authentication
const user = requireAuth();
if (!user) return; // Auto-redirect ke index.html
```

Atau untuk halaman yang sudah memiliki module scripts:

```javascript
<script type="module">
    // Check authentication
    const user = requireAuth();
    if (!user) return;
    
    // Rest of the script...
    import { ... } from './js/firebase-config-safe.js';
</script>
```

---

## Langkah 6: Use Design Tokens dalam CSS Custom

Jika halaman memiliki custom CSS, gunakan variables:

**SEBELUM**:
```css
.section {
    background-color: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-primary {
    background-color: #006B54;
    color: white;
    padding: 8px 16px;
}
```

**SESUDAH**:
```css
.section {
    background-color: var(--color-bg-white);
    padding: var(--space-lg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
}

.btn-primary {
    background-color: var(--color-primary);
    color: white;
    padding: var(--space-sm) var(--space-md);
}
```

**Available Variables**:
- `--color-primary`, `--color-primary-dark`, `--color-danger`, `--color-success`, dll
- `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`
- `--border-radius-sm`, `--border-radius-md`, `--border-radius-lg`, `--border-radius-xl`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--font-size-xs` hingga `--font-size-2xl`

---

## Langkah 7: Replace Inline Styles dengan Classes

**SEBELUM**:
```html
<div style="display: none;" id="modal">...</div>
<button style="background-color: #006B54; color: white; padding: 8px 16px;">Click</button>
```

**SESUDAH**:
```html
<div id="modal" class="modal">...</div>
<button class="btn btn-primary">Click</button>
```

**Common Classes**:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`
- `.card`, `.table`, `.form-group`, `.modal`
- `.text-center`, `.text-right`, `.flex-between`, `.flex-column`
- `.m-1`, `.m-2`, `.p-1`, `.p-2` (margin/padding)
- `.d-none`, `.d-flex`, `.d-grid`

---

## Langkah 8: Form Validation

Update form validation untuk menggunakan validation utilities:

**SEBELUM**:
```javascript
if (!email) {
    alert('Email harus diisi');
    return;
}
if (!email.includes('@')) {
    alert('Email tidak valid');
    return;
}
```

**SESUDAH**:
```html
<!-- Add error container di form -->
<div id="form-errors"></div>

<form id="myForm">
    <div class="form-group">
        <label for="email">Email <span class="required">*</span></label>
        <input type="email" id="email" name="email" required>
    </div>
    <!-- more fields -->
</form>
```

```javascript
const form = document.getElementById('myForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        // ...
    };
    
    const errors = validateForm(formData, {
        email: { required: true, email: true },
        name: { required: true, minLength: 3 },
        phone: { phone: true },
        age: { min: 18, max: 100 },
    });
    
    if (errors.length > 0) {
        displayValidationErrors(errors);
        markInvalidFields(errors);
        showError('Terjadi kesalahan validasi');
        return;
    }
    
    // Submit form
    try {
        await submitForm(formData);
        showSuccess('Data berhasil disimpan');
        form.reset();
    } catch (error) {
        showError('Gagal menyimpan data: ' + error.message);
    }
});
```

---

## Langkah 9: Export Data

Tambahkan tombol export di table:

**HTML**:
```html
<div class="content-section">
    <div class="flex-between" style="margin-bottom: 1rem;">
        <h2>Daftar Penjualan</h2>
        <button class="btn btn-primary" onclick="exportTableToCSV('salesTable', 'penjualan.csv')">
            <i data-feather="download"></i> Export CSV
        </button>
    </div>
    
    <table id="salesTable" class="table-responsive">
        <!-- table content -->
    </table>
</div>
```

Pastikan table memiliki:
- `<thead>` dengan `<th>` untuk headers
- `<tbody>` dengan `<tr>` untuk data rows
- `id` attribute pada table element

---

## Langkah 10: Handle Modal dengan Benar

**SEBELUM**:
```html
<div class="modal" id="detailModal" style="display: none;">
    <div class="modal-content">...</div>
</div>

<script>
function openDetailModal() {
    document.getElementById('detailModal').style.display = 'flex';
}
function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}
</script>
```

**SESUDAH**:
```html
<div class="modal" id="detailModal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Detail</h2>
            <button class="modal-close" onclick="closeModal('detailModal')">
                <i data-feather="x"></i>
            </button>
        </div>
        <div class="modal-body">
            <!-- content -->
        </div>
    </div>
</div>

<script>
function openDetailModal() {
    openModal('detailModal');
}
// closeModal already defined in common.js
</script>
```

---

## Langkah 11: Update Sidebar Active State

Sidebar otomatis update active state dengan `initPage()`, tapi pastikan link href cocok dengan filename:

```html
<ul class="sidebar-menu">
    <li><a href="sales-list.html">Sales List</a></li>
    <li><a href="sales.html">Sales</a></li>
    <!-- matches getCurrentPageName() -->
</ul>
```

---

## Langkah 12: Mobile Testing

Sebelum commit, test di:
- Chrome DevTools (iPhone 12 - 390px)
- iPad portrait (768px)
- Desktop (1920px)

Cek:
- [ ] Sidebar berfungsi dengan baik
- [ ] Tombol dapat diklik (min 44x44px)
- [ ] Font dapat dibaca
- [ ] Modal responsive
- [ ] Tabel tidak overflow
- [ ] Notifikasi muncul dengan baik

---

## Quick Checklist per Halaman

Sebelum menyelesaikan update halaman:

- [ ] Hapus `<style>` CSS yang terduplikasi
- [ ] Tambah link `css/shared.css`
- [ ] Tambah script untuk notifications, common, auth-utils, dll
- [ ] Ganti semua `alert()` dengan `showSuccess()`, `showError()`, dll
- [ ] Ganti semua `confirm()` dengan async `confirm()`
- [ ] Update Firebase import ke `-safe.js`
- [ ] Tambah `requireAuth()` jika halaman protected
- [ ] Gunakan CSS variables di custom CSS
- [ ] Hapus inline styles, gunakan classes
- [ ] Update form validation dengan `validateForm()`
- [ ] Test di mobile device
- [ ] Check console untuk errors
- [ ] Commit dengan message: "refactor: update [page] dengan shared.css dan notifications"

---

## File Reference

Saat update halaman, reference files ini:

- `index-new.html` - Template halaman terbaharui dengan semua improvements
- `css/shared.css` - Semua CSS global dan design tokens
- `js/common.js` - Utility functions (formatDate, toggleSidebar, dll)
- `js/auth-utils.js` - Authentication dan secure session
- `js/notifications.js` - Toast dan modal notifications
- `js/validation-utils.js` - Form validation
- `js/export-utils.js` - CSV export
- `IMPROVEMENTS.md` - Dokumentasi lengkap perubahan
- `.env.example` - Template environment variables

---

## Common Issues & Solutions

### Issue: Notifikasi tidak muncul
**Solusi**: Pastikan `<script src="js/notifications.js"></script>` ditambahkan di head sebelum scripts lainnya

### Issue: Sidebar tidak menutup di mobile
**Solusi**: Pastikan `initPage()` dipanggil setelah DOM loaded

### Issue: Alert() masih berfungsi
**Solusi**: Notifikasi.js mendefinisikan global `alert()`, tapi jika tidak bekerja, pastikan script dimuat lebih dulu

### Issue: Modal tidak close
**Solusi**: Gunakan `closeModal(modalId)` dari `common.js`, pastikan modal memiliki `id` attribute

### Issue: Validasi tidak jalan
**Solusi**: Pastikan form memiliki struktur yang tepat (name attributes, id untuk inputs)

### Issue: CSS tidak apply
**Solusi**: Pastikan `<link rel="stylesheet" href="css/shared.css">` di head SEBELUM custom styles

---

## Next Steps

Setelah semua halaman di-update:

1. Test semua halaman di browser utama (Chrome, Firefox, Safari)
2. Test di mobile devices (iPhone, Android)
3. Check console untuk warnings/errors
4. Review form validation di semua halaman
5. Cek export CSV functionality
6. Verify auth guard bekerja di protected pages
7. Deploy ke staging environment
8. QA testing lengkap

---

Untuk bantuan lebih lanjut, lihat dokumentasi di `IMPROVEMENTS.md` atau inline comments di file-file `.js` dan `.css`.

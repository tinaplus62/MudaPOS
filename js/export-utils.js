// Export utilities for CSV and data handling

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Optional custom headers
 * @returns {string} CSV formatted string
 */
function convertToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const keys = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = keys
    .map(header => `"${String(header).replace(/"/g, '""')}"`)
    .join(',');

  // Create data rows
  const dataRows = data.map(obj => {
    return keys
      .map(key => {
        const value = obj[key];
        // Handle different data types
        let cellValue = '';
        if (value === null || value === undefined) {
          cellValue = '';
        } else if (typeof value === 'object') {
          cellValue = JSON.stringify(value);
        } else {
          cellValue = String(value);
        }
        // Escape quotes and wrap in quotes
        return `"${cellValue.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Name for the downloaded file
 */
function downloadCSV(csvContent, filename = 'data.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to CSV file
 * @param {Array} data - Data to export
 * @param {string} filename - Filename for download
 * @param {Array} headers - Optional custom headers
 */
function exportToCSV(data, filename, headers = null) {
  try {
    const csv = convertToCSV(data, headers);
    if (!csv) {
      showError('Tidak ada data untuk diexport');
      return;
    }
    downloadCSV(csv, filename);
    showSuccess(`File ${filename} berhasil diunduh`);
  } catch (error) {
    console.error('Export error:', error);
    showError('Gagal mengexport data: ' + error.message);
  }
}

/**
 * Format data for table export
 * @param {Array} tableRows - Array of row data
 * @param {Array} columnNames - Column names to export
 * @returns {Array} Formatted data array
 */
function formatTableData(tableRows, columnNames) {
  return tableRows.map(row => {
    const obj = {};
    columnNames.forEach(name => {
      obj[name] = row[name] || '';
    });
    return obj;
  });
}

/**
 * Create a formatted date string for filenames
 * @returns {string} Date string in format YYYY-MM-DD_HHmmss
 */
function getDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
}

/**
 * Create filename with timestamp
 * @param {string} prefix - Filename prefix
 * @returns {string} Filename with timestamp
 */
function createFilename(prefix) {
  return `${prefix}_${getDateTimeString()}.csv`;
}

/**
 * Print HTML content
 * @param {string} htmlContent - HTML content to print
 * @param {string} title - Title for the document
 */
function printHTML(htmlContent, title = 'Report') {
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + escapeHtml(title) + '</title>');
  printWindow.document.write('<link rel="stylesheet" href="css/shared.css">');
  printWindow.document.write('<style>');
  printWindow.document.write('body { padding: 20px; font-family: system-ui, sans-serif; }');
  printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
  printWindow.document.write('th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }');
  printWindow.document.write('th { background-color: #f5f5f5; font-weight: bold; }');
  printWindow.document.write('h1 { color: #006B54; }');
  printWindow.document.write('@media print { body { padding: 0; } }');
  printWindow.document.write('</style></head><body>');
  printWindow.document.write('<h1>' + escapeHtml(title) + '</h1>');
  printWindow.document.write(htmlContent);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

/**
 * Export table to CSV
 * @param {string} tableId - ID of the table element
 * @param {string} filename - Filename for export
 */
function exportTableToCSV(tableId, filename = 'data.csv') {
  const table = document.getElementById(tableId);
  if (!table) {
    showError('Tabel tidak ditemukan');
    return;
  }

  const rows = [];
  const headers = [];

  // Get headers
  const headerCells = table.querySelectorAll('thead th');
  headerCells.forEach(cell => {
    headers.push(cell.textContent.trim());
  });

  // Get data rows
  const dataCells = table.querySelectorAll('tbody tr');
  dataCells.forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
      if (headers[index]) {
        rowData[headers[index]] = cell.textContent.trim();
      }
    });
    if (Object.keys(rowData).length > 0) {
      rows.push(rowData);
    }
  });

  if (rows.length === 0) {
    showError('Tidak ada data untuk diexport');
    return;
  }

  exportToCSV(rows, filename);
}

/**
 * Export transaction list to CSV with formatting
 * @param {Array} transactions - Array of transaction objects
 * @param {string} type - Type of transaction (penjualan, pembelian, etc)
 */
function exportTransactions(transactions, type = 'transaksi') {
  if (!transactions || transactions.length === 0) {
    showError('Tidak ada data untuk diexport');
    return;
  }

  const filename = createFilename(`${type}`);

  // Map transaction data
  const exportData = transactions.map(t => ({
    'ID': t.id || '',
    'Tanggal': t.tanggal || '',
    'Total': t.total || 0,
    'Status': t.status || '',
    'Keterangan': t.keterangan || ''
  }));

  exportToCSV(exportData, filename);
}

/**
 * Copy table data to clipboard
 * @param {string} tableId - ID of table to copy
 * @returns {boolean} Success status
 */
function copyTableToClipboard(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    showError('Tabel tidak ditemukan');
    return false;
  }

  try {
    const range = document.createRange();
    range.selectNodeContents(table);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    showSuccess('Data tabel disalin ke clipboard');
    return true;
  } catch (error) {
    console.error('Copy error:', error);
    showError('Gagal menyalin data');
    return false;
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertToCSV,
    downloadCSV,
    exportToCSV,
    formatTableData,
    getDateTimeString,
    createFilename,
    printHTML,
    exportTableToCSV,
    exportTransactions,
    copyTableToClipboard,
  };
}

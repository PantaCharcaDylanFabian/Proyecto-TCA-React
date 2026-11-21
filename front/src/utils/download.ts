export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const cell = (value: string | number) => {
    let text = String(value);
    // CSV exports must not turn user-supplied names into spreadsheet formulae.
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const blob = new Blob(['\uFEFF', [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

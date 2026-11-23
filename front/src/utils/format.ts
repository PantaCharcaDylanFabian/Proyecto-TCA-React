export function money(value: number) { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value); }
export function dateTime(value?: string) { return value ? new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'; }

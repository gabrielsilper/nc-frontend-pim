function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function applyBrDateMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isValidBrDate(value: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return false;
  }

  const [dayStr, monthStr, yearStr] = value.split('/');
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function brDateToIsoString(value: string): string | null {
  if (!isValidBrDate(value)) {
    return null;
  }

  const [dayStr, monthStr, yearStr] = value.split('/');
  return new Date(`${yearStr}-${monthStr}-${dayStr}`).toISOString();
}

export function brDateToDateOnly(value: string): string | null {
  if (!isValidBrDate(value)) {
    return null;
  }

  const [dayStr, monthStr, yearStr] = value.split('/');
  return `${yearStr}-${monthStr}-${dayStr}`;
}

export function brDateToEndOfDayIso(value: string): string | null {
  if (!isValidBrDate(value)) return null;
  const [dayStr, monthStr, yearStr] = value.split('/');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr), 23, 59, 59);
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const mm = String(Math.abs(offset) % 60).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mo}-${dd}T23:59:59${sign}${hh}:${mm}`;
}

export function isBrDateInThePast(value: string): boolean {
  if (!isValidBrDate(value)) return false;
  const [day, month, year] = value.split('/').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
}

export function isoToBrDateInput(value?: string | null): string {
  if (!value) return '';

  // Full datetime string: parse and use local timezone components
  if (value.includes('T')) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  // Date-only string (YYYY-MM-DD): interpret as-is, no timezone conversion
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return '';
}

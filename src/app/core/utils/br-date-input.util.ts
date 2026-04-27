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

export function isoToBrDateInput(value?: string | null): string {
  if (!value) {
    return '';
  }

  const dateOnly = value.split('T')[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split('-');
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

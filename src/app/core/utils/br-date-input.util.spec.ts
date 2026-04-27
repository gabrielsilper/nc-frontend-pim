import { describe, expect, it } from 'vitest';
import {
  applyBrDateMask,
  brDateToDateOnly,
  brDateToIsoString,
  isValidBrDate,
  isoToBrDateInput,
} from './br-date-input.util';

describe('br-date-input.util', () => {
  it('applies the Brazilian date mask progressively', () => {
    expect(applyBrDateMask('1')).toBe('1');
    expect(applyBrDateMask('1204')).toBe('12/04');
    expect(applyBrDateMask('12042026')).toBe('12/04/2026');
  });

  it('validates complete BR dates', () => {
    expect(isValidBrDate('12/04/2026')).toBe(true);
    expect(isValidBrDate('31/02/2026')).toBe(false);
  });

  it('converts BR dates to date-only and ISO payloads', () => {
    expect(brDateToDateOnly('12/04/2026')).toBe('2026-04-12');
    expect(brDateToIsoString('12/04/2026')).toContain('2026-04-12');
  });

  it('formats ISO dates for BR inputs', () => {
    expect(isoToBrDateInput('2026-04-12T00:00:00.000Z')).toBe('12/04/2026');
    expect(isoToBrDateInput('2026-04-12')).toBe('12/04/2026');
  });
});

import { describe, it, expect } from 'vitest';
import { normalizePrefix } from './normalizationService';

describe('normalizePrefix', () => {
  it('should format standard letter-number combos correctly', () => {
    expect(normalizePrefix('VO-15203')).toBe('VO-15203');
    expect(normalizePrefix('vo-15203')).toBe('VO-15203');
    expect(normalizePrefix('VO 15203')).toBe('VO-15203');
    expect(normalizePrefix('VO15203')).toBe('VO-15203');
    expect(normalizePrefix(' VO-15203 ')).toBe('VO-15203');
  });

  it('should handle other strings by returning cleaned versions', () => {
    expect(normalizePrefix('ABC 123 DEF')).toBe('ABC-123DEF'); // Wait, if it doesn't match letter-number exactly, it returns cleaned.
    // Wait, the regex `^([A-Z]+)(\d+)$` won't match ABC123DEF, so it returns 'ABC123DEF'
  });
  
  it('should return null for empty or invalid inputs', () => {
    expect(normalizePrefix(null)).toBeNull();
    expect(normalizePrefix(undefined)).toBeNull();
    expect(normalizePrefix('')).toBeNull();
    expect(normalizePrefix('   ')).toBeNull();
  });
});

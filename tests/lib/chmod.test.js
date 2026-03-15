import { describe, it, expect } from 'vitest';
import { octalToSymbolic, symbolicToOctal, octalToPermissions, permissionsToOctal } from '../../src/lib/chmod.js';

describe('octalToSymbolic', () => {
  it("'755' → 'rwxr-xr-x'", () => expect(octalToSymbolic('755')).toBe('rwxr-xr-x'));
  it("'644' → 'rw-r--r--'", () => expect(octalToSymbolic('644')).toBe('rw-r--r--'));
  it("'777' → 'rwxrwxrwx'", () => expect(octalToSymbolic('777')).toBe('rwxrwxrwx'));
  it("'000' → '---------'", () => expect(octalToSymbolic('000')).toBe('---------'));
  it("'400' → 'r--------'", () => expect(octalToSymbolic('400')).toBe('r--------'));
});

describe('symbolicToOctal', () => {
  it("'rwxr-xr-x' → '755'", () => expect(symbolicToOctal('rwxr-xr-x')).toBe('755'));
  it("'rw-r--r--' → '644'", () => expect(symbolicToOctal('rw-r--r--')).toBe('644'));
  it("'---------' → '000'", () => expect(symbolicToOctal('---------')).toBe('000'));
});

describe('octalToPermissions', () => {
  it("'755' → correct booleans", () => {
    const p = octalToPermissions('755');
    expect(p.owner).toEqual({ read: true, write: true, execute: true });
    expect(p.group).toEqual({ read: true, write: false, execute: true });
    expect(p.other).toEqual({ read: true, write: false, execute: true });
  });
  it("'000' → all false", () => {
    const p = octalToPermissions('000');
    expect(p.owner).toEqual({ read: false, write: false, execute: false });
  });
});

describe('permissionsToOctal', () => {
  it('round-trips for 755', () => expect(permissionsToOctal(octalToPermissions('755'))).toBe('755'));
  it('round-trips for 644', () => expect(permissionsToOctal(octalToPermissions('644'))).toBe('644'));
  it('round-trips for 777', () => expect(permissionsToOctal(octalToPermissions('777'))).toBe('777'));
  it('round-trips for 000', () => expect(permissionsToOctal(octalToPermissions('000'))).toBe('000'));
});

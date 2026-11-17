/** localStorage that never throws: private modes and full disks just return false. */

export function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeKey(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Short unique id that works on plain http too, where randomUUID is missing. */
export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

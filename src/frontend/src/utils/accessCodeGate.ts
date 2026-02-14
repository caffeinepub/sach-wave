const ACCESS_CODE_KEY = 'sach_wave_access_unlocked';
const CORRECT_CODE = 'sach26';

export function isAppUnlocked(): boolean {
  try {
    return localStorage.getItem(ACCESS_CODE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function unlockApp(): void {
  try {
    localStorage.setItem(ACCESS_CODE_KEY, 'true');
  } catch (error) {
    console.error('Failed to save unlock state:', error);
  }
}

export function lockApp(): void {
  try {
    localStorage.removeItem(ACCESS_CODE_KEY);
  } catch (error) {
    console.error('Failed to clear unlock state:', error);
  }
}

export function validateAccessCode(code: string): boolean {
  return code === CORRECT_CODE;
}

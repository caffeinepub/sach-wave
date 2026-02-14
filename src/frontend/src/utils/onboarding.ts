const ONBOARDING_KEY = 'sach-wave-onboarding-complete';

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Failed to save onboarding state:', error);
  }
}

// Startup utilities for timeout and phase tracking

export type StartupPhase = 
  | 'initializing-identity'
  | 'connecting-backend'
  | 'loading-profile'
  | 'ready'
  | 'error';

export interface StartupError {
  phase: StartupPhase;
  message: string;
  error?: Error;
}

/**
 * Creates a timeout promise that rejects after the specified duration
 */
export function createTimeout(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Races a promise against a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  return Promise.race([promise, createTimeout(timeoutMs, timeoutMessage)]);
}

/**
 * Log startup phase transitions in development
 */
export function logStartupPhase(phase: StartupPhase, details?: string) {
  if (import.meta.env.DEV) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Startup: ${phase}${details ? ` - ${details}` : ''}`);
  }
}

/**
 * Log startup errors in development
 */
export function logStartupError(error: StartupError) {
  if (import.meta.env.DEV) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Startup Error in ${error.phase}:`, error.message, error.error);
  }
}

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

export interface ErrorClassification {
  userMessage: string;
  devMessage: string;
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
    console.log(`[${timestamp}] Startup Phase: ${phase}${details ? ` - ${details}` : ''}`);
  }
}

/**
 * Log startup errors in development with full context
 */
export function logStartupError(error: StartupError) {
  if (import.meta.env.DEV) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Startup Error in phase "${error.phase}":`, {
      message: error.message,
      error: error.error,
      stack: error.error?.stack,
    });
  }
}

/**
 * Classify startup errors into user-facing and developer-facing messages
 */
export function classifyStartupError(error: unknown, phase: StartupPhase): ErrorClassification {
  const errorMessage = String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Log full details in development
  if (import.meta.env.DEV) {
    console.error(`[Startup Error Classification] Phase: ${phase}`, {
      error,
      message: errorMessage,
      stack: errorStack,
    });
  }

  // Classify based on phase and error content
  if (phase === 'connecting-backend') {
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return {
        userMessage: 'Unable to connect to the backend. Please check your internet connection and try again.',
        devMessage: `Backend connection failed: ${errorMessage}`,
      };
    }
    return {
      userMessage: 'Failed to connect to the backend. Please try again.',
      devMessage: `Backend actor initialization error: ${errorMessage}`,
    };
  }

  if (phase === 'loading-profile') {
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return {
        userMessage: 'Unable to load your profile. Please check your internet connection and try again.',
        devMessage: `Profile load failed (network): ${errorMessage}`,
      };
    }
    return {
      userMessage: 'Failed to load your profile. Please try again.',
      devMessage: `Profile fetch error: ${errorMessage}`,
    };
  }

  if (phase === 'initializing-identity') {
    return {
      userMessage: 'Failed to initialize authentication. Please try again.',
      devMessage: `Identity initialization error: ${errorMessage}`,
    };
  }

  // Generic fallback
  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    devMessage: `Startup error in phase ${phase}: ${errorMessage}`,
  };
}

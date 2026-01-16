/**
 * Debounce and rate limiting utilities
 */

/**
 * Creates a debounced version of a function
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Creates a throttled version of a function
 * Ensures function is called at most once per interval
 * @param fn Function to throttle
 * @param interval Minimum interval between calls in milliseconds
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let pendingCall: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall >= interval) {
      lastCallTime = now;
      fn(...args);
    } else if (!pendingCall) {
      pendingCall = setTimeout(() => {
        lastCallTime = Date.now();
        fn(...args);
        pendingCall = null;
      }, interval - timeSinceLastCall);
    }
  };
}

/**
 * Simple rate limiter class for Firebase operations
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;
  
  constructor(maxRequests: number = 10, windowMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  /**
   * Check if a request can be made
   * @returns true if request is allowed, false if rate limited
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove timestamps outside the window
    this.timestamps = this.timestamps.filter(ts => now - ts < this.windowMs);
    
    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get time until next request is allowed
   * @returns milliseconds until next request is allowed, 0 if allowed now
   */
  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) {
      // Remove the timestamp we just added
      this.timestamps.pop();
      return 0;
    }
    
    const oldestTimestamp = Math.min(...this.timestamps);
    return this.windowMs - (Date.now() - oldestTimestamp);
  }
  
  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.timestamps = [];
  }
}

// Global rate limiter for Firebase operations (10 requests per second)
export const firebaseRateLimiter = new RateLimiter(10, 1000);

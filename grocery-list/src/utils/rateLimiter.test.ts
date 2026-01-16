import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, RateLimiter } from './rateLimiter';

// Mock timers
vi.useFakeTimers();

describe('debounce', () => {
  it('should delay function execution', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);
    
    debouncedFn();
    expect(fn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should only execute once for rapid calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on each call', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);
    
    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);
    
    expect(fn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the function', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);
    
    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('throttle', () => {
  it('should execute immediately on first call', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);
    
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not execute again within interval', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);
    
    throttledFn();
    throttledFn();
    throttledFn();
    
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should execute pending call after interval', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);
    
    throttledFn();
    throttledFn();
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments to the function', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);
    
    throttledFn('immediate');
    expect(fn).toHaveBeenCalledWith('immediate');
  });
});

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests under limit', () => {
    const limiter = new RateLimiter(5, 1000);
    
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
  });

  it('should block requests over limit', () => {
    const limiter = new RateLimiter(3, 1000);
    
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(false);
  });

  it('should allow requests after window expires', () => {
    const limiter = new RateLimiter(2, 1000);
    
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(true);
    expect(limiter.canMakeRequest()).toBe(false);
    
    vi.advanceTimersByTime(1000);
    
    expect(limiter.canMakeRequest()).toBe(true);
  });

  it('should return correct time until next request', () => {
    const limiter = new RateLimiter(1, 1000);
    
    expect(limiter.getTimeUntilNextRequest()).toBe(0);
    limiter.canMakeRequest();
    
    vi.advanceTimersByTime(300);
    const timeLeft = limiter.getTimeUntilNextRequest();
    expect(timeLeft).toBeGreaterThan(0);
    expect(timeLeft).toBeLessThanOrEqual(700);
  });

  it('should reset properly', () => {
    const limiter = new RateLimiter(1, 1000);
    
    limiter.canMakeRequest();
    expect(limiter.canMakeRequest()).toBe(false);
    
    limiter.reset();
    expect(limiter.canMakeRequest()).toBe(true);
  });
});

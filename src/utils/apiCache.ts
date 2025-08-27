/**
 * Simple in-memory cache for API responses
 * Helps prevent repeated API calls for the same data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Generate a cache key from URL and parameters
   */
  private generateKey(url: string, params?: Record<string, unknown>): string {
    if (!params) return url;
    
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${url}?${sortedParams}`;
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(url: string, params?: Record<string, unknown>): T | null {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Store data in cache with optional TTL
   */
  set<T>(url: string, data: T, params?: Record<string, unknown>, ttl?: number): void {
    const key = this.generateKey(url, params);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(url: string, params?: Record<string, unknown>): void {
    const key = this.generateKey(url, params);
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired
    };
  }
}

// Create singleton instance
export const apiCache = new APICache();

/**
 * Cached fetch wrapper
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  params?: Record<string, unknown>,
  ttl?: number
): Promise<T> {
  // For POST requests, include body in cache key
  let cacheParams = params;
  if (options?.method === 'POST' && options?.body) {
    try {
      const bodyData = JSON.parse(options.body as string);
      cacheParams = { ...params, ...bodyData };
    } catch {
      // If body is not JSON, use as-is
      cacheParams = { ...params, body: options.body };
    }
  }

  // Try to get from cache first
  const cached = apiCache.get<T>(url, cacheParams);
  if (cached) {
    console.log(`Cache hit for ${url}`);
    return cached;
  }

  // Fetch from API
  console.log(`Cache miss for ${url}, fetching...`);
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Store in cache
  apiCache.set(url, data, cacheParams, ttl);

  return data;
}

// Cleanup expired entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * In-Memory High-Performance TTL Cache
 * Drastically reduces MongoDB Atlas queries, latency and network round-trips.
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a cached value with TTL in seconds
   */
  set(key, data, ttlSeconds = 60) {
    const expireAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expireAt });
  }

  /**
   * Get cached data if not expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expireAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Delete a specific cache key
   */
  del(key) {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or regex pattern
   */
  invalidatePattern(prefix) {
    for (const key of this.cache.keys()) {
      if (key.includes(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  flush() {
    this.cache.clear();
  }

  /**
   * Express Middleware to cache GET endpoints
   * @param {number} ttlSeconds - Duration to cache response in seconds
   * @param {string} prefix - Optional namespace for targeted invalidation
   */
  middleware(ttlSeconds = 60, prefix = '') {
    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // If user is authenticated admin asking for fresh data or query has nocache, skip
      if (req.headers['x-no-cache'] || req.query.nocache === 'true') {
        return next();
      }

      const cacheKey = `${prefix}:${req.originalUrl || req.url}`;
      const cachedResponse = this.get(cacheKey);

      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);
        return res.status(200).json(cachedResponse);
      }

      // Intercept res.json to store into cache
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(cacheKey, body, ttlSeconds);
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}`);
        }
        return originalJson(body);
      };

      next();
    };
  }
}

const memoryCache = new MemoryCache();

module.exports = memoryCache;

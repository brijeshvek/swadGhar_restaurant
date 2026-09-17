/**
 * Bounded In-Memory High-Performance TTL Cache
 * Ultra-lightweight with max item limits to prevent memory leaks on free cloud hosting (Render 512MB RAM).
 */

class MemoryCache {
  constructor(maxEntries = 100) {
    this.cache = new Map();
    this.maxEntries = maxEntries;

    // Periodically prune expired entries every 60 seconds (unref'd to prevent keeping process alive)
    const timer = setInterval(() => this.pruneExpired(), 60000);
    if (timer.unref) timer.unref();
  }

  /**
   * Set a cached value with TTL in seconds and auto-eviction if capacity reached
   */
  set(key, data, ttlSeconds = 60) {
    // If cache is at max capacity, evict the oldest entry
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

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
   * Prune all expired entries to immediately free memory
   */
  pruneExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireAt) {
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
   */
  middleware(ttlSeconds = 60, prefix = '') {
    return (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

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

const memoryCache = new MemoryCache(100);

module.exports = memoryCache;

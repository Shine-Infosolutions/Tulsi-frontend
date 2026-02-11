const CACHE_PREFIX = 'tulsi_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const sessionCache = {
  set: (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },
  
  get: (key) => {
    try {
      const cached = sessionStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        sessionCache.remove(key);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      sessionStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },
  
  clear: () => {
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
  
  invalidatePattern: (pattern) => {
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX) && key.includes(pattern)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
};

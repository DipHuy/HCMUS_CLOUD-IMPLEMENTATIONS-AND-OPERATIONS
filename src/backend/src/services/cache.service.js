const Redis = require("ioredis");

const redis = new Redis(process.env.CACHE_URL, {
  connectTimeout: 10000,
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => console.error("Valkey/Redis Error:", err));
redis.on("connect", () => console.log("Connected to Valkey Cache"));

const CacheService = {
  get: async (key) => {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  set: async (key, value, ttl = 3600) => {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
      console.error("Cache Set Error:", error);
    }
  },

  del: async (key) => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Cache Delete Error:", error);
    }
  },
};

module.exports = CacheService;

import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

// Test connection on startup
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.connect();
    await redis.ping();
    console.log("Redis connection verified");
    return true;
  } catch (err) {
    console.error("Redis connection failed:", err);
    return false;
  }
}

export default redis;

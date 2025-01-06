import { Redis } from 'ioredis'

const globalForRedis = global as unknown as { redis: Redis }

export const redis = globalForRedis.redis || new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
})

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis 
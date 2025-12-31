// api/_redis.ts
import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL environment variable is not set");

  if (!client) {
    client = createClient({ url });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });
  }

  // In serverless, the client can exist but not be connected (cold/warm edge cases)
  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRedis } from "./_redis.js";

interface PostStats {
  postId: string;
  helpful: number;
  notHelpful: number;
  views: number;
}

function toInt(value: unknown, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === "number") return Math.trunc(value);
  if (typeof value === "string") return parseInt(value, 10) || fallback;
  try {
    const v: any = value;
    if (v?.toString) return parseInt(v.toString(), 10) || fallback;
  } catch {}
  return fallback;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid authorization header" });
    }

    const providedPassword = authHeader.substring(7); // Remove "Bearer " prefix
    if (providedPassword !== adminPassword) {
      return res.status(401).json({ error: "Unauthorized: Invalid password" });
    }

    // Authentication successful, fetch stats
    const redis = await getRedis();

    // Scan for all stats keys matching pattern "stats:briefing-*"
    const keys: string[] = [];
    let cursor = 0;

    do {
      const result = await redis.scan(cursor, {
        MATCH: "stats:briefing-*",
        COUNT: 100
      });
      cursor = result.cursor;
      keys.push(...result.keys);
    } while (cursor !== 0);

    // Fetch stats for each key
    const stats: PostStats[] = await Promise.all(
      keys.map(async (key) => {
        const postId = key.replace("stats:", "");

        const helpfulRaw = await redis.hGet(key, "helpful");
        const notHelpfulRaw = await redis.hGet(key, "not_helpful");
        const viewsRaw = await redis.hGet(key, "views");

        return {
          postId,
          helpful: toInt(helpfulRaw, 0),
          notHelpful: toInt(notHelpfulRaw, 0),
          views: toInt(viewsRaw, 0),
        };
      })
    );

    return res.status(200).json({ stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}

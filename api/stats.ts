import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRedis } from "./_redis.js";

function isValidPostId(postId: string): boolean {
  const pattern = /^briefing-\d{4}-\d{2}-\d{2}$/;
  return pattern.test(postId) && postId.length < 100;
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const raw = req.query.postId;
    const postId =
      typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

    if (!postId) return res.status(400).json({ error: "Post ID is required" });
    if (!isValidPostId(postId)) return res.status(400).json({ error: "Invalid post ID format" });

    const redis = await getRedis();
    const statsKey = `stats:${postId}`;

    const helpfulRaw = await redis.hGet(statsKey, "helpful");
    const notHelpfulRaw = await redis.hGet(statsKey, "not_helpful");
    const viewsRaw = await redis.hGet(statsKey, "views");

    return res.status(200).json({
      postId,
      helpful: toInt(helpfulRaw, 0),
      notHelpful: toInt(notHelpfulRaw, 0),
      views: toInt(viewsRaw, 0),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}

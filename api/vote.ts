// api/vote.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRedis } from "./_redis.js";

// Validate postId format (only allow briefing-YYYY-MM-DD)
function isValidPostId(postId: string): boolean {
  const pattern = /^briefing-\d{4}-\d{2}-\d{2}$/;
  return pattern.test(postId) && postId.length < 100;
}

// Robust conversion because some Vercel TS builds type redis returns as unknown/{}.
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS for CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Normalize body -> typed vars
    const body = req.body as unknown;

    if (typeof body !== "object" || body === null) {
      return res.status(400).json({ error: "Post ID and vote are required" });
    }

    const postIdRaw = (body as any).postId;
    const voteRaw = (body as any).vote;

    if (typeof postIdRaw !== "string" || typeof voteRaw !== "string") {
      return res.status(400).json({ error: "Post ID and vote are required" });
    }

    if (!isValidPostId(postIdRaw)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }

    if (voteRaw !== "helpful" && voteRaw !== "not_helpful") {
      return res.status(400).json({ error: 'Vote must be "helpful" or "not_helpful"' });
    }

    const postIdStr: string = postIdRaw;
    const voteField: "helpful" | "not_helpful" = voteRaw;

    // Get IP address for deduplication (1 vote per IP per post per 24h)
    const xfwd = req.headers["x-forwarded-for"];
    const xreal = req.headers["x-real-ip"];
    const ip =
      (typeof xfwd === "string" ? xfwd.split(",")[0].trim() : undefined) ??
      (typeof xreal === "string" ? xreal.trim() : undefined) ??
      req.socket.remoteAddress ??
      "unknown";

    const redis = await getRedis();

    const dedupeKey = `vote:${postIdStr}:${ip}`;
    const statsKey = `stats:${postIdStr}`;

    const alreadyVoted = await redis.get(dedupeKey);

    if (alreadyVoted) {
      const helpfulRaw = await redis.hGet(statsKey, "helpful");
      const notHelpfulRaw = await redis.hGet(statsKey, "not_helpful");

      return res.status(200).json({
        ok: true,
        deduped: true,
        helpful: toInt(helpfulRaw, 0),
        notHelpful: toInt(notHelpfulRaw, 0),
      });
    }

    // Set dedupe key with 24h expiry
    await redis.set(dedupeKey, "1", { EX: 86400 });

    // Increment vote count in stats hash
    await redis.hIncrBy(statsKey, voteField, 1);

    // Return updated stats
    const helpfulRaw = await redis.hGet(statsKey, "helpful");
    const notHelpfulRaw = await redis.hGet(statsKey, "not_helpful");

    return res.status(200).json({
      ok: true,
      helpful: toInt(helpfulRaw, 0),
      notHelpful: toInt(notHelpfulRaw, 0),
    });
  } catch (error) {
    console.error("Error recording vote:", error);
    return res.status(500).json({ error: "Failed to record vote" });
  }
}


// api/vote.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRedis } from "./_redis";

// Validate postId format (only allow briefing-YYYY-MM-DD)
function isValidPostId(postId: string): boolean {
  const pattern = /^briefing-\d{4}-\d{2}-\d{2}$/;
  return pattern.test(postId) && postId.length < 100;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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

    // IP for dedupe (1 vote/IP/post/24h)
    const xfwd = req.headers["x-forwarded-for"];
    const xreal = req.headers["x-real-ip"];
    const ip =
      (typeof xfwd === "string" ? xfwd.split(",")[0].trim() : undefined) ??
      (typeof xreal === "string" ? xreal.trim() : undefined) ??
      req.socket.remoteAddress ??
      "unknown";

    const redis = await getRedis();

    const dedupeKey = `vote:${postIdStr}:${ip}`;
    const alreadyVoted = await redis.get(dedupeKey);

    const statsKey = `stats:${postIdStr}`;

    if (alreadyVoted) {
      const helpful = (await redis.hGet(statsKey, "helpful")) ?? "0";
      const notHelpful = (await redis.hGet(statsKey, "not_helpful")) ?? "0";

      return res.status(200).json({
        ok: true,
        deduped: true,
        helpful: parseInt(helpful, 10),
        notHelpful: parseInt(notHelpful, 10),
      });
    }

    await redis.set(dedupeKey, "1", { EX: 86400 });

    // Increment vote count
    await redis.hIncrBy(statsKey, voteField, 1);

    const helpful = (await redis.hGet(statsKey, "helpful")) ?? "0";
    const notHelpful = (await redis.hGet(statsKey, "not_helpful")) ?? "0";

    return res.status(200).json({
      ok: true,
      helpful: parseInt(helpful, 10),
      notHelpful: parseInt(notHelpful, 10),
    });
  } catch (error) {
    console.error("Error recording vote:", error);
    return res.status(500).json({ error: "Failed to record vote" });
  }
}

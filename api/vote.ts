import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis } from './_redis';

// Validate postId format (only allow briefing-YYYY-MM-DD)
function isValidPostId(postId: string): boolean {
  const pattern = /^briefing-\d{4}-\d{2}-\d{2}$/;
  return pattern.test(postId) && postId.length < 100;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postId, vote } = req.body;

    // Validate inputs
    if (!postId || typeof postId !== 'string' || !vote || typeof vote !== 'string') {
      return res.status(400).json({ error: 'Post ID and vote are required' });
    }

    if (!isValidPostId(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    if (vote !== 'helpful' && vote !== 'not_helpful') {
      return res.status(400).json({ error: 'Vote must be "helpful" or "not_helpful"' });
    }

    // Get IP address for deduplication
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const ipString = Array.isArray(ip) ? ip[0] : ip;

    const redis = await getRedis();

    // Check if user already voted (dedupe: 1 vote per IP per post per 24h)
    const dedupeKey = `vote:${postId}:${ipString}`;
    const alreadyVoted = await redis.get(dedupeKey);

    if (alreadyVoted) {
      // Already voted, return current stats without incrementing
      const statsKey = `stats:${postId}`;
      const helpful = (await redis.hGet(statsKey, 'helpful')) ?? '0';
      const notHelpful = (await redis.hGet(statsKey, 'not_helpful')) ?? '0';

      return res.status(200).json({
        ok: true,
        deduped: true,
        helpful: parseInt(helpful, 10),
        notHelpful: parseInt(notHelpful, 10)
      });
    }

    // Set dedupe key with 24h expiry
    await redis.set(dedupeKey, '1', { EX: 86400 });

    // Increment vote count in stats hash
    const statsKey = `stats:${postId}`;
    await redis.hIncrBy(statsKey, vote, 1);

    // Get current counts
    const helpful = (await redis.hGet(statsKey, 'helpful')) ?? '0';
    const notHelpful = (await redis.hGet(statsKey, 'not_helpful')) ?? '0';

    return res.status(200).json({
      ok: true,
      helpful: parseInt(helpful, 10),
      notHelpful: parseInt(notHelpful, 10)
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return res.status(500).json({ error: 'Failed to record vote' });
  }
}

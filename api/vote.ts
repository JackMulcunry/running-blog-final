import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Validate postId format (only allow briefing-YYYY-MM-DD)
function isValidPostId(postId: string): boolean {
  const pattern = /^briefing-\d{4}-\d{2}-\d{2}$/;
  return pattern.test(postId) && postId.length < 100;
}

// Rate limiting: max 10 votes per IP per hour
async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `ratelimit:vote:${ip}`;
  const count = await kv.incr(key);

  if (count === 1) {
    // Set expiry of 1 hour on first request
    await kv.expire(key, 3600);
  }

  return count <= 10;
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
    // Rate limiting by IP
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const ipString = Array.isArray(ip) ? ip[0] : ip;

    const withinLimit = await checkRateLimit(ipString);
    if (!withinLimit) {
      return res.status(429).json({ error: 'Too many votes. Please try again later.' });
    }

    const { postId, vote } = req.body;

    // Validate inputs
    if (!postId || typeof postId !== 'string' || !vote || typeof vote !== 'string') {
      return res.status(400).json({ error: 'Post ID and vote are required' });
    }

    if (!isValidPostId(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    if (vote !== 'up' && vote !== 'down') {
      return res.status(400).json({ error: 'Vote must be "up" or "down"' });
    }

    // Increment vote count
    const field = vote === 'up' ? 'upvotes' : 'downvotes';
    await kv.hincrby(`post:${postId}`, field, 1);

    // Get current counts
    const stats = await kv.hgetall(`post:${postId}`);

    return res.status(200).json({
      success: true,
      upvotes: stats?.upvotes || 0,
      downvotes: stats?.downvotes || 0
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return res.status(500).json({ error: 'Failed to record vote' });
  }
}

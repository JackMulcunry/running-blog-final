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
    const { postId } = req.body;

    // Validate input
    if (!postId || typeof postId !== 'string') {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    if (!isValidPostId(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    const redis = await getRedis();

    // Increment view count in stats hash
    const statsKey = `stats:${postId}`;
    const views = await redis.hIncrBy(statsKey, 'views', 1);

    return res.status(200).json({ success: true, views });
  } catch (error) {
    console.error('Error tracking view:', error);
    return res.status(500).json({ error: 'Failed to track view' });
  }
}

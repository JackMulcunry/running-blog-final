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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postId } = req.query;

    // Validate input
    if (!postId || typeof postId !== 'string') {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    if (!isValidPostId(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    const redis = await getRedis();

    // Get stats for the post
    const statsKey = `stats:${postId}`;
    const helpful = await redis.hGet(statsKey, 'helpful') || '0';
    const notHelpful = await redis.hGet(statsKey, 'not_helpful') || '0';
    const views = await redis.hGet(statsKey, 'views') || '0';

    return res.status(200).json({
      postId,
      helpful: parseInt(helpful, 10),
      notHelpful: parseInt(notHelpful, 10),
      views: parseInt(views, 10)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

# Post Feedback & Analytics Setup

This app now includes view tracking and user feedback (thumbs up/down) using Vercel KV (Redis).

## Features

- **View Tracking**: Automatically tracks when users view a post
- **Thumbs Up/Down**: Users can vote if a post was helpful
- **Vote Prevention**: LocalStorage prevents multiple votes from same browser
- **Stats Display**: Shows vote counts and helpful percentage

## Setup Instructions

### 1. Create a Vercel KV Database

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database
3. Select "KV" (Redis)
4. Name it something like "6amkick-analytics"
5. Click "Create"

### 2. Connect to Your Project

Vercel will automatically add these environment variables to your project:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

These are automatically available in your API routes when deployed to Vercel.

### 3. Local Development

For local development, you need to pull the environment variables:

```bash
vercel env pull .env.local
```

Then run your dev server:

```bash
npm run dev
```

## API Endpoints

### `POST /api/track-view`
Tracks a page view.

**Request:**
```json
{
  "postId": "briefing-2025-12-30"
}
```

**Response:**
```json
{
  "success": true,
  "views": 42
}
```

### `POST /api/vote`
Records a user vote.

**Request:**
```json
{
  "postId": "briefing-2025-12-30",
  "vote": "up" // or "down"
}
```

**Response:**
```json
{
  "success": true,
  "upvotes": 15,
  "downvotes": 2
}
```

### `GET /api/stats?postId=briefing-2025-12-30`
Gets stats for a post.

**Response:**
```json
{
  "views": 42,
  "upvotes": 15,
  "downvotes": 2
}
```

## Data Structure

Each post's data is stored in Redis as a hash:

```
Key: post:briefing-2025-12-30
Fields:
  - views: 42
  - upvotes: 15
  - downvotes: 2
```

## Abuse Prevention

- **LocalStorage**: Prevents casual repeat voting from same browser
- **Server-side**: Could add IP rate limiting if needed (not implemented)
- **Browser fingerprinting**: Could add FingerprintJS for better tracking (not implemented)

## Future Enhancements

- Display view count on post cards
- Add "trending" sort based on views/votes
- Weekly/monthly analytics dashboard
- Export analytics data

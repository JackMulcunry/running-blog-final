# Admin Dashboard Implementation Plan

## Overview
Create a secure admin page at `/admin` that displays all blog posts with their analytics stats (views, helpful votes, not helpful votes).

## Architecture Decisions

### Authentication
- **Method**: Simple password-based auth using environment variable `ADMIN_PASSWORD`
- **Storage**: Session stored in localStorage after successful login
- **Security**: Password validation happens server-side via new API endpoint

### Routing
- Add new "admin" view to existing App.tsx state management
- Consistent with current single-page architecture (home/post/admin)

### Data Flow
1. Frontend loads all posts from `public/data/posts/index.json`
2. For each post, fetch stats from `/api/stats?postId={id}`
3. Display combined data in table format
4. Backend API endpoint validates admin password before returning aggregated stats

## Implementation Steps

### 1. Create API Endpoint: `/api/admin-stats.ts`
**Purpose**: Return stats for all posts with password authentication

**Security Features**:
- Require `Authorization: Bearer {password}` header
- Validate against `ADMIN_PASSWORD` environment variable
- Return 401 if unauthorized
- CORS headers for security
- Only allow GET requests

**Functionality**:
- Accept optional `postIds` query parameter (comma-separated list)
- If not provided, scan Redis for all keys matching `stats:briefing-*`
- Use Redis `KEYS` command or `SCAN` for pattern matching
- For each post, return `{ postId, helpful, notHelpful, views }`
- Return array of all stats

**Data Structure**:
```typescript
Response: {
  stats: Array<{
    postId: string;
    helpful: number;
    notHelpful: number;
    views: number;
  }>
}
```

### 2. Create Admin Component: `/src/pages/Admin.tsx`
**Purpose**: Display admin dashboard with authentication

**Features**:
- Login form if not authenticated
  - Single password input field
  - Submit button
  - Error message display
  - Store auth token in localStorage as `admin-token`

- After authentication:
  - Load posts from index.json
  - Fetch all stats from `/api/admin-stats` with auth header
  - Combine post data with stats
  - Display in sortable table

**Table Columns**:
1. Date (sortable)
2. Title (with link to view post)
3. Category
4. Views (sortable)
5. Helpful votes (sortable)
6. Not Helpful votes (sortable)
7. Helpful Ratio % (calculated: helpful / (helpful + notHelpful) * 100)

**UI Components**:
- Use existing shadcn/ui components (Button, Table)
- Yellow theme consistent with site design
- Responsive layout
- Logout button
- Loading states
- Error handling

### 3. Update App.tsx Routing
**Changes**:
- Add "admin" to view state type: `"home" | "post" | "admin"`
- Add navigation function `handleNavigateToAdmin`
- Add conditional render for admin view
- Add navigation to admin from WebsiteHeader (hidden link or dev-only)

### 4. Environment Variables
**Required**:
- `ADMIN_PASSWORD` - Secret password for admin access
- Document in README or .env.example

### 5. Security Checklist
- ✅ Password stored in environment variable (not in code)
- ✅ Auth validation server-side only
- ✅ No password transmitted in URL/query params
- ✅ Use Bearer token in Authorization header
- ✅ CORS headers configured
- ✅ HTTPS only in production (Vercel default)
- ✅ No sensitive data in Redis keys (postIds only)
- ✅ Input validation on postId patterns
- ✅ Rate limiting considerations (rely on Vercel's built-in)

## Files to Create
1. `/api/admin-stats.ts` - New API endpoint
2. `/src/pages/Admin.tsx` - Admin dashboard component

## Files to Modify
1. `/src/App.tsx` - Add admin routing
2. `/src/components/WebsiteHeader.tsx` - Add hidden admin link (optional)

## Testing Steps
1. Set `ADMIN_PASSWORD` in environment variables
2. Navigate to `/admin` route
3. Verify login form appears
4. Test wrong password (should show error)
5. Test correct password (should show dashboard)
6. Verify all posts load with stats
7. Test sorting functionality
8. Test logout and re-login
9. Verify auth token persists in localStorage
10. Test unauthorized API access (should return 401)

## Production Readiness
- All API endpoints use proper error handling
- No console.logs with sensitive data
- Auth token stored client-side (localStorage)
- Server validates all requests
- Redis queries optimized (use SCAN not KEYS for large datasets)
- Responsive design for mobile admin access

export type PostCategory = "Race" | "Training" | "Science" | "Shoes" | "Opinion" | "Weekly";

// "article" = long-form guide, "daily"/"briefing" = short news briefing (see src/lib/related.js).
export type PostType = "briefing" | "daily" | "weekly" | "article";

export interface BriefingPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO format YYYY-MM-DD
  category: PostCategory;
  tags: string[];
  readTimeMinutes: number;
  body: string;
  keyTakeaway?: string; // Optional key takeaway to highlight
  sourceUrl?: string; // Optional source URL for attribution
  postType?: PostType; // Optional post type (defaults to "briefing")
  weekRange?: string; // Optional week range for weekly posts (e.g., "Jan 13 - Jan 19, 2026")
}

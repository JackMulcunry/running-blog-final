export type PostCategory = "Race" | "Training" | "Science" | "Shoes" | "Opinion" | "Weekly";

export type PostType = "briefing" | "weekly";

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

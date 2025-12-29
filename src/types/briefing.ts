export type PostCategory = "Race" | "Training" | "Science" | "Shoes" | "Opinion";

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
}

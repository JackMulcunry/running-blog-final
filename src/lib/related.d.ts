import type { BriefingPost } from "@/types/briefing";

export interface Topic {
  id: string;
  title: string;
  hub?: string;
  neighbors?: number;
  match: (post: BriefingPost) => boolean;
}

export declare const RELATED_COUNT: number;
export declare const TOPICS: Topic[];
export declare function getTopic(post: BriefingPost): Topic | null;
export declare function getTopicPosts<T extends BriefingPost>(
  post: T,
  allPosts: T[],
): { topic: Topic | null; posts: T[] };
export declare function getRelatedPosts<T extends BriefingPost>(
  post: T,
  allPosts: T[],
  excludeSlugs?: string[],
  limit?: number,
): T[];
export declare function getPostLinks<T extends BriefingPost>(
  post: T,
  allPosts: T[],
): { topic: Topic | null; topicPosts: T[]; related: T[] };

// Internal-linking rules for post pages.
//
// Shared by src/pages/briefing/[slug].tsx (client) and scripts/generate-post-pages.cjs
// (build-time static HTML), so the links crawlers see in the raw HTML are exactly the
// links readers see once the app has loaded.
//
// Two blocks are rendered on each post:
//   1. Topic section ("More Marathon Training Plans", ...): every other post in the same
//      topic cluster, hub first. Clusters are matched on slug/post fields so new automated
//      posts join automatically. Clusters with `neighbors` (Race News) instead show the N
//      chronologically nearest posts, so every post in a long-running stream gets inbound
//      links without each page linking to all of them.
//   2. "Related Briefings": RELATED_COUNT more posts, scored by shared title/tag words
//      plus same category, excluding anything already linked in the topic section.

export const RELATED_COUNT = 2;

export const TOPICS = [
  {
    id: "marathon-training",
    title: "Marathon Training Plans",
    hub: "what-is-an-ideal-marathon-training-plan-ajcq",
    match: ({ slug }) =>
      slug.startsWith("marathon-training-plan-") ||
      slug === "what-is-an-ideal-marathon-training-plan-ajcq" ||
      slug === "what-is-the-10-10-rule-for-marathons",
  },
  {
    id: "half-marathon",
    title: "Half Marathon Guides",
    match: ({ slug }) => slug.startsWith("half-marathon-"),
  },
  {
    id: "running-watches",
    title: "GPS Running Watches",
    match: ({ slug }) => slug.startsWith("gps-watch-") || slug === "garmin-vs-coros-for-running",
  },
  {
    id: "running-shoes",
    title: "Running Shoe Guides",
    match: ({ slug }) => slug.startsWith("best-running-shoes-") || slug.startsWith("running-shoes-"),
  },
  {
    id: "trail-running",
    title: "Trail Running Guides",
    match: ({ slug }) => slug.includes("trail-run"),
  },
  {
    // Short daily news briefings: they cite a source article and aren't long-form guides.
    id: "race-news",
    title: "Race News",
    neighbors: 6,
    match: (post) => Boolean(post.sourceUrl) && post.postType !== "article",
  },
];

/** The first topic whose rule matches the post, or null. */
export function getTopic(post) {
  return TOPICS.find((t) => t.match(post)) ?? null;
}

/** Other posts in the same topic cluster. */
export function getTopicPosts(post, allPosts) {
  const topic = getTopic(post);
  if (!topic) return { topic: null, posts: [] };
  const members = allPosts.filter((p) => getTopic(p) === topic);

  if (topic.neighbors) {
    // Chronological neighbours: half newer, half older, shifted at either end of the stream.
    const byDate = [...members].sort(
      (a, b) => String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug),
    );
    const i = byDate.findIndex((p) => p.slug === post.slug);
    const n = Math.min(topic.neighbors, byDate.length - 1);
    let start = Math.max(0, i - Math.floor(n / 2));
    start = Math.min(start, byDate.length - 1 - n);
    const posts = byDate.slice(start, start + n + 1).filter((p) => p.slug !== post.slug);
    return { topic, posts };
  }

  const posts = members
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      if (a.slug === topic.hub) return -1;
      if (b.slug === topic.hub) return 1;
      return a.title.localeCompare(b.title);
    });
  return { topic, posts };
}

const STOPWORDS = new Set(
  "the a an and or for to of in on at with your you is are what how why when best 2026 guide complete every runner runners running run".split(
    " ",
  ),
);

function keywords(post) {
  const text = [post.title, ...(post.tags || [])].join(" ").toLowerCase();
  return new Set(
    text
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
  );
}

/** Best-matching other posts, excluding the given slugs. */
export function getRelatedPosts(post, allPosts, excludeSlugs = [], limit = RELATED_COUNT) {
  const exclude = new Set([post.slug, ...excludeSlugs]);
  const mine = keywords(post);
  return allPosts
    .filter((p) => !exclude.has(p.slug))
    .map((p) => {
      let score = p.category === post.category ? 2 : 0;
      for (const w of keywords(p)) if (mine.has(w)) score += 1;
      return { p, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(b.p.date).localeCompare(String(a.p.date)) ||
        a.p.slug.localeCompare(b.p.slug),
    )
    .slice(0, limit)
    .map(({ p }) => p);
}

/** Everything a post page links to: topic cluster + related. */
export function getPostLinks(post, allPosts) {
  const { topic, posts: topicPosts } = getTopicPosts(post, allPosts);
  const related = getRelatedPosts(
    post,
    allPosts,
    topicPosts.map((p) => p.slug),
  );
  return { topic, topicPosts, related };
}

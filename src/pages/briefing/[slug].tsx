import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Calendar, Clock, Tag, CalendarDays, ExternalLink } from "lucide-react";
import { BriefingPost } from "../../types/briefing";
import PostFeedback from "../../components/PostFeedback";
import AffiliateCard, { AffiliateProduct } from "../../components/AffiliateCard";

function sanitizePostBody(html: string): string {
  let result = html
    .replace(/<h1[^>]*>.*?<\/h1>/i, "")
    .replace(/<p>---<\/p>/g, "<hr>");

  // FIX 2: Wrap bare URLs as proper anchor tags.
  // Protect existing <a> elements first to prevent double-wrapping.
  const savedAnchors: string[] = [];
  result = result.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (match) => {
    savedAnchors.push(match);
    return `\x02ANCHOR_${savedAnchors.length - 1}\x03`;
  });
  result = result.replace(/https?:\/\/[^\s<>"']+/g, (url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  );
  result = result.replace(/\x02ANCHOR_(\d+)\x03/g, (_, i) => savedAnchors[parseInt(i, 10)]);

  // FIX 2 continued: In sections whose heading contains "Reference", reformat
  // any paragraph that packs multiple numbered items into a single <p> so each
  // item renders on its own line as an <ol>.
  result = result.replace(
    /(<h[23][^>]*>[^<]*[Rr]eference[^<]*<\/h[23]>)([\s\S]*?)(?=<h[1-3]|$)/gi,
    (_match, heading, content) => {
      const reformatted = content.replace(/<p>([\s\S]*?)<\/p>/gi, (_p, inner) => {
        const trimmed = inner.trim();
        if (/\n\d+\./.test(trimmed)) {
          const items = trimmed.split(/\n(?=\d+\.)/).filter(Boolean);
          if (items.length > 1) {
            return (
              "<ol>" +
              items
                .map((item: string) => `<li>${item.replace(/^\d+\.\s*/, "").trim()}</li>`)
                .join("") +
              "</ol>"
            );
          }
        }
        return `<p>${inner}</p>`;
      });
      return heading + reformatted;
    },
  );

  return result;
}

// Split HTML at the first <h2> so the key takeaway can appear between intro and body
function splitBodyAtFirstH2(html: string): [string, string] {
  const match = html.match(/<h2[\s>]/i);
  if (!match || match.index === undefined) return [html, ""];
  return [html.slice(0, match.index), html.slice(match.index)];
}

const categoryColors: Record<string, string> = {
  Race: "bg-blue-50 text-blue-700 border-blue-200",
  Training: "bg-green-50 text-green-700 border-green-200",
  Science: "bg-purple-50 text-purple-700 border-purple-200",
  Shoes: "bg-orange-50 text-orange-700 border-orange-200",
  Opinion: "bg-gray-50 text-gray-600 border-gray-200",
  Weekly: "bg-indigo-100 text-indigo-800 border-indigo-300",
};

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getWeekRange(post: BriefingPost) {
  if (post.weekRange) return post.weekRange;
  const [year, month, day] = post.date.split("-").map(Number);
  const endDate = new Date(year, month - 1, day);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return `${fmt(startDate)} – ${fmt(endDate)}, ${endDate.getFullYear()}`;
}

const BriefingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BriefingPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BriefingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [gearMatches, setGearMatches] = useState<AffiliateProduct[]>([]);

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(
        docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0,
      );
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  // Match affiliate products against article body text whenever post loads
  useEffect(() => {
    if (!post) return;
    const loadAffiliates = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/affiliates.json`);
        if (!res.ok) return;
        const data: { products: AffiliateProduct[] } = await res.json();
        const bodyText = post.body.replace(/<[^>]+>/g, " ");
        const matches = data.products.filter(
          (p) => p.url && bodyText.toLowerCase().includes(p.name.toLowerCase()),
        );
        setGearMatches(matches);
      } catch {
        // Affiliate system is optional — silently fail
      }
    };
    loadAffiliates();
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/posts/${slug}.json`,
        );
        if (!response.ok) throw new Error("Post not found");
        const data = await response.json();
        setPost(data);
        trackView(data.id);
        await loadRelatedPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

  const loadRelatedPosts = async (currentPost: BriefingPost) => {
    try {
      const indexRes = await fetch(
        `${import.meta.env.BASE_URL}data/posts/index.json`,
      );
      const filenames: string[] = await indexRes.json();

      const allPosts = await Promise.all(
        filenames.map(async (filename) => {
          const cleanFilename = filename.replace(/^\/+/, "").replace(".json", "");
          const res = await fetch(
            `${import.meta.env.BASE_URL}data/posts/${cleanFilename}.json`,
          );
          return await res.json();
        }),
      );

      const otherPosts = allPosts.filter((p) => p.id !== currentPost.id);
      const withMatchingTags = otherPosts.filter((p) =>
        p.tags.some((tag: string) => currentPost.tags.includes(tag)),
      );

      let related: BriefingPost[] = [];
      if (withMatchingTags.length >= 2) {
        related = withMatchingTags.slice(0, 2);
      } else if (withMatchingTags.length === 1) {
        related = [withMatchingTags[0]];
        const remaining = otherPosts.filter((p) => p.id !== related[0].id);
        if (remaining.length > 0) {
          remaining.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
          related.push(remaining[0]);
        }
      } else {
        otherPosts.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        related = otherPosts.slice(0, 2);
      }

      setRelatedPosts(related);
    } catch (error) {
      console.error("Error loading related posts:", error);
      setRelatedPosts([]);
    }
  };

  const trackView = async (postId: string) => {
    try {
      await fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/60 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-orange border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading briefing...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-amber-50/60 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm">{error || "Post not found"}</p>
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isWeekly = post.postType === "weekly";
  const sanitizedBody = sanitizePostBody(post.body);
  const [bodyIntro, bodyRest] = post.keyTakeaway
    ? splitBodyAtFirstH2(sanitizedBody)
    : [sanitizedBody, ""];

  return (
    <>
      <Helmet>
        <title>{post.title} | 6AMKICK</title>
        <meta name="description" content={post.excerpt} />
        <link
          rel="canonical"
          href={`https://6amkick.com/posts/${post.slug}`}
        />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta
          property="og:url"
          content={`https://6amkick.com/posts/${post.slug}`}
        />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
      </Helmet>

      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-[3px] z-[60] transition-none"
        style={{
          width: `${readingProgress}%`,
          backgroundColor: "#E8501A",
          transitionProperty: "none",
        }}
      />

      <div className="min-h-screen bg-amber-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <div className="mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              All Briefings
            </Button>
          </div>

          {/* Article */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`rounded-xl shadow-sm p-7 sm:p-12 ${
              isWeekly
                ? "bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-200"
                : "bg-white border border-gray-100"
            }`}
          >
            {/* Category badge */}
            <div className="mb-5">
              <span
                className={`inline-block text-[10px] uppercase tracking-[0.1em] font-bold px-3.5 py-1.5 rounded-full border ${
                  isWeekly
                    ? "bg-indigo-600 text-white border-transparent shadow-sm"
                    : categoryColors[post.category] ??
                      "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {isWeekly ? "Weekly Recap" : post.category}
              </span>
            </div>

            {/* Title */}
            <h1
              className={`font-extrabold text-[#1a1a1a] mb-6 leading-tight tracking-[-0.02em] ${
                isWeekly ? "text-3xl sm:text-4xl" : "text-3xl sm:text-[2.6rem]"
              }`}
            >
              {post.title}
            </h1>

            {/* Meta */}
            <div
              className={`flex flex-wrap items-center gap-4 mb-8 text-sm pb-6 border-b ${
                isWeekly
                  ? "text-indigo-600 border-indigo-200"
                  : "text-gray-500 border-gray-100"
              }`}
            >
              {isWeekly ? (
                <div className="flex items-center gap-2 bg-indigo-100/60 rounded-lg px-3 py-1.5 text-sm font-medium">
                  <CalendarDays className="w-4 h-4" />
                  <span>{getWeekRange(post)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(post.date)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTimeMinutes} min read</span>
              </div>
            </div>

            {/* Article body — constrained to optimal reading width */}
            <div className="max-w-[780px]">
              {/* Intro section */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: bodyIntro }}
              />

              {/* Key Takeaway — placed between intro and first section */}
              {post.keyTakeaway && (
                <div
                  className={`my-8 p-5 border-l-4 rounded-r-lg ${
                    isWeekly
                      ? "bg-indigo-50 border-indigo-500"
                      : "bg-amber-50 border-brand-orange"
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-[0.12em] mb-2 ${
                      isWeekly ? "text-indigo-700" : "text-[#E8501A]"
                    }`}
                  >
                    {isWeekly ? "This Week's Takeaway" : "Key Takeaway"}
                  </p>
                  <p className="text-sm sm:text-base leading-[1.75] text-[#1a1a1a] font-medium">
                    {post.keyTakeaway}
                  </p>
                </div>
              )}

              {/* Rest of body (after first h2) */}
              {bodyRest && (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: bodyRest }}
                />
              )}
            </div>

            {/* Source */}
            {post.sourceUrl && (
              <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-gray-400">
                  Source
                </span>
                <span className="text-gray-300 text-xs">—</span>
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-orange transition-colors"
                >
                  {(() => {
                    try {
                      return new URL(post.sourceUrl).hostname.replace(/^www\./, "");
                    } catch {
                      return post.sourceUrl;
                    }
                  })()}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Gear mentioned in article — only renders when affiliate URLs are set */}
            {gearMatches.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <h3 className="text-[10px] uppercase tracking-[0.12em] font-bold text-gray-400 mb-4">
                  Gear Mentioned in This Article
                </h3>
                <div className="flex flex-col gap-3">
                  {gearMatches.map((product) => (
                    <AffiliateCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div
                className={`mt-8 pt-6 border-t ${
                  isWeekly ? "border-indigo-100" : "border-gray-100"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Tag
                    className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                      isWeekly ? "text-indigo-400" : "text-gray-400"
                    }`}
                  />
                  <div className="flex flex-wrap gap-2">
                    {post.tags
                      .filter((tag) => tag !== "weekly")
                      .map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] uppercase tracking-[0.08em] px-3 py-1 rounded-full font-semibold ${
                            isWeekly
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            <PostFeedback postId={post.id} />
          </motion.article>

          {/* Related Briefings */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xs uppercase tracking-[0.12em] font-bold text-gray-400 mb-6">
                Related Briefings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/posts/${related.slug}`}
                    className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 group"
                  >
                    <div className="mb-3">
                      <span
                        className={`text-[10px] uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-full border ${
                          categoryColors[related.category] ??
                          "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {related.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-2 leading-snug group-hover:text-brand-orange transition-colors tracking-tight">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                      {related.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatDate(related.date)}</span>
                      <span>·</span>
                      <span>{related.readTimeMinutes} min read</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom nav */}
          <div className="mt-10">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to All Briefings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BriefingPage;

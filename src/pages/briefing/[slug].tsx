import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Calendar, Clock, Tag, CalendarDays } from "lucide-react";
import { BriefingPost } from "../../types/briefing";
import PostFeedback from "../../components/PostFeedback";

const BriefingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BriefingPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BriefingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/posts/${slug}.json`,
        );
        if (!response.ok) {
          throw new Error("Post not found");
        }
        const data = await response.json();
        setPost(data);

        // Track view after successfully loading the post
        trackView(data.id);

        // Load related posts
        await loadRelatedPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const loadRelatedPosts = async (currentPost: BriefingPost) => {
    try {
      // Load all posts
      const indexRes = await fetch(`${import.meta.env.BASE_URL}data/posts/index.json`);
      const filenames: string[] = await indexRes.json();

      const allPosts = await Promise.all(
        filenames.map(async (filename) => {
          const cleanFilename = filename.replace(/^\/+/, '').replace('.json', '');
          const res = await fetch(`${import.meta.env.BASE_URL}data/posts/${cleanFilename}.json`);
          return await res.json();
        })
      );

      // Filter out current post
      const otherPosts = allPosts.filter(p => p.id !== currentPost.id);

      // Find posts with matching tags
      const postsWithMatchingTags = otherPosts.filter(p =>
        p.tags.some(tag => currentPost.tags.includes(tag))
      );

      // Select 2 related posts
      let related: BriefingPost[] = [];
      if (postsWithMatchingTags.length >= 2) {
        related = postsWithMatchingTags.slice(0, 2);
      } else if (postsWithMatchingTags.length === 1) {
        // 1 matching tag post + 1 most recent
        related = [postsWithMatchingTags[0]];
        const remaining = otherPosts.filter(p => p.id !== related[0].id);
        if (remaining.length > 0) {
          // Sort by date descending
          remaining.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          related.push(remaining[0]);
        }
      } else {
        // No matching tags, use 2 most recent
        otherPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        related = otherPosts.slice(0, 2);
      }

      setRelatedPosts(related);
    } catch (error) {
      console.error('Error loading related posts:', error);
      setRelatedPosts([]);
    }
  };

  const trackView = async (postId: string) => {
    try {
      await fetch('/api/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
    } catch (error) {
      // Silently fail - don't block user experience
      console.error('Error tracking view:', error);
    }
  };

  const formatDate = (dateString: string) => {
    // Parse the date string as UTC to avoid timezone offset issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading briefing...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Post not found"}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isWeekly = post.postType === "weekly";

  const categoryColors: Record<string, string> = {
    Race: "bg-blue-50 text-blue-700 border-blue-200",
    Training: "bg-green-50 text-green-700 border-green-200",
    Science: "bg-purple-50 text-purple-700 border-purple-200",
    Shoes: "bg-orange-50 text-orange-700 border-orange-200",
    Opinion: "bg-gray-50 text-gray-700 border-gray-200",
    Weekly: "bg-indigo-100 text-indigo-800 border-indigo-300",
  };

  // Calculate week range from the post date
  const getWeekRange = (dateString: string) => {
    if (post.weekRange) return post.weekRange;

    const [year, month, day] = dateString.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    const formatShort = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    const endYear = endDate.getFullYear();

    return `${formatShort(startDate)} - ${formatShort(endDate)}, ${endYear}`;
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | 6AMKICK</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://6amkick.vercel.app/posts/${post.slug}`} />

        {/* OpenGraph tags */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://6amkick.vercel.app/posts/${post.slug}`} />
        <meta property="og:type" content="article" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
      </Helmet>

      <div className="min-h-screen bg-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Button onClick={() => navigate('/')} variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Article Header */}
          <article className={`rounded-lg shadow-sm p-8 sm:p-12 ${
            isWeekly
              ? "bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-200"
              : "bg-white"
          }`}>
          {/* Category Badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${
                isWeekly
                  ? "bg-indigo-600 text-white border-0 shadow-sm"
                  : categoryColors[post.category]
              }`}
            >
              {isWeekly ? "Weekly Recap" : post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className={`font-bold text-gray-900 mb-6 leading-tight ${
            isWeekly ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
          }`}>
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className={`flex flex-wrap items-center gap-4 mb-6 text-sm pb-6 border-b ${
            isWeekly
              ? "text-indigo-700 border-indigo-200"
              : "text-gray-600 border-gray-200"
          }`}>
            {isWeekly ? (
              <div className="flex items-center gap-2 bg-indigo-100/60 rounded-lg px-3 py-1.5">
                <CalendarDays className="w-4 h-4" />
                <span className="font-medium">{getWeekRange(post.date)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTimeMinutes} min read</span>
            </div>
          </div>

          {/* Body */}
          <div className="prose prose-lg max-w-none mb-8">
            {post.body.split("\n\n").map((paragraph, index) => (
              <p key={index} className={`mb-4 leading-relaxed ${
                isWeekly ? "text-gray-800" : "text-gray-700"
              }`}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Key Takeaway */}
          {post.keyTakeaway && (
            <div className={`mb-8 p-6 border-l-4 rounded-r ${
              isWeekly
                ? "bg-indigo-50 border-indigo-500"
                : "bg-amber-50 border-amber-400"
            }`}>
              <h3 className={`text-sm font-bold uppercase tracking-wide mb-2 ${
                isWeekly ? "text-indigo-900" : "text-amber-900"
              }`}>
                {isWeekly ? "This Week's Takeaway" : "Key Takeaway"}
              </h3>
              <p className="text-base leading-relaxed text-gray-800">
                {post.keyTakeaway}
              </p>
            </div>
          )}

          {/* Source Attribution */}
          {post.sourceUrl && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Source:{" "}
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {post.sourceUrl}
                </a>
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className={`mt-8 pt-6 border-t ${isWeekly ? "border-indigo-200" : "border-gray-200"}`}>
              <div className="flex items-start gap-2">
                <Tag className={`w-4 h-4 mt-1 ${isWeekly ? "text-indigo-500" : "text-gray-500"}`} />
                <div className="flex flex-wrap gap-2">
                  {post.tags.filter(tag => tag !== "weekly").map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 text-sm rounded-full ${
                        isWeekly
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Component */}
          <PostFeedback postId={post.id} />
        </article>

        {/* Related Briefings */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Briefings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/posts/${relatedPost.slug}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[relatedPost.category]}`}>
                      {relatedPost.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-amber-600 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDate(relatedPost.date)}</span>
                    <span>•</span>
                    <span>{relatedPost.readTimeMinutes} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8">
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Briefings
          </Button>
        </div>
      </div>
    </div>
    </>
  );
};

export default BriefingPage;

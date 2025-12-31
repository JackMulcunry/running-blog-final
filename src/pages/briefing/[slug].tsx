import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { BriefingPost } from "../../types/briefing";

interface BriefingPageProps {
  slug: string;
  onNavigateHome: () => void;
}

const BriefingPage: React.FC<BriefingPageProps> = ({
  slug,
  onNavigateHome,
}) => {
  const [post, setPost] = useState<BriefingPost | null>(null);
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
          <Button onClick={onNavigateHome} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const categoryColors = {
    Race: "bg-blue-50 text-blue-700 border-blue-200",
    Training: "bg-green-50 text-green-700 border-green-200",
    Science: "bg-purple-50 text-purple-700 border-purple-200",
    Shoes: "bg-orange-50 text-orange-700 border-orange-200",
    Opinion: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button onClick={onNavigateHome} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-sm p-8 sm:p-12">
          {/* Category Badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${categoryColors[post.category]}`}
            >
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTimeMinutes} min read</span>
            </div>
          </div>

          {/* Body */}
          <div className="prose prose-lg max-w-none mb-8">
            {post.body.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Key Takeaway */}
          {post.keyTakeaway && (
            <div className="mb-8 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r">
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-2">
                Key Takeaway
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
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Bottom Navigation */}
        <div className="mt-8">
          <Button onClick={onNavigateHome} variant="outline" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Briefings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BriefingPage;

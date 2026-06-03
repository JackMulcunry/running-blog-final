import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import BriefingCard from "./BriefingCard";
import Footer from "./Footer";
import { Button } from "./ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { BriefingPost } from "@/types/briefing";

const POSTS_PER_PAGE = 9;

const CATEGORIES = ["All", "Race", "Training", "Science", "Shoes", "Opinion", "Weekly"];

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Home() {
  const [posts, setPosts] = useState<BriefingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const indexRes = await fetch(
          `${import.meta.env.BASE_URL}data/posts/index.json`,
        );
        const filenames: string[] = await indexRes.json();

        const loaded = await Promise.all(
          filenames.map(async (filename) => {
            const res = await fetch(
              `${import.meta.env.BASE_URL}data/posts/${filename}`,
            );
            return await res.json();
          }),
        );

        loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPosts(loaded);
      } catch (error) {
        console.error("Error loading posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Reset to page 1 when category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const handleCategoryChange = (cat: string) => {
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const isFiltered = selectedCategory !== "All";

  // Featured: always the most recent post (only when showing All)
  const featuredPost = !isFiltered && posts.length > 0 ? posts[0] : null;

  // Grid: when filtered, show matching; when unfiltered, skip the featured post
  const gridPosts = isFiltered
    ? posts.filter((p) => p.category === selectedCategory)
    : posts.slice(1);

  const totalPages = Math.ceil(gridPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = gridPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-orange border-t-transparent mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading briefings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-white rounded-xl shadow-sm p-12 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No briefings yet.</h2>
            <p className="text-gray-500 mb-6 text-sm">First drop coming soon.</p>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>6AMKICK | A Performance-Focused Running Blog</title>
        <meta
          name="description"
          content="6AMKICK is a performance-focused running blog covering racing mindset, training insights, and competition at all levels."
        />
        <link rel="canonical" href="https://6amkick.com/" />
      </Helmet>

      <div className="min-h-screen bg-amber-50/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Featured hero — only shown when no category filter active */}
          {featuredPost && (
            <div className="mb-10">
              <Link to={`/posts/${featuredPost.slug}`} className="block group">
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden">
                  {/* Dot-grid texture */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                  {/* Gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-transparent to-slate-900/80 pointer-events-none" />
                  {/* Top orange accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange via-orange-400 to-amber-400" />

                  <div className="relative z-10 px-7 sm:px-12 lg:px-16 py-10 sm:py-14">
                    {/* Label row */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-brand-orange">
                        Latest Briefing
                      </span>
                      <span className="w-8 h-px bg-brand-orange/40" />
                      <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-gray-400">
                        {featuredPost.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl lg:text-[2.6rem] font-extrabold text-white leading-tight tracking-[-0.02em] mb-4 max-w-3xl group-hover:text-amber-50 transition-colors duration-200">
                      {featuredPost.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl line-clamp-2">
                      {featuredPost.excerpt}
                    </p>

                    {/* Footer row */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-5 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(featuredPost.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredPost.readTimeMinutes} min read
                        </span>
                      </div>
                      <span className="flex items-center gap-2 text-sm font-semibold text-brand-orange group-hover:gap-3 transition-all duration-200">
                        Read full briefing
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Section header + category filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xs uppercase tracking-[0.12em] font-bold text-gray-400">
              {isFiltered ? `${selectedCategory} Briefings` : "All Briefings"}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.08em] font-semibold transition-all duration-150 ${
                    selectedCategory === cat
                      ? "bg-brand-orange text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-brand-orange hover:text-brand-orange"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts grid */}
          {currentPosts.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              No posts in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {currentPosts.map((post) => (
                <BriefingCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Newer
              </Button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                      page === currentPage
                        ? "bg-slate-900 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-slate-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 text-xs"
              >
                Older
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}

export default Home;

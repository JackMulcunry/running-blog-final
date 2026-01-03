import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import BriefingCard from "./BriefingCard";
import Footer from "./Footer";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BriefingPost } from "@/types/briefing";

const POSTS_PER_PAGE = 9;

function Home() {
  const [posts, setPosts] = useState<BriefingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const indexRes = await fetch(
          `${import.meta.env.BASE_URL}data/posts/index.json`,
        );
        const filenames: string[] = await indexRes.json();

        const posts = await Promise.all(
          filenames.map(async (filename) => {
            const res = await fetch(
              `${import.meta.env.BASE_URL}data/posts/${filename}`,
            );
            return await res.json();
          }),
        );

        // Sort by date descending (newest first)
        posts.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setPosts(posts);
      } catch (error) {
        console.error("Error loading posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

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
      <div className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading briefings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-white rounded-xl shadow-sm p-12 max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No briefings yet.
              </h2>
              <p className="text-gray-600 mb-6">First drop coming soon.</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>6AMKICK | A Performance-Focused Running Blog</title>
        <meta name="description" content="6AMKICK is a performance-focused running blog covering racing mindset, training insights, and competition at all levels." />
        <link rel="canonical" href="https://6amkick.vercel.app/" />
      </Helmet>

      <div className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Brand Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              6AMKICK — A Performance-Focused Running Blog
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              6AMKICK is a daily running blog focused on racing mindset, training discipline, and competing regardless of conditions.
            </p>
          </div>

          {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentPosts.map((post) => (
            <div key={post.id} className="w-full">
              <BriefingCard post={post} />
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Newer
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-8 h-8 rounded ${
                      page === currentPage
                        ? "bg-slate-900 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } transition-colors`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
              className="flex items-center gap-2"
            >
              Older
              <ChevronRight className="w-4 h-4" />
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

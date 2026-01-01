import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BriefingPost } from "@/types/briefing";

interface PostStats {
  postId: string;
  helpful: number;
  notHelpful: number;
  views: number;
}

interface PostWithStats extends BriefingPost {
  stats: PostStats;
  helpfulRatio: number;
}

interface AdminProps {
  onNavigateToPost: (slug: string) => void;
  onNavigateHome: () => void;
}

function Admin({ onNavigateToPost, onNavigateHome }: AdminProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PostWithStats | "stats.views" | "stats.helpful" | "stats.notHelpful";
    direction: "asc" | "desc";
  }>({ key: "date", direction: "desc" });

  // Check if already authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (token) {
      setIsAuthenticated(true);
      loadDashboardData(token);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      // Test authentication by making API call
      const response = await fetch("/api/admin-stats", {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.ok) {
        // Store token and authenticate
        localStorage.setItem("admin-token", password);
        setIsAuthenticated(true);
        await loadDashboardData(password);
      } else {
        const data = await response.json();
        setAuthError(data.error || "Invalid password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Failed to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (token: string) => {
    setLoading(true);
    try {
      // Load posts from index
      const indexRes = await fetch(`${import.meta.env.BASE_URL}data/posts/index.json`);
      const filenames: string[] = await indexRes.json();

      const postsData = await Promise.all(
        filenames.map(async (filename) => {
          const res = await fetch(`${import.meta.env.BASE_URL}data/posts/${filename}`);
          return await res.json();
        })
      );

      // Fetch all stats
      const statsRes = await fetch("/api/admin-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!statsRes.ok) {
        throw new Error("Failed to fetch stats");
      }

      const { stats } = await statsRes.json();

      // Combine posts with stats
      const postsWithStats: PostWithStats[] = postsData.map((post) => {
        const postStats = stats.find((s: PostStats) => s.postId === post.id) || {
          postId: post.id,
          helpful: 0,
          notHelpful: 0,
          views: 0,
        };

        const total = postStats.helpful + postStats.notHelpful;
        const helpfulRatio = total > 0 ? (postStats.helpful / total) * 100 : 0;

        return {
          ...post,
          stats: postStats,
          helpfulRatio,
        };
      });

      setPosts(postsWithStats);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setAuthError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    setIsAuthenticated(false);
    setPassword("");
    setPosts([]);
  };

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortedPosts = () => {
    const sorted = [...posts].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === "stats.views") {
        aValue = a.stats.views;
        bValue = b.stats.views;
      } else if (sortConfig.key === "stats.helpful") {
        aValue = a.stats.helpful;
        bValue = b.stats.helpful;
      } else if (sortConfig.key === "stats.notHelpful") {
        aValue = a.stats.notHelpful;
        bValue = b.stats.notHelpful;
      } else if (sortConfig.key === "helpfulRatio") {
        aValue = a.helpfulRatio;
        bValue = b.helpfulRatio;
      } else {
        aValue = a[sortConfig.key as keyof BriefingPost];
        bValue = b[sortConfig.key as keyof BriefingPost];
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
                disabled={loading}
              />
            </div>
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {authError}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={onNavigateHome}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  const sortedPosts = getSortedPosts();

  return (
    <div className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onNavigateHome}>
              View Site
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort("date")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Date {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th
                      onClick={() => handleSort("stats.views")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Views {sortConfig.key === "stats.views" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      onClick={() => handleSort("stats.helpful")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Helpful {sortConfig.key === "stats.helpful" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      onClick={() => handleSort("stats.notHelpful")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Not Helpful {sortConfig.key === "stats.notHelpful" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      onClick={() => handleSort("helpfulRatio")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      Helpful % {sortConfig.key === "helpfulRatio" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button
                          onClick={() => onNavigateToPost(post.slug)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {post.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {post.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.stats.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {post.stats.helpful}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {post.stats.notHelpful}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.helpfulRatio.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No posts found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;

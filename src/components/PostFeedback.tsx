import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./ui/button";

interface PostFeedbackProps {
  postId: string;
}

const PostFeedback: React.FC<PostFeedbackProps> = ({ postId }) => {
  const [stats, setStats] = useState({ upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    // Load stats
    fetchStats();

    // Check if user has already voted (from localStorage)
    const savedVote = localStorage.getItem(`vote-${postId}`);
    if (savedVote === 'up' || savedVote === 'down') {
      setUserVote(savedVote);
    }
  }, [postId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        setStats({ upvotes: data.upvotes, downvotes: data.downvotes });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVote = async (vote: 'up' | 'down') => {
    // Prevent multiple votes
    if (userVote || isVoting) return;

    setIsVoting(true);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, vote })
      });

      if (response.ok) {
        const data = await response.json();
        setStats({ upvotes: data.upvotes, downvotes: data.downvotes });
        setUserVote(vote);

        // Save vote to localStorage
        localStorage.setItem(`vote-${postId}`, vote);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = stats.upvotes + stats.downvotes;
  const helpfulPercentage = totalVotes > 0
    ? Math.round((stats.upvotes / totalVotes) * 100)
    : 0;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Was this helpful?
        </h3>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleVote('up')}
            disabled={!!userVote || isVoting}
            variant={userVote === 'up' ? 'default' : 'outline'}
            className={`flex items-center gap-2 ${
              userVote === 'up'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful</span>
            {stats.upvotes > 0 && (
              <span className="ml-1 text-xs">({stats.upvotes})</span>
            )}
          </Button>

          <Button
            onClick={() => handleVote('down')}
            disabled={!!userVote || isVoting}
            variant={userVote === 'down' ? 'default' : 'outline'}
            className={`flex items-center gap-2 ${
              userVote === 'down'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'hover:bg-red-50 hover:border-red-300'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Not helpful</span>
            {stats.downvotes > 0 && (
              <span className="ml-1 text-xs">({stats.downvotes})</span>
            )}
          </Button>
        </div>

        {totalVotes > 0 && (
          <p className="mt-3 text-xs text-gray-600">
            {helpfulPercentage}% found this helpful ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
          </p>
        )}

        {userVote && (
          <p className="mt-2 text-xs text-gray-500 italic">
            Thanks for your feedback!
          </p>
        )}
      </div>
    </div>
  );
};

export default PostFeedback;

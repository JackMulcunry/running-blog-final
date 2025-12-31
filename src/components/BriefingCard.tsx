import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { BriefingPost } from "@/types/briefing";

interface BriefingCardProps {
  post: BriefingPost;
  onNavigateToPost: (slug: string) => void;
}

const BriefingCard: React.FC<BriefingCardProps> = ({
  post,
  onNavigateToPost,
}) => {
  const categoryColors = {
    Race: "bg-blue-50 text-blue-700 border-blue-200",
    Training: "bg-green-50 text-green-700 border-green-200",
    Science: "bg-purple-50 text-purple-700 border-purple-200",
    Shoes: "bg-orange-50 text-orange-700 border-orange-200",
    Opinion: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const formatDate = (dateString: string) => {
    // Parse the date string as UTC to avoid timezone offset issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="w-full bg-white rounded-xl flex flex-col h-[400px] shadow hover:shadow-lg transition-all duration-300 border border-gray-200">
      <CardHeader className="pb-3 p-6">
        <div className="flex justify-between items-center mb-3">
          <Badge
            className={`${categoryColors[post.category]} px-3 py-1 text-xs rounded-full border font-medium`}
          >
            {post.category}
          </Badge>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{post.readTimeMinutes} min</span>
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-4 flex-1 overflow-hidden">
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-4">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(post.date)}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-4 mt-auto">
        <Button
          className="w-full bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200"
          onClick={() => onNavigateToPost(post.slug)}
        >
          Read
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BriefingCard;

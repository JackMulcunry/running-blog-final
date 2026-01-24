import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CalendarDays } from "lucide-react";
import { BriefingPost } from "@/types/briefing";

interface BriefingCardProps {
  post: BriefingPost;
}

const BriefingCard: React.FC<BriefingCardProps> = ({ post }) => {
  const isWeekly = post.postType === "weekly";

  const categoryColors: Record<string, string> = {
    Race: "bg-blue-50 text-blue-700 border-blue-200",
    Training: "bg-green-50 text-green-700 border-green-200",
    Science: "bg-purple-50 text-purple-700 border-purple-200",
    Shoes: "bg-orange-50 text-orange-700 border-orange-200",
    Opinion: "bg-gray-50 text-gray-700 border-gray-200",
    Weekly: "bg-indigo-100 text-indigo-800 border-indigo-300",
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

  // Calculate week range from the post date (assuming it's the end of the week)
  const getWeekRange = (dateString: string) => {
    if (post.weekRange) return post.weekRange;

    const [year, month, day] = dateString.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // Go back 6 days for a 7-day range

    const formatShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endYear = endDate.getFullYear();

    return `${formatShort(startDate)} - ${formatShort(endDate)}, ${endYear}`;
  };

  // Weekly post card
  if (isWeekly) {
    return (
      <Card className="w-full rounded-xl flex flex-col h-[400px] shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <CardHeader className="pb-3 p-6">
          <div className="flex justify-between items-center mb-3">
            <Badge
              className="bg-indigo-600 text-white px-3 py-1 text-xs rounded-full border-0 font-semibold shadow-sm"
            >
              Weekly Recap
            </Badge>
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
              <Clock className="w-3 h-3" />
              <span>{post.readTimeMinutes} min</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 leading-tight">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-4 flex-1 overflow-hidden flex flex-col justify-center">
          <div className="flex items-center gap-2 text-sm text-indigo-700 font-medium bg-indigo-100/60 rounded-lg px-4 py-3">
            <CalendarDays className="w-4 h-4" />
            <span>{getWeekRange(post.date)}</span>
          </div>
          {post.tags.length > 0 && post.tags[0] !== "weekly" && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.filter(tag => tag !== "weekly").slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 pt-4 mt-auto">
          <Link to={`/posts/${post.slug}`} className="w-full">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 font-semibold">
              Read Weekly Recap
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Regular briefing card
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
        <Link to={`/posts/${post.slug}`} className="w-full">
          <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200">
            Read
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BriefingCard;

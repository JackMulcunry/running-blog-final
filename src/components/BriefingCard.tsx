import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CalendarDays, ArrowRight } from "lucide-react";
import { BriefingPost } from "@/types/briefing";

interface BriefingCardProps {
  post: BriefingPost;
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
    month: "short",
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
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(startDate)} – ${fmt(endDate)}, ${endDate.getFullYear()}`;
}

const BriefingCard: React.FC<BriefingCardProps> = ({ post }) => {
  const isWeekly = post.postType === "weekly";

  if (isWeekly) {
    return (
      <motion.div
        className="h-[380px] rounded-xl"
        initial={{ boxShadow: "0 4px 12px rgba(99,102,241,0.08)" }}
        whileHover={{
          y: -4,
          boxShadow: "0 18px 36px rgba(99,102,241,0.18)",
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Card className="w-full h-full rounded-xl flex flex-col border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-none">
          <CardHeader className="pb-3 p-6">
            <div className="flex justify-between items-center mb-3">
              <Badge className="bg-indigo-600 text-white px-3 py-0.5 text-[10px] uppercase tracking-[0.1em] rounded-full border-0 font-semibold shadow-sm">
                Weekly Recap
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-medium">
                <Clock className="w-3 h-3" />
                <span>{post.readTimeMinutes} min</span>
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 leading-tight tracking-tight">
              {post.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pb-4 flex-1 overflow-hidden flex flex-col justify-center">
            <div className="flex items-center gap-2 text-sm text-indigo-700 font-medium bg-indigo-100/60 rounded-lg px-4 py-3">
              <CalendarDays className="w-4 h-4 flex-shrink-0" />
              <span>{getWeekRange(post)}</span>
            </div>
            {post.tags.filter((t) => t !== "weekly").length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {post.tags
                  .filter((t) => t !== "weekly")
                  .slice(0, 3)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded uppercase tracking-[0.06em]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="p-6 pt-3 mt-auto">
            <Link
              to={`/posts/${post.slug}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors group"
            >
              Read recap
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-[380px] rounded-xl"
      initial={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
      whileHover={{
        y: -4,
        boxShadow: "0 18px 36px rgba(0,0,0,0.11)",
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Card className="w-full h-full bg-white rounded-xl flex flex-col border border-gray-200 shadow-none">
        <CardHeader className="pb-3 p-6">
          <div className="flex justify-between items-center mb-3">
            <span
              className={`text-[10px] uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-full border ${
                categoryColors[post.category] ?? "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{post.readTimeMinutes} min</span>
            </div>
          </div>
          <CardTitle className="text-[1.05rem] font-bold text-[#1a1a1a] leading-snug tracking-tight">
            {post.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-4 flex-1 overflow-hidden">
          <p className="text-sm leading-relaxed text-gray-500 line-clamp-4">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(post.date)}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-[0.06em]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-3 mt-auto">
          <Link
            to={`/posts/${post.slug}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] hover:text-brand-orange transition-colors group"
          >
            Read briefing
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BriefingCard;

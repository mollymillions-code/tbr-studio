import { prisma } from "@/lib/db";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import {
  Send,
  Image,
  Layers,
  Type,
  Film,
  CirclePlay,
  RectangleVertical,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Clock,
  CalendarCheck,
  ExternalLink,
  Info,
} from "lucide-react";

// ─── Post type config ────────────────────────────────────────────

const postTypeConfig: Record<
  string,
  { label: string; icon: typeof Image; filterKey: string }
> = {
  carousel: { label: "Carousel", icon: Layers, filterKey: "carousel" },
  single_image: {
    label: "Single Image",
    icon: Image,
    filterKey: "single_image",
  },
  video_clip: { label: "Video Clip", icon: Film, filterKey: "video_clip" },
  story: { label: "Story", icon: RectangleVertical, filterKey: "story" },
  reel: { label: "Reel", icon: CirclePlay, filterKey: "reel" },
  text: { label: "Text", icon: Type, filterKey: "text" },
};

// ─── Platform config ─────────────────────────────────────────────

const platformConfig: Record<
  string,
  { label: string; icon: typeof Instagram; color: string; bg: string }
> = {
  instagram: {
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-400",
    bg: "bg-pink-500/15",
  },
  twitter: {
    label: "Twitter",
    icon: Twitter,
    color: "text-sky-400",
    bg: "bg-sky-500/15",
  },
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    color: "text-red-400",
    bg: "bg-red-500/15",
  },
  tiktok: {
    label: "TikTok",
    icon: CirclePlay,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
  },
};

// ─── Status config ───────────────────────────────────────────────

const statusConfig: Record<string, { label: string; classes: string }> = {
  DRAFT: {
    label: "Draft",
    classes: "bg-gray-500/15 text-gray-400",
  },
  REVIEW: {
    label: "Review",
    classes: "bg-amber-500/15 text-amber-400",
  },
  APPROVED: {
    label: "Approved",
    classes: "bg-green-500/15 text-green-400",
  },
  SCHEDULED: {
    label: "Scheduled",
    classes: "bg-blue-500/15 text-blue-400",
  },
  PUBLISHED: {
    label: "Published",
    classes: "bg-emerald-500/15 text-emerald-400",
  },
};

// ─── Filter tabs ─────────────────────────────────────────────────

const filterTabs = [
  { key: "all", label: "All" },
  { key: "carousel", label: "Carousel" },
  { key: "single_image", label: "Single Image" },
  { key: "video_clip", label: "Video Clip" },
  { key: "story", label: "Story" },
  { key: "reel", label: "Reel" },
  { key: "text", label: "Text" },
];

// ─── Page ────────────────────────────────────────────────────────

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeFilter = type ?? "all";

  const posts = await prisma.post.findMany({
    where:
      activeFilter !== "all" ? { postType: activeFilter } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Send size={20} className="text-pink-400" />
          <h1 className="text-2xl font-bold tracking-tight">Generate Posts</h1>
        </div>
        <p className="text-tbr-gray text-sm">
          Create and publish social media content across all platforms
        </p>
      </div>

      {/* Postiz info banner */}
      <div className="flex items-start gap-3 bg-pink-500/5 border border-pink-500/20 rounded-lg px-4 py-3 mb-6">
        <Info size={16} className="text-pink-400 mt-0.5 shrink-0" />
        <p className="text-xs text-tbr-gray">
          Posts are published via Postiz integration. Connect your social
          accounts in Postiz to enable direct publishing.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/posts" : `/posts?type=${tab.key}`}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeFilter === tab.key
                ? "bg-pink-500/20 text-pink-400"
                : "bg-tbr-card border border-tbr-border text-tbr-gray hover:text-white hover:border-pink-500/30"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
            <Send size={24} className="text-pink-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No posts yet</h2>
          <p className="text-tbr-gray text-sm max-w-sm">
            Claude Code will generate posts from storyboards or create them
            directly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const typeInfo = postTypeConfig[post.postType];
            const platformInfo = platformConfig[post.platform];
            const statusInfo = statusConfig[post.status] ?? statusConfig.DRAFT;
            const TypeIcon = typeInfo?.icon ?? Send;
            const PlatformIcon = platformInfo?.icon ?? Send;

            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="bg-tbr-card border border-tbr-border rounded-lg p-5 hover:border-pink-500/40 transition-colors group flex flex-col"
              >
                {/* Top row: type badge + platform badge + status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Post type badge */}
                    <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-md px-2 py-1 text-[11px] font-medium text-tbr-gray">
                      <TypeIcon size={12} />
                      {typeInfo?.label ?? post.postType}
                    </span>

                    {/* Platform badge */}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
                        platformInfo?.bg ?? "bg-white/5",
                        platformInfo?.color ?? "text-tbr-gray"
                      )}
                    >
                      <PlatformIcon size={12} />
                      {platformInfo?.label ?? post.platform}
                    </span>
                  </div>

                  {/* Status badge */}
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] font-medium",
                      statusInfo.classes
                    )}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-tbr-white mb-2 group-hover:text-pink-300 transition-colors line-clamp-1">
                  {post.title}
                </h3>

                {/* Caption preview */}
                {post.caption && (
                  <p className="text-xs text-tbr-gray leading-relaxed line-clamp-2 mb-3">
                    {post.caption}
                  </p>
                )}

                {/* Footer: dates + postiz link */}
                <div className="mt-auto pt-3 border-t border-tbr-border flex items-center gap-3 text-[11px] text-tbr-gray">
                  {post.publishedAt ? (
                    <span className="inline-flex items-center gap-1">
                      <CalendarCheck size={12} className="text-emerald-400" />
                      {formatDate(post.publishedAt)}
                    </span>
                  ) : post.scheduledAt ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} className="text-blue-400" />
                      {formatDate(post.scheduledAt)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(post.createdAt)}
                    </span>
                  )}

                  {post.postizJobId && (
                    <span className="inline-flex items-center gap-1 text-pink-400">
                      <ExternalLink size={12} />
                      Postiz
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

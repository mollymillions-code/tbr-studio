import { prisma } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";
import { BookOpen, Sparkles, Target } from "lucide-react";
import Link from "next/link";

const FORMAT_COLORS: Record<string, string> = {
  short_video: "bg-cyan-500/20 text-cyan-300",
  post: "bg-pink-500/20 text-pink-300",
  carousel: "bg-amber-500/20 text-amber-300",
  reel: "bg-blue-500/20 text-blue-300",
  story: "bg-emerald-500/20 text-emerald-300",
};

const FORMAT_LABELS: Record<string, string> = {
  short_video: "Short Video",
  post: "Post",
  carousel: "Carousel",
  reel: "Reel",
  story: "Story",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-300",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-300",
  REVIEW: "bg-orange-500/20 text-orange-300",
  APPROVED: "bg-green-500/20 text-green-300",
  PUBLISHED: "bg-purple-500/20 text-purple-300",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
};

async function getStoryboards() {
  return prisma.storyboard.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { scenes: true },
      },
    },
  });
}

function AIIntensityBar({ value }: { value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full max-w-[80px] rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-tbr-gray">
        {value}/10
      </span>
    </div>
  );
}

export default async function StoryboardPage() {
  const storyboards = await getStoryboards();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <BookOpen size={22} className="text-purple-400" />
          <h1 className="text-2xl font-bold tracking-tight">Storyboard</h1>
        </div>
        <p className="text-tbr-gray text-sm">
          Write storylines and creative briefs for videos and posts
        </p>
      </div>

      {/* AI Intensity info box */}
      <div className="mb-8 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="mt-0.5 shrink-0 text-purple-400" />
          <div>
            <h2 className="text-sm font-semibold text-purple-300">
              AI Intensity
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-tbr-gray">
              AI Intensity controls how much AI-generated content (images,
              effects, video clips) vs real footage is used.{" "}
              <span className="text-tbr-white font-medium">0 = all real footage</span>,{" "}
              <span className="text-tbr-white font-medium">10 = heavy AI generation</span>.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-tbr-gray">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Real footage
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                Mixed
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                AI-generated
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Storyboard grid or empty state */}
      {storyboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-tbr-border bg-tbr-card py-20 px-6 text-center">
          <BookOpen size={40} className="text-purple-400/60 mb-4" />
          <p className="text-tbr-gray text-sm max-w-md">
            No storyboards yet. Claude Code will create storyboards using the
            TBR Storywriter skill.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storyboards.map((sb) => (
            <Link
              key={sb.id}
              href={`/storyboard/${sb.id}`}
              className="group rounded-lg border border-tbr-border bg-tbr-card p-5 transition-colors hover:border-purple-500/40"
            >
              {/* Title */}
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
                {sb.title}
              </h3>

              {/* Badges row */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                    FORMAT_COLORS[sb.format] ?? "bg-gray-500/20 text-gray-300"
                  )}
                >
                  {FORMAT_LABELS[sb.format] ?? sb.format}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                    STATUS_COLORS[sb.status] ?? "bg-gray-500/20 text-gray-300"
                  )}
                >
                  {sb.status.replace("_", " ")}
                </span>
              </div>

              {/* AI Intensity */}
              <div className="mt-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={12} className="text-purple-400" />
                  <span className="text-[11px] font-medium text-tbr-gray">
                    AI Intensity
                  </span>
                </div>
                <AIIntensityBar value={sb.aiIntensity} />
              </div>

              {/* Metadata rows */}
              <div className="mt-4 space-y-1.5 text-xs text-tbr-gray">
                {sb.tone && (
                  <div className="flex items-center gap-1.5">
                    <Target size={12} className="shrink-0 text-purple-400/70" />
                    <span className="capitalize">{sb.tone}</span>
                  </div>
                )}
                {sb.targetPlatform && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-tbr-gray/60">Platform:</span>
                    <span>
                      {PLATFORM_LABELS[sb.targetPlatform] ?? sb.targetPlatform}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-tbr-gray/60">Scenes:</span>
                  <span>{sb._count.scenes}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-tbr-border text-[11px] text-tbr-gray/60">
                {formatDate(sb.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

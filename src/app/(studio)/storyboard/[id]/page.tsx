import { prisma } from "@/lib/db";
import { cn, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  FileText,
  Film,
  Layers,
  MessageSquare,
  Sparkles,
  Target,
  Type,
  Video,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

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

const SOURCE_TYPE_STYLES: Record<string, string> = {
  real: "bg-green-500/20 text-green-300",
  ai: "bg-purple-500/20 text-purple-300",
  mixed: "bg-amber-500/20 text-amber-300",
};

async function getStoryboard(id: string) {
  return prisma.storyboard.findUnique({
    where: { id },
    include: {
      scenes: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          posts: true,
          videoProjects: true,
        },
      },
    },
  });
}

function AIIntensityBar({ value }: { value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-purple-400" />
        <span className="text-sm font-semibold text-purple-300">
          AI Intensity
        </span>
        <span className="ml-auto text-sm font-bold tabular-nums text-purple-300">
          {value}/10
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-tbr-gray">
        <span>All real footage</span>
        <span>Heavy AI generation</span>
      </div>
    </div>
  );
}

export default async function StoryboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storyboard = await getStoryboard(id);

  if (!storyboard) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/storyboard"
        className="inline-flex items-center gap-1.5 text-sm text-tbr-gray hover:text-purple-300 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Storyboards
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-3">
          <BookOpen size={24} className="mt-0.5 shrink-0 text-purple-400" />
          <h1 className="text-2xl font-bold tracking-tight">
            {storyboard.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              FORMAT_COLORS[storyboard.format] ?? "bg-gray-500/20 text-gray-300"
            )}
          >
            {FORMAT_LABELS[storyboard.format] ?? storyboard.format}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              STATUS_COLORS[storyboard.status] ?? "bg-gray-500/20 text-gray-300"
            )}
          >
            {storyboard.status.replace("_", " ")}
          </span>
        </div>
        {storyboard.description && (
          <p className="mt-3 text-sm text-tbr-gray leading-relaxed">
            {storyboard.description}
          </p>
        )}
      </div>

      {/* AI Intensity bar */}
      <div className="mb-6">
        <AIIntensityBar value={storyboard.aiIntensity} />
      </div>

      {/* Metadata row */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-tbr-gray">
        {storyboard.tone && (
          <div className="flex items-center gap-1.5">
            <Target size={14} className="text-purple-400/70" />
            <span className="capitalize">{storyboard.tone}</span>
          </div>
        )}
        {storyboard.targetPlatform && (
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-purple-400/70" />
            <span>
              {PLATFORM_LABELS[storyboard.targetPlatform] ??
                storyboard.targetPlatform}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-purple-400/70" />
          <span>{formatDate(storyboard.createdAt)}</span>
        </div>
      </div>

      {/* Storyline section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText size={18} className="text-purple-400" />
          Storyline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hook */}
          <div className="rounded-lg border border-tbr-border bg-tbr-card p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-purple-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Hook
              </h3>
            </div>
            <p className="text-sm text-tbr-gray leading-relaxed">
              {storyboard.hook || "No hook defined"}
            </p>
          </div>

          {/* Storyline */}
          <div className="rounded-lg border border-tbr-border bg-tbr-card p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={14} className="text-purple-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Storyline
              </h3>
            </div>
            <p className="text-sm text-tbr-gray leading-relaxed">
              {storyboard.storyline || "No storyline defined"}
            </p>
          </div>

          {/* CTA */}
          <div className="rounded-lg border border-tbr-border bg-tbr-card p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Target size={14} className="text-purple-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Call to Action
              </h3>
            </div>
            <p className="text-sm text-tbr-gray leading-relaxed">
              {storyboard.cta || "No CTA defined"}
            </p>
          </div>
        </div>
      </div>

      {/* Scenes timeline */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Film size={18} className="text-purple-400" />
          Scenes
          <span className="text-sm font-normal text-tbr-gray">
            ({storyboard.scenes.length})
          </span>
        </h2>

        {storyboard.scenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-tbr-border bg-tbr-card py-12 text-center">
            <Film size={32} className="text-purple-400/40 mb-3" />
            <p className="text-sm text-tbr-gray">No scenes added yet.</p>
          </div>
        ) : (
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-purple-500/20" />

            {storyboard.scenes.map((scene, idx) => (
              <div key={scene.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Timeline node */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-purple-500/40 bg-tbr-card text-sm font-bold text-purple-300">
                  {idx + 1}
                </div>

                {/* Scene card */}
                <div className="flex-1 rounded-lg border border-tbr-border bg-tbr-card p-4">
                  {/* Scene header */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="font-semibold text-sm">
                      {scene.title || `Scene ${idx + 1}`}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        SOURCE_TYPE_STYLES[scene.sourceType] ??
                          "bg-gray-500/20 text-gray-300"
                      )}
                    >
                      {scene.sourceType}
                    </span>
                    {scene.duration != null && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-tbr-gray">
                        <Clock size={10} />
                        {scene.duration}s
                      </span>
                    )}
                    {scene.transition && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-tbr-gray">
                        {scene.transition}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {scene.description && (
                    <p className="text-sm text-tbr-gray leading-relaxed mb-3">
                      {scene.description}
                    </p>
                  )}

                  {/* Detail rows */}
                  <div className="space-y-2">
                    {scene.voiceover && (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare
                          size={14}
                          className="mt-0.5 shrink-0 text-purple-400/70"
                        />
                        <div>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-purple-300/70">
                            Voiceover
                          </span>
                          <p className="text-tbr-gray leading-relaxed">
                            {scene.voiceover}
                          </p>
                        </div>
                      </div>
                    )}
                    {scene.textOverlay && (
                      <div className="flex items-start gap-2 text-sm">
                        <Type
                          size={14}
                          className="mt-0.5 shrink-0 text-purple-400/70"
                        />
                        <div>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-purple-300/70">
                            Text Overlay
                          </span>
                          <p className="text-tbr-gray leading-relaxed">
                            {scene.textOverlay}
                          </p>
                        </div>
                      </div>
                    )}
                    {scene.visualNotes && (
                      <div className="flex items-start gap-2 text-sm">
                        <Eye
                          size={14}
                          className="mt-0.5 shrink-0 text-purple-400/70"
                        />
                        <div>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-purple-300/70">
                            Visual Notes
                          </span>
                          <p className="text-tbr-gray leading-relaxed">
                            {scene.visualNotes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked outputs */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          Linked Outputs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-tbr-border bg-tbr-card p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <FileText size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {storyboard._count.posts}
              </p>
              <p className="text-xs text-tbr-gray">
                {storyboard._count.posts === 1 ? "Post" : "Posts"} linked
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-tbr-border bg-tbr-card p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Video size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {storyboard._count.videoProjects}
              </p>
              <p className="text-xs text-tbr-gray">
                {storyboard._count.videoProjects === 1
                  ? "Video Project"
                  : "Video Projects"}{" "}
                linked
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

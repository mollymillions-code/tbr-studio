import { getVideoProjects } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";
import { Video, Clapperboard, Clock, Monitor, Info, Film } from "lucide-react";
import Link from "next/link";

const FORMAT_TABS = [
  { label: "All", value: null },
  { label: "Reels", value: "reel" },
  { label: "Shorts", value: "short" },
  { label: "Stories", value: "story" },
  { label: "Highlights", value: "highlight" },
] as const;

const FORMAT_LABELS: Record<string, string> = {
  reel: "Reel",
  short: "Short",
  story: "Story",
  highlight: "Highlight",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-500/15 text-gray-400",
  EDITING: "bg-amber-500/15 text-amber-400",
  RENDERING: "bg-blue-500/15 text-blue-400 animate-pulse",
  REVIEW: "bg-purple-500/15 text-purple-400",
  APPROVED: "bg-green-500/15 text-green-400",
  PUBLISHED: "bg-emerald-500/15 text-emerald-400",
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string }>;
}) {
  const params = await searchParams;
  const activeFormat = params.format ?? null;

  const projects = await getVideoProjects(activeFormat ?? undefined) as any[];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Short Videos</h1>
        <p className="text-tbr-gray text-sm mt-1">
          Assemble race footage, narrations, and graphics into short-form video
        </p>
      </div>

      {/* Format filter tabs */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto">
        {FORMAT_TABS.map((tab) => {
          const isActive = activeFormat === tab.value;
          const href = tab.value ? `/videos?format=${tab.value}` : "/videos";
          return (
            <Link
              key={tab.label}
              href={href}
              className={
                isActive
                  ? "px-3.5 py-1.5 rounded-md text-sm font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "px-3.5 py-1.5 rounded-md text-sm text-tbr-gray hover:text-white hover:bg-white/5 border border-transparent transition-colors"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Project grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/videos/${project.id}`}
              className="bg-tbr-card border border-tbr-border rounded-lg p-5 hover:border-cyan-500/40 transition-colors group"
            >
              {/* Title */}
              <div className="font-semibold text-sm text-tbr-white group-hover:text-cyan-400 transition-colors mb-3">
                {project.title}
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Format badge */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Video size={11} />
                  {FORMAT_LABELS[project.format] ?? project.format}
                </span>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLES[project.status] ?? STATUS_STYLES.DRAFT}`}
                >
                  {project.status}
                </span>

                {/* Remotion badge */}
                {project.remotionCompositionId && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Film size={11} />
                    Remotion
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-tbr-gray">
                {/* Clip count */}
                <span className="inline-flex items-center gap-1">
                  <Clapperboard size={12} />
                  {project._count.clips}{" "}
                  {project._count.clips === 1 ? "clip" : "clips"}
                </span>

                {/* Duration */}
                {project.duration != null && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(project.duration)}
                  </span>
                )}

                {/* Resolution */}
                {project.resolution && (
                  <span className="inline-flex items-center gap-1">
                    <Monitor size={12} />
                    {project.resolution}
                  </span>
                )}
              </div>

              {/* Created date */}
              <div className="text-[11px] text-tbr-gray/60 mt-3">
                Created {formatDate(project.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-tbr-card border border-tbr-border rounded-lg p-10 text-center">
          <Video size={36} className="text-tbr-gray/40 mx-auto mb-3" />
          <p className="text-sm text-tbr-gray">
            No video projects yet. Create a storyboard first, then Claude Code
            will assemble clips into short-form videos using Remotion.
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="mt-8 flex items-start gap-3 bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-4">
        <Info size={16} className="text-cyan-400 mt-0.5 shrink-0" />
        <p className="text-xs text-tbr-gray leading-relaxed">
          Videos are rendered using Remotion via MCP. Clips from the Media
          Library are assembled with narrations, text overlays, and effects per
          the storyboard instructions.
        </p>
      </div>
    </div>
  );
}

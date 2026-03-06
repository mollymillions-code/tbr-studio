import { getVideoProject } from "@/lib/api";
import { cn, formatDate, formatDuration } from "@/lib/utils";
import {
  ArrowLeft,
  Video,
  Clock,
  Monitor,
  Film,
  Layers,
  Scissors,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Circle,
  FileVideo,
  BookOpen,
  FolderOutput,
  Type,
  Mic,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export default async function VideoProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await getVideoProject(id) as any;

  if (!project) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/videos"
        className="inline-flex items-center gap-1.5 text-sm text-tbr-gray hover:text-cyan-400 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Videos
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-3">
          {project.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Format badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Video size={12} />
            {FORMAT_LABELS[project.format] ?? project.format}
          </span>

          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded text-xs font-medium",
              STATUS_STYLES[project.status] ?? STATUS_STYLES.DRAFT
            )}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Project info */}
      <section className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Film size={15} className="text-cyan-400" />
          Project Info
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {/* Duration */}
          <div>
            <div className="text-[11px] text-tbr-gray mb-1 flex items-center gap-1">
              <Clock size={11} />
              Duration
            </div>
            <div className="font-medium">
              {project.duration != null
                ? formatDuration(project.duration)
                : "--"}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <div className="text-[11px] text-tbr-gray mb-1 flex items-center gap-1">
              <Monitor size={11} />
              Resolution
            </div>
            <div className="font-medium">{project.resolution ?? "--"}</div>
          </div>

          {/* Remotion Composition */}
          <div>
            <div className="text-[11px] text-tbr-gray mb-1 flex items-center gap-1">
              <Layers size={11} />
              Composition ID
            </div>
            <div className="font-medium font-mono text-xs">
              {project.remotionCompositionId ?? "--"}
            </div>
          </div>

          {/* Render Job */}
          <div>
            <div className="text-[11px] text-tbr-gray mb-1 flex items-center gap-1">
              <FileVideo size={11} />
              Render Job
            </div>
            <div className="font-medium font-mono text-xs">
              {project.renderJobId ?? "--"}
            </div>
          </div>
        </div>

        {/* Created date */}
        <div className="mt-4 pt-3 border-t border-tbr-border text-[11px] text-tbr-gray/60">
          Created {formatDate(project.createdAt)}
        </div>
      </section>

      {/* Storyboard link */}
      {project.storyboard && (
        <section className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen size={15} className="text-purple-400" />
            Linked Storyboard
          </h2>
          <Link
            href={`/storyboard/${project.storyboard.id}`}
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {project.storyboard.title}
            <span className="text-[11px] text-tbr-gray">
              ({project.storyboard.status})
            </span>
          </Link>
        </section>
      )}

      {/* Clip timeline */}
      <section className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Scissors size={15} className="text-cyan-400" />
          Clip Timeline
          <span className="text-[11px] text-tbr-gray font-normal">
            ({project.clips.length}{" "}
            {project.clips.length === 1 ? "clip" : "clips"})
          </span>
        </h2>

        {project.clips.length > 0 ? (
          <div className="space-y-3">
            {project.clips.map((clip: any, idx: number) => (
              <div
                key={clip.id}
                className="relative border border-tbr-border rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
              >
                {/* Vertical connector line */}
                {idx < project.clips.length - 1 && (
                  <div className="absolute left-7 top-full w-px h-3 bg-tbr-border" />
                )}

                <div className="flex items-start gap-3">
                  {/* Order number */}
                  <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xs font-bold">
                    {clip.order}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Label */}
                    <div className="font-medium text-sm mb-2">{clip.label}</div>

                    {/* Source */}
                    <div className="text-xs text-tbr-gray mb-2 flex items-center gap-1.5">
                      {clip.aiGenerated ? (
                        <>
                          <Sparkles size={11} className="text-purple-400" />
                          <span className="text-purple-400">AI Generated</span>
                          {clip.aiModel && (
                            <span className="text-tbr-gray/60">
                              ({clip.aiModel})
                            </span>
                          )}
                        </>
                      ) : clip.mediaFile ? (
                        <>
                          <FileVideo size={11} />
                          {clip.mediaFile.fileName}
                        </>
                      ) : (
                        <span className="text-tbr-gray/60">No source</span>
                      )}
                    </div>

                    {/* Trim points */}
                    {(clip.trimStart != null || clip.trimEnd != null) && (
                      <div className="text-xs text-tbr-gray mb-2 flex items-center gap-3">
                        <span>
                          Trim: {clip.trimStart != null ? `${clip.trimStart}s` : "0s"}{" "}
                          &rarr; {clip.trimEnd != null ? `${clip.trimEnd}s` : "end"}
                        </span>
                      </div>
                    )}

                    {/* Detail badges and text */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Effect badge */}
                      {clip.effect && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Wand2 size={10} />
                          {clip.effect}
                        </span>
                      )}
                    </div>

                    {/* Voiceover text */}
                    {clip.voiceoverText && (
                      <div className="mt-2 text-xs bg-white/5 rounded p-2.5 border border-tbr-border">
                        <div className="flex items-center gap-1 text-[11px] text-tbr-gray mb-1">
                          <Mic size={10} />
                          Voiceover
                        </div>
                        <p className="text-tbr-gray leading-relaxed">
                          {clip.voiceoverText}
                        </p>
                      </div>
                    )}

                    {/* Text overlay */}
                    {clip.textOverlay && (
                      <div className="mt-2 text-xs bg-white/5 rounded p-2.5 border border-tbr-border">
                        <div className="flex items-center gap-1 text-[11px] text-tbr-gray mb-1">
                          <Type size={10} />
                          Text Overlay
                        </div>
                        <p className="text-tbr-gray leading-relaxed">
                          {clip.textOverlay}
                        </p>
                      </div>
                    )}

                    {/* AI prompt */}
                    {clip.aiGenerated && clip.aiPrompt && (
                      <div className="mt-2 text-xs bg-purple-500/5 rounded p-2.5 border border-purple-500/15">
                        <div className="flex items-center gap-1 text-[11px] text-purple-400 mb-1">
                          <Sparkles size={10} />
                          AI Prompt
                        </div>
                        <p className="text-tbr-gray leading-relaxed">
                          {clip.aiPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Scissors size={28} className="text-tbr-gray/40 mx-auto mb-2" />
            <p className="text-sm text-tbr-gray">No clips added yet.</p>
          </div>
        )}
      </section>

      {/* Feedback section */}
      <section className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <MessageSquare size={15} className="text-cyan-400" />
          Feedback
          <span className="text-[11px] text-tbr-gray font-normal">
            ({project.feedback.length})
          </span>
        </h2>

        {project.feedback.length > 0 ? (
          <div className="space-y-3">
            {project.feedback.map((fb: any) => (
              <div
                key={fb.id}
                className={cn(
                  "border rounded-lg p-4 transition-colors",
                  fb.actioned
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-tbr-border"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Author and timecode */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium">{fb.author}</span>
                      {fb.timecode && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {fb.timecode}
                        </span>
                      )}
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-tbr-gray leading-relaxed">
                      {fb.comment}
                    </p>

                    {/* Date */}
                    <div className="text-[11px] text-tbr-gray/60 mt-2">
                      {formatDate(fb.createdAt)}
                    </div>
                  </div>

                  {/* Actioned indicator */}
                  <div className="shrink-0 mt-0.5">
                    {fb.actioned ? (
                      <CheckCircle2
                        size={16}
                        className="text-green-400"
                      />
                    ) : (
                      <Circle size={16} className="text-tbr-gray/40" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare
              size={28}
              className="text-tbr-gray/40 mx-auto mb-2"
            />
            <p className="text-sm text-tbr-gray">No feedback yet.</p>
          </div>
        )}
      </section>

      {/* Output section */}
      {project.outputPath && (
        <section className="bg-tbr-card border border-tbr-border rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FolderOutput size={15} className="text-cyan-400" />
            Output
          </h2>
          <div className="text-sm font-mono text-tbr-gray bg-white/5 rounded p-3 border border-tbr-border break-all">
            {project.outputPath}
          </div>
        </section>
      )}
    </div>
  );
}

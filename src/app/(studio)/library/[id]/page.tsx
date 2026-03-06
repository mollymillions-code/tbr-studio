import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Film, Image, AudioLines, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { cn, formatDate, formatDuration, formatFileSize } from "@/lib/utils";

type FileType = "video" | "photo" | "audio";

const TYPE_CONFIG: Record<
  FileType,
  { label: string; icon: typeof Film; color: string; bgColor: string; previewBg: string }
> = {
  video: {
    label: "Video",
    icon: Film,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    previewBg: "bg-blue-950/40 border-blue-500/20",
  },
  photo: {
    label: "Photo",
    icon: Image,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    previewBg: "bg-emerald-950/40 border-emerald-500/20",
  },
  audio: {
    label: "Audio",
    icon: AudioLines,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    previewBg: "bg-amber-950/40 border-amber-500/20",
  },
};

const SOURCE_LABELS: Record<string, string> = {
  race: "Race",
  b_roll: "B-Roll",
  documentary: "Documentary",
  event: "Event",
  interview: "Interview",
  ambient: "Ambient",
};

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-tbr-gray mb-1">
        {label}
      </dt>
      <dd className="text-sm text-tbr-white">{value}</dd>
    </div>
  );
}

export default async function MediaFileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const file = await prisma.mediaFile.findUnique({ where: { id } });

  if (!file) notFound();

  const config = TYPE_CONFIG[file.fileType as FileType] ?? TYPE_CONFIG.video;
  const Icon = config.icon;

  // Parse tags from JSON string
  let tags: string[] = [];
  if (file.tags) {
    try {
      const parsed = JSON.parse(file.tags as string);
      if (Array.isArray(parsed)) tags = parsed;
    } catch {
      // ignore malformed tags
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-tbr-gray hover:text-tbr-blue-light transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Library
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
            config.bgColor
          )}
        >
          <Icon size={20} className={config.color} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-tbr-white break-all">
              {file.fileName}
            </h1>
            {file.aiGenerated && (
              <span className="inline-flex items-center gap-1 bg-purple-500/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0">
                <Sparkles size={10} />
                AI Generated
              </span>
            )}
          </div>
          <p className="text-tbr-gray text-sm mt-0.5">
            {config.label} &middot;{" "}
            {SOURCE_LABELS[file.sourceType] ?? file.sourceType}
          </p>
        </div>
      </div>

      {/* Preview area */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl border h-64 sm:h-80 mb-8",
          config.previewBg
        )}
      >
        <Icon
          size={64}
          className={cn(config.color, "opacity-40")}
        />

        {/* Duration badge */}
        {(file.fileType === "video" || file.fileType === "audio") &&
          file.duration != null && (
            <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
              {formatDuration(file.duration)}
            </span>
          )}

        {/* Dimensions badge */}
        {file.width != null && file.height != null && (
          <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
            {file.width} &times; {file.height}
          </span>
        )}
      </div>

      {/* Metadata grid */}
      <div className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-tbr-white mb-4">
          File Details
        </h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <MetaItem label="File Type" value={config.label} />
          <MetaItem label="MIME Type" value={file.mimeType} />
          <MetaItem
            label="File Size"
            value={file.fileSize != null ? formatFileSize(file.fileSize) : null}
          />
          {(file.fileType === "video" || file.fileType === "audio") && (
            <MetaItem
              label="Duration"
              value={
                file.duration != null ? formatDuration(file.duration) : null
              }
            />
          )}
          {(file.fileType === "video" || file.fileType === "photo") &&
            file.width != null &&
            file.height != null && (
              <MetaItem
                label="Dimensions"
                value={`${file.width} x ${file.height} px`}
              />
            )}
          <MetaItem
            label="Source Type"
            value={SOURCE_LABELS[file.sourceType] ?? file.sourceType}
          />
          <MetaItem label="Season" value={file.season} />
          <MetaItem label="Event" value={file.event} />
          <MetaItem label="Location" value={file.location} />
          {file.aiGenerated && (
            <MetaItem label="AI Model" value={file.aiModel} />
          )}
          <MetaItem label="Created" value={formatDate(file.createdAt)} />
          <MetaItem label="Updated" value={formatDate(file.updatedAt)} />
        </dl>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-tbr-white mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-tbr-blue/15 text-tbr-blue-light text-xs font-medium px-2.5 py-1 rounded-full border border-tbr-blue/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {file.description && (
        <div className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-tbr-white mb-2">
            Description
          </h2>
          <p className="text-sm text-tbr-gray leading-relaxed whitespace-pre-wrap">
            {file.description}
          </p>
        </div>
      )}

      {/* File path */}
      <div className="bg-tbr-card border border-tbr-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-tbr-white mb-2">
          File Path
        </h2>
        <code className="block bg-black/40 text-tbr-gray text-xs font-mono px-4 py-3 rounded-md break-all border border-tbr-border">
          {file.filePath}
        </code>
      </div>
    </div>
  );
}

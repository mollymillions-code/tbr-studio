import Link from "next/link";
import { Film, Image, AudioLines, Folder, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { cn, formatDate, formatDuration, formatFileSize } from "@/lib/utils";

const FILE_TYPE_FILTER = ["video", "photo", "audio"] as const;
type FileType = (typeof FILE_TYPE_FILTER)[number];

function isValidFileType(type: unknown): type is FileType {
  return typeof type === "string" && FILE_TYPE_FILTER.includes(type as FileType);
}

const TYPE_CONFIG: Record<
  FileType,
  { label: string; icon: typeof Film; color: string; bgColor: string }
> = {
  video: {
    label: "Videos",
    icon: Film,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  photo: {
    label: "Photos",
    icon: Image,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
  audio: {
    label: "Audio",
    icon: AudioLines,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
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

const FILTER_PILLS = [
  { label: "All", href: "/library", type: null },
  { label: "Videos", href: "/library?type=video", type: "video" },
  { label: "Photos", href: "/library?type=photo", type: "photo" },
  { label: "Audio", href: "/library?type=audio", type: "audio" },
] as const;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType = isValidFileType(type) ? type : null;

  const where = activeType ? { fileType: activeType } : {};

  const [files, totalCount] = await Promise.all([
    prisma.mediaFile.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.mediaFile.count({ where }),
  ]);

  const pageTitle = activeType
    ? TYPE_CONFIG[activeType].label
    : "All Media";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <Folder size={22} className="text-tbr-blue-light" />
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        </div>
        <p className="text-tbr-gray text-sm">
          {totalCount} {totalCount === 1 ? "file" : "files"} in library
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-8">
        {FILTER_PILLS.map((pill) => {
          const isActive = pill.type === activeType;
          return (
            <Link
              key={pill.label}
              href={pill.href}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
                isActive
                  ? "bg-tbr-blue text-white"
                  : "bg-tbr-card border border-tbr-border text-tbr-gray hover:text-white hover:border-tbr-blue/40"
              )}
            >
              {pill.label}
            </Link>
          );
        })}
      </div>

      {/* Media grid */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Folder size={48} className="text-tbr-gray/40 mb-4" />
          <p className="text-tbr-gray text-sm">
            No {activeType ? TYPE_CONFIG[activeType].label.toLowerCase() : "media files"} found.
          </p>
          <p className="text-tbr-gray/60 text-xs mt-1">
            Upload files to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => {
            const config = TYPE_CONFIG[file.fileType as FileType] ?? TYPE_CONFIG.video;
            const Icon = config.icon;

            return (
              <div
                key={file.id}
                className="bg-tbr-card border border-tbr-border rounded-lg overflow-hidden hover:border-tbr-blue/40 transition-colors group"
              >
                {/* Thumbnail area */}
                <div
                  className={cn(
                    "relative flex items-center justify-center h-40",
                    config.bgColor
                  )}
                >
                  <Icon
                    size={36}
                    className={cn(config.color, "opacity-60 group-hover:opacity-90 transition-opacity")}
                  />

                  {/* Duration badge (video/audio) */}
                  {(file.fileType === "video" || file.fileType === "audio") &&
                    file.duration != null && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {formatDuration(file.duration)}
                      </span>
                    )}

                  {/* Dimensions badge (photo) */}
                  {file.fileType === "photo" &&
                    file.width != null &&
                    file.height != null && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {file.width} x {file.height}
                      </span>
                    )}

                  {/* AI badge */}
                  {file.aiGenerated && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 bg-purple-500/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                      <Sparkles size={10} />
                      AI
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3.5">
                  <h3
                    className="text-sm font-medium text-tbr-white truncate"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    {/* Source type badge */}
                    <span className="inline-block bg-tbr-border/60 text-tbr-gray text-[10px] font-medium px-2 py-0.5 rounded-full capitalize">
                      {SOURCE_LABELS[file.sourceType] ?? file.sourceType}
                    </span>

                    {/* File type indicator (when showing all) */}
                    {!activeType && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                          config.bgColor,
                          config.color
                        )}
                      >
                        <Icon size={10} />
                        {file.fileType}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-tbr-gray">
                    <span>
                      {file.fileSize != null ? formatFileSize(file.fileSize) : "---"}
                    </span>
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

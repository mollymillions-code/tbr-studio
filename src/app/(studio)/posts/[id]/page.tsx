import { getPost } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
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
  Hash,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Paperclip,
  MessageSquare,
  CheckCircle2,
  Circle,
  LinkIcon,
} from "lucide-react";

// ─── Post type config ────────────────────────────────────────────

const postTypeConfig: Record<
  string,
  { label: string; icon: typeof Image }
> = {
  carousel: { label: "Carousel", icon: Layers },
  single_image: { label: "Single Image", icon: Image },
  video_clip: { label: "Video Clip", icon: Film },
  story: { label: "Story", icon: RectangleVertical },
  reel: { label: "Reel", icon: CirclePlay },
  text: { label: "Text", icon: Type },
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

// ─── Media type icon helper ──────────────────────────────────────

function mediaIcon(fileType: string) {
  if (fileType.startsWith("image")) return FileImage;
  if (fileType.startsWith("video")) return FileVideo;
  if (fileType.startsWith("audio")) return FileAudio;
  if (fileType.includes("pdf") || fileType.includes("document"))
    return FileText;
  return Paperclip;
}

// ─── Page ────────────────────────────────────────────────────────

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await getPost(id) as any;

  if (!post) notFound();

  const typeInfo = postTypeConfig[post.postType];
  const platformInfo = platformConfig[post.platform];
  const statusInfo = statusConfig[post.status] ?? statusConfig.DRAFT;
  const TypeIcon = typeInfo?.icon ?? Send;
  const PlatformIcon = platformInfo?.icon ?? Send;

  const hashtags: string[] = post.hashtags
    ? (JSON.parse(post.hashtags as string) as string[])
    : [];

  const slides: string[] =
    post.postType === "carousel" && post.slides
      ? (JSON.parse(post.slides as string) as string[])
      : [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/posts"
        className="inline-flex items-center gap-1.5 text-sm text-tbr-gray hover:text-pink-400 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Posts
      </Link>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          {/* Post type badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-md px-2.5 py-1 text-xs font-medium text-tbr-gray">
            <TypeIcon size={14} />
            {typeInfo?.label ?? post.postType}
          </span>

          {/* Platform badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
              platformInfo?.bg ?? "bg-white/5",
              platformInfo?.color ?? "text-tbr-gray"
            )}
          >
            <PlatformIcon size={14} />
            {platformInfo?.label ?? post.platform}
          </span>

          {/* Status badge */}
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium",
              statusInfo.classes
            )}
          >
            {statusInfo.label}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
      </div>

      {/* ── Content Section ─────────────────────────────────────── */}
      <section className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-tbr-gray uppercase tracking-wider mb-4">
          Content
        </h2>

        {/* Caption */}
        {post.caption && (
          <div className="mb-5">
            <h3 className="text-xs font-medium text-tbr-gray mb-2">Caption</h3>
            <p className="text-sm text-tbr-white leading-relaxed whitespace-pre-wrap">
              {post.caption}
            </p>
          </div>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-medium text-tbr-gray mb-2">
              Hashtags
            </h3>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-pink-500/10 text-pink-400 rounded-full px-3 py-1 text-xs font-medium"
                >
                  <Hash size={12} />
                  {tag.replace(/^#/, "")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Carousel slides */}
        {slides.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-tbr-gray mb-3">
              Slides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-tbr-border rounded-lg p-4"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold mb-2">
                    {i + 1}
                  </span>
                  <p className="text-sm text-tbr-white leading-relaxed">
                    {slide}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty content state */}
        {!post.caption && hashtags.length === 0 && slides.length === 0 && (
          <p className="text-sm text-tbr-gray italic">
            No content has been added to this post yet.
          </p>
        )}
      </section>

      {/* ── Attached Media ──────────────────────────────────────── */}
      {post.media.length > 0 && (
        <section className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-tbr-gray uppercase tracking-wider mb-4">
            Attached Media
          </h2>
          <div className="space-y-3">
            {post.media.map((m: any) => {
              const Icon = mediaIcon(m.mediaFile.fileType);
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 bg-white/5 border border-tbr-border rounded-lg px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-md bg-pink-500/10 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-pink-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-tbr-white truncate">
                      {m.mediaFile.fileName}
                    </p>
                    <p className="text-xs text-tbr-gray">
                      {m.mediaFile.sourceType}
                      {m.role ? ` \u00B7 ${m.role}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Publishing Info ─────────────────────────────────────── */}
      <section className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-tbr-gray uppercase tracking-wider mb-4">
          Publishing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Scheduled At */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-tbr-gray">Scheduled</p>
              <p className="text-sm font-medium text-tbr-white">
                {post.scheduledAt ? formatDate(post.scheduledAt) : "\u2014"}
              </p>
            </div>
          </div>

          {/* Published At */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CalendarCheck size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-tbr-gray">Published</p>
              <p className="text-sm font-medium text-tbr-white">
                {post.publishedAt ? formatDate(post.publishedAt) : "\u2014"}
              </p>
            </div>
          </div>
        </div>

        {/* Postiz badge */}
        {post.postizJobId && (
          <div className="mt-4 pt-4 border-t border-tbr-border">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 rounded-md px-3 py-1.5 text-xs font-medium">
                <ExternalLink size={14} />
                Published via Postiz
              </span>
              <span className="text-xs text-tbr-gray font-mono">
                {post.postizJobId}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ── Feedback ────────────────────────────────────────────── */}
      {post.feedback.length > 0 && (
        <section className="bg-tbr-card border border-tbr-border rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-tbr-gray uppercase tracking-wider mb-4">
            Feedback
          </h2>
          <div className="space-y-3">
            {post.feedback.map((fb: any) => (
              <div
                key={fb.id}
                className="bg-white/5 border border-tbr-border rounded-lg px-4 py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-pink-400" />
                    <span className="text-sm font-medium text-tbr-white">
                      {fb.author}
                    </span>
                    <span className="text-xs text-tbr-gray">
                      {formatDate(fb.createdAt)}
                    </span>
                  </div>
                  {fb.actioned ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 size={14} />
                      Actioned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-tbr-gray">
                      <Circle size={14} />
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-tbr-white leading-relaxed pl-[22px]">
                  {fb.comment}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Linked Storyboard ───────────────────────────────────── */}
      {post.storyboard && (
        <section className="bg-tbr-card border border-tbr-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-tbr-gray uppercase tracking-wider mb-4">
            Linked Storyboard
          </h2>
          <Link
            href={`/storyboards/${post.storyboard.id}`}
            className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors"
          >
            <LinkIcon size={14} />
            {post.storyboard.id}
          </Link>
        </section>
      )}
    </div>
  );
}

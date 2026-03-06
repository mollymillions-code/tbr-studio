import { getEpisode } from "@/lib/api";
import {
  Tv,
  Flag,
  BookOpen,
  Send,
  Video,
  Target,
  ArrowLeft,
  Clock,
  Clapperboard,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PLANNED: { bg: "bg-gray-500/15", text: "text-gray-400", label: "Planned" },
  ACTIVE: { bg: "bg-tbr-blue/15", text: "text-tbr-blue-light", label: "Active" },
  IN_PROGRESS: { bg: "bg-amber-500/15", text: "text-amber-400", label: "In Progress" },
  COMPLETED: { bg: "bg-green-500/15", text: "text-green-400", label: "Completed" },
  DRAFT: { bg: "bg-gray-500/15", text: "text-gray-400", label: "Draft" },
  REVIEW: { bg: "bg-purple-500/15", text: "text-purple-400", label: "Review" },
  APPROVED: { bg: "bg-green-500/15", text: "text-green-400", label: "Approved" },
  PUBLISHED: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Published" },
  EDITING: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Editing" },
  RENDERING: { bg: "bg-blue-500/15 animate-pulse", text: "text-blue-400", label: "Rendering" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const episode = await getEpisode(id) as Record<string, unknown> | null;

  if (!episode) return notFound();

  const narrative = episode.narrative as Record<string, unknown> | null;
  const race = episode.race as Record<string, unknown> | null;
  const storyboards = (episode.storyboards ?? []) as Array<Record<string, unknown>>;
  const posts = (episode.posts ?? []) as Array<Record<string, unknown>>;
  const videoProjects = (episode.videoProjects ?? []) as Array<Record<string, unknown>>;
  const totalPieces = storyboards.length + posts.length + videoProjects.length;
  const target = (episode.targetPieces as number) ?? 5;
  const progress = Math.min(100, (totalPieces / target) * 100);
  const narrativeColor = String(narrative?.color ?? "#334155");
  const narrativeLabel = String(narrative?.label ?? "");
  const raceRound = race ? String(race.round) : "";
  const raceTitle = race ? String(race.title) : "";
  const episodeNumber = String(episode.number);
  const episodeTitle = String(episode.title);
  const episodeTheme = String(episode.theme ?? "");
  const episodeStatus = String(episode.status ?? "PLANNED");
  const status = STATUS_STYLES[episodeStatus] ?? STATUS_STYLES.PLANNED;

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/episodes"
        className="inline-flex items-center gap-1.5 text-xs text-tbr-gray hover:text-tbr-blue-light mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        All Episodes
      </Link>

      {/* Header */}
      <div className="glass-card rounded-xl p-8 mb-8 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl"
          style={{ backgroundColor: narrativeColor }}
        />

        <div className="ml-4">
          <div className="flex items-center gap-3 mb-3">
            <Tv size={16} className="text-tbr-blue-light" />
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted">
              Episode {episodeNumber}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {episodeTitle}
          </h1>
          <p className="text-tbr-gray mb-4">
            {episodeTheme}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {/* Narrative */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: narrativeColor }} />
              <span className="text-tbr-gray">{narrativeLabel}</span>
            </div>

            {/* Date range */}
            {Boolean(episode.startDate) && (
              <div className="flex items-center gap-1 text-tbr-gray-muted">
                <Clock size={13} />
                {formatDate(episode.startDate as string)} - {formatDate(episode.endDate as string)}
              </div>
            )}

            {/* Linked race */}
            {race && (
              <div className="flex items-center gap-1 text-amber-400">
                <Flag size={13} />
                R{raceRound} {raceTitle}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-tbr-blue-light" />
              <span className="text-sm font-medium">
                {totalPieces} / {target} content pieces
              </span>
            </div>
            <div className="flex-1 max-w-xs h-1.5 bg-tbr-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: narrativeColor }}
              />
            </div>
            <span className="text-xs text-tbr-gray-muted">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storyboards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={14} className="text-purple-400" />
            <h2 className="text-sm font-semibold">Storyboards</h2>
            <span className="text-xs text-tbr-gray-muted">({storyboards.length})</span>
          </div>
          {storyboards.length > 0 ? (
            <div className="space-y-2">
              {storyboards.map((sb) => {
                const sbStatus = STATUS_STYLES[(sb.status as string) ?? "DRAFT"] ?? STATUS_STYLES.DRAFT;
                return (
                  <Link
                    key={sb.id as string}
                    href={`/storyboard/${sb.id as string}`}
                    className="block glass-card rounded-lg p-3 hover:border-purple-500/20 transition-colors"
                  >
                    <div className="text-xs font-medium mb-1">{sb.title as string}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${sbStatus.bg} ${sbStatus.text}`}>
                        {sbStatus.label}
                      </span>
                      {(sb._count as Record<string, number>)?.scenes > 0 && (
                        <span className="text-[10px] text-tbr-gray-muted">
                          {(sb._count as Record<string, number>).scenes} scenes
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-lg p-4 text-center">
              <BookOpen size={20} className="text-tbr-gray-muted/40 mx-auto mb-2" />
              <p className="text-[11px] text-tbr-gray-muted">No storyboards yet</p>
            </div>
          )}
        </div>

        {/* Posts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Send size={14} className="text-pink-400" />
            <h2 className="text-sm font-semibold">Posts</h2>
            <span className="text-xs text-tbr-gray-muted">({posts.length})</span>
          </div>
          {posts.length > 0 ? (
            <div className="space-y-2">
              {posts.map((post) => {
                const pStatus = STATUS_STYLES[(post.status as string) ?? "DRAFT"] ?? STATUS_STYLES.DRAFT;
                return (
                  <Link
                    key={post.id as string}
                    href={`/posts/${post.id as string}`}
                    className="block glass-card rounded-lg p-3 hover:border-pink-500/20 transition-colors"
                  >
                    <div className="text-xs font-medium mb-1">{post.title as string}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${pStatus.bg} ${pStatus.text}`}>
                        {pStatus.label}
                      </span>
                      <span className="text-[10px] text-tbr-gray-muted">
                        {post.platform as string} / {post.postType as string}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-lg p-4 text-center">
              <Send size={20} className="text-tbr-gray-muted/40 mx-auto mb-2" />
              <p className="text-[11px] text-tbr-gray-muted">No posts yet</p>
            </div>
          )}
        </div>

        {/* Video Projects */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Video size={14} className="text-cyan-400" />
            <h2 className="text-sm font-semibold">Videos</h2>
            <span className="text-xs text-tbr-gray-muted">({videoProjects.length})</span>
          </div>
          {videoProjects.length > 0 ? (
            <div className="space-y-2">
              {videoProjects.map((vp) => {
                const vpStatus = STATUS_STYLES[(vp.status as string) ?? "DRAFT"] ?? STATUS_STYLES.DRAFT;
                return (
                  <Link
                    key={vp.id as string}
                    href={`/videos/${vp.id as string}`}
                    className="block glass-card rounded-lg p-3 hover:border-cyan-500/20 transition-colors"
                  >
                    <div className="text-xs font-medium mb-1">{vp.title as string}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${vpStatus.bg} ${vpStatus.text}`}>
                        {vpStatus.label}
                      </span>
                      {(vp._count as Record<string, number>)?.clips > 0 && (
                        <span className="text-[10px] text-tbr-gray-muted flex items-center gap-1">
                          <Clapperboard size={9} />
                          {(vp._count as Record<string, number>).clips} clips
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-lg p-4 text-center">
              <Video size={20} className="text-tbr-gray-muted/40 mx-auto mb-2" />
              <p className="text-[11px] text-tbr-gray-muted">No videos yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

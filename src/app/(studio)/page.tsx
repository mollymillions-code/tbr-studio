import { getStats, getDashboardSeason } from "@/lib/api";
import {
  Film,
  Image,
  AudioLines,
  BookOpen,
  Send,
  Video,
  ArrowRight,
  Flag,
  MapPin,
  Tv,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

const statCards = [
  { key: "videoFiles", label: "Video Clips", icon: Film, href: "/library?type=video", color: "text-blue-400" },
  { key: "photoFiles", label: "Photos", icon: Image, href: "/library?type=photo", color: "text-emerald-400" },
  { key: "audioFiles", label: "Audio Files", icon: AudioLines, href: "/library?type=audio", color: "text-amber-400" },
  { key: "storyboardCount", label: "Storyboards", icon: BookOpen, href: "/storyboard", color: "text-purple-400" },
  { key: "postCount", label: "Posts", icon: Send, href: "/posts", color: "text-pink-400" },
  { key: "videoCount", label: "Video Projects", icon: Video, href: "/videos", color: "text-cyan-400" },
] as const;

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysUntil(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function DashboardPage() {
  const [stats, season] = await Promise.all([getStats(), getDashboardSeason()]);

  const nextRace = season.nextRace as Record<string, unknown> | null;
  const currentEp = season.currentEpisode as Record<string, unknown> | null;
  const episodes = (season.episodes ?? []) as Array<Record<string, unknown>>;
  const narratives = (season.narratives ?? {}) as Record<string, { label: string; color: string }>;

  const daysToRace = nextRace ? daysUntil(nextRace.startDate as string) : null;
  const raceDate = nextRace ? new Date(nextRace.startDate as string) : null;

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-tbr-blue" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-tbr-blue-light">
            Content Studio
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          TBR Studio
        </h1>
        <p className="text-tbr-gray text-sm mt-2 max-w-md">
          Team Blue Rising. E1 World Championship. Electric powerboat racing.
        </p>
      </div>

      {/* Season Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        {/* Current Episode */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-tbr-blue to-tbr-cyan" />
          <div className="flex items-center gap-2 mb-4">
            <Tv size={14} className="text-tbr-blue-light" />
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted">
              Current Episode
            </span>
          </div>
          {currentEp ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold tracking-tight">
                  Ep {String(currentEp.number)}
                </span>
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: (currentEp.narrativeColor as string) || "#666" }}
                />
                <span className="text-sm text-tbr-gray">
                  {currentEp.narrativeLabel as string}
                </span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight mb-1">
                {currentEp.title as string}
              </h2>
              <p className="text-sm text-tbr-gray mb-4">
                {currentEp.theme as string}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target size={13} className="text-tbr-blue-light" />
                  <span className="text-xs text-tbr-gray">
                    {String(currentEp.contentPieces ?? 0)} / {String(currentEp.targetPieces ?? 5)} pieces
                  </span>
                </div>
                <Link
                  href={`/episodes/${currentEp.id as string}`}
                  className="text-xs text-tbr-blue-light hover:text-tbr-cyan flex items-center gap-1 transition-colors"
                >
                  View episode <ArrowRight size={11} />
                </Link>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1 bg-tbr-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-tbr-blue to-tbr-cyan rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((currentEp.contentPieces as number ?? 0) / (currentEp.targetPieces as number ?? 5)) * 100)}%`,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-tbr-gray-muted">
              No episode currently active. Check the{" "}
              <Link href="/episodes" className="text-tbr-blue-light hover:underline">
                episode timeline
              </Link>.
            </div>
          )}
        </div>

        {/* Next Race Countdown */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-400" />
          <div className="flex items-center gap-2 mb-4">
            <Flag size={14} className="text-amber-400" />
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted">
              Next Race
            </span>
          </div>
          {nextRace ? (
            <>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold tracking-tight text-amber-400">
                  {daysToRace}
                </span>
                <span className="text-sm text-tbr-gray">days to go</span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight mb-1">
                R{String(nextRace.round)} {nextRace.title as string}
              </h2>
              <div className="flex items-center gap-3 text-sm text-tbr-gray">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {nextRace.location as string}, {nextRace.country as string}
                </span>
                <span>
                  {raceDate ? `${raceDate.getDate()} ${FULL_MONTHS[raceDate.getMonth()]}` : ""}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm text-tbr-gray-muted">Season complete.</div>
          )}
        </div>
      </div>

      {/* Episode Timeline Strip */}
      <div className="glass-card rounded-xl p-5 mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted">
            Season Arc — 10 Episodes
          </div>
          <Link
            href="/episodes"
            className="text-[11px] text-tbr-blue-light hover:text-tbr-cyan flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {episodes.map((ep) => {
            const narrativeColor = (ep.narrativeColor as string) || (narratives[ep.narrative as string]?.color) || "#334155";
            const isCurrent = currentEp && ep.number === currentEp.number;
            const pieces = (ep.contentPieces as number) ?? 0;
            const target = (ep.targetPieces as number) ?? 5;
            const progress = Math.min(100, (pieces / target) * 100);

            return (
              <Link
                key={String(ep.number)}
                href={ep.id ? `/episodes/${ep.id as string}` : "/episodes"}
                className={`group relative rounded-lg p-2 text-center transition-all ${
                  isCurrent
                    ? "ring-1 ring-tbr-blue/50 bg-tbr-blue/10"
                    : "hover:bg-tbr-surface"
                }`}
              >
                <div
                  className="h-1 rounded-full mb-2 mx-auto"
                  style={{ backgroundColor: narrativeColor, width: "80%" }}
                />
                <div className="text-[11px] font-bold">{String(ep.number)}</div>
                <div className="text-[8px] text-tbr-gray-muted mt-0.5 leading-tight truncate">
                  {ep.title as string}
                </div>
                <div className="mt-1.5 h-0.5 bg-tbr-surface rounded-full overflow-hidden mx-1">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress}%`, backgroundColor: narrativeColor }}
                  />
                </div>
                <div className="text-[8px] text-tbr-gray-muted mt-1">
                  {pieces}/{target}
                </div>
                {isCurrent && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <Zap size={8} className="text-tbr-cyan" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="glass-card rounded-xl p-5 group"
          >
            <card.icon
              size={16}
              className={`${card.color} opacity-70 group-hover:opacity-100 transition-opacity`}
            />
            <div className="text-2xl font-bold mt-3 tracking-tight">
              {stats[card.key]}
            </div>
            <div className="text-[11px] text-tbr-gray mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-6 bg-tbr-gray-muted" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-tbr-gray-muted">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              href: "/storyboard",
              icon: BookOpen,
              label: "Create Storyboard",
              desc: "Write a storyline with AI assistance. Control the AI intensity with a slider from 0 to 10.",
              accent: "from-purple-500/20 to-purple-500/0",
              iconColor: "text-purple-400",
              borderHover: "hover:border-purple-500/20",
            },
            {
              href: "/posts",
              icon: Send,
              label: "Generate Posts",
              desc: "Create carousels, image posts, stories. Publish via Postiz to all connected accounts.",
              accent: "from-pink-500/20 to-pink-500/0",
              iconColor: "text-pink-400",
              borderHover: "hover:border-pink-500/20",
            },
            {
              href: "/videos",
              icon: Video,
              label: "Short Videos",
              desc: "Assemble race clips, narrations, and graphics into short-form video using Remotion.",
              accent: "from-cyan-500/20 to-cyan-500/0",
              iconColor: "text-cyan-400",
              borderHover: "hover:border-cyan-500/20",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`glass-card rounded-xl p-6 group relative overflow-hidden ${action.borderHover}`}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${action.accent} pointer-events-none`}
              />
              <div className="relative">
                <div className={`w-10 h-10 rounded-lg bg-tbr-surface flex items-center justify-center mb-4 ${action.iconColor} group-hover:scale-105 transition-transform`}>
                  <action.icon size={20} />
                </div>
                <div className="font-semibold text-sm tracking-tight mb-1.5">
                  {action.label}
                </div>
                <p className="text-xs text-tbr-gray leading-relaxed">
                  {action.desc}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-[11px] text-tbr-gray-muted group-hover:text-tbr-blue-light transition-colors">
                  <span>Open</span>
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

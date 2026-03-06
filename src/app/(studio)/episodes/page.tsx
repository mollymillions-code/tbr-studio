import { getEpisodes, getRaces, getNarratives } from "@/lib/api";
import {
  Tv,
  Flag,
  ArrowRight,
  BookOpen,
  Send,
  Video,
  Target,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PLANNED: { bg: "bg-gray-500/15", text: "text-gray-400", label: "Planned" },
  ACTIVE: { bg: "bg-tbr-blue/15", text: "text-tbr-blue-light", label: "Active" },
  IN_PROGRESS: { bg: "bg-amber-500/15", text: "text-amber-400", label: "In Progress" },
  COMPLETED: { bg: "bg-green-500/15", text: "text-green-400", label: "Completed" },
};

const FULL_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}-${e.getDate()} ${FULL_MONTHS[s.getMonth()]}`;
  }
  return `${s.getDate()} ${FULL_MONTHS[s.getMonth()]} - ${e.getDate()} ${FULL_MONTHS[e.getMonth()]}`;
}

export default async function EpisodesPage() {
  const [episodes, races, narratives] = await Promise.all([
    getEpisodes(),
    getRaces(),
    getNarratives(),
  ]);

  const epList = episodes as Array<Record<string, unknown>>;
  const raceList = races as Array<Record<string, unknown>>;
  const narrativeList = narratives as Array<Record<string, unknown>>;

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-tbr-blue" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-tbr-blue-light">
            Season Structure
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Episodes
        </h1>
        <p className="text-tbr-gray text-sm mt-2">
          10 content waves across the 2026 season. Each episode is a narrative arc with 5-10 content pieces.
        </p>
      </div>

      {/* Narrative Legend */}
      <div className="glass-card rounded-xl p-4 mb-8">
        <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted mb-3">
          Narrative Threads
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {narrativeList.map((n) => (
            <div key={n.key as string} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: n.color as string }}
              />
              <span className="text-xs text-tbr-gray">{n.label as string}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Episode Cards */}
      <div className="space-y-4">
        {epList.map((ep) => {
          const epStatus = String(ep.status ?? "PLANNED");
          const status = STATUS_STYLES[epStatus] ?? STATUS_STYLES.PLANNED;
          const pieces = Number(ep.contentPieces ?? 0);
          const target = Number(ep.targetPieces ?? 5);
          const progress = Math.min(100, (pieces / target) * 100);
          const narrativeColor = String(ep.narrativeColor ?? "#334155");
          const epTitle = String(ep.title);
          const epTheme = String(ep.theme ?? "");
          const epNarrativeLabel = String(ep.narrativeLabel ?? "");
          const epStartDate = String(ep.startDate ?? "");
          const epEndDate = String(ep.endDate ?? "");
          const sbCount = Number(ep.storyboardCount ?? 0);
          const postCountEp = Number(ep.postCount ?? 0);
          const videoCountEp = Number(ep.videoCount ?? 0);
          const linkedRace = raceList.find((r) => r.round === ep.raceRound);

          return (
            <Link
              key={String(ep.number)}
              href={ep.id ? `/episodes/${ep.id as string}` : "#"}
              className="block glass-card rounded-xl p-6 group hover:border-tbr-border-hover transition-all relative overflow-hidden"
            >
              {/* Narrative accent */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: narrativeColor }}
              />

              <div className="flex items-start justify-between gap-4 ml-3">
                <div className="flex-1 min-w-0">
                  {/* Top row: number, title, status */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold tracking-tight">
                      Ep {String(ep.number)}
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight group-hover:text-tbr-blue-light transition-colors">
                      {epTitle}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Theme */}
                  <p className="text-sm text-tbr-gray mb-3">
                    {epTheme}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    {/* Narrative badge */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: narrativeColor }}
                      />
                      <span className="text-xs text-tbr-gray">
                        {epNarrativeLabel}
                      </span>
                    </div>

                    {/* Date range */}
                    {epStartDate && epEndDate && (
                      <span className="text-xs text-tbr-gray-muted">
                        {formatDateRange(epStartDate, epEndDate)}
                      </span>
                    )}

                    {/* Linked race */}
                    {linkedRace && (
                      <div className="flex items-center gap-1 text-xs text-amber-400">
                        <Flag size={11} />
                        R{String(linkedRace.round)} {String(linkedRace.title)}
                      </div>
                    )}

                    {/* Content counts */}
                    <div className="flex items-center gap-3 text-xs text-tbr-gray-muted">
                      {sbCount > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen size={11} />
                          {sbCount}
                        </span>
                      )}
                      {postCountEp > 0 && (
                        <span className="flex items-center gap-1">
                          <Send size={11} />
                          {postCountEp}
                        </span>
                      )}
                      {videoCountEp > 0 && (
                        <span className="flex items-center gap-1">
                          <Video size={11} />
                          {videoCountEp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: progress ring + arrow */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target size={12} className="text-tbr-gray-muted" />
                      <span className="text-sm font-bold">{pieces}/{target}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-20 h-1 bg-tbr-surface rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: narrativeColor }}
                      />
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-tbr-gray-muted group-hover:text-tbr-blue-light transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Race Calendar Strip */}
      <div className="mt-10 glass-card rounded-xl p-6">
        <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted mb-4">
          Race Calendar
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {raceList.map((race) => {
            const isCompleted = race.status === "completed";
            return (
              <div
                key={String(race.round)}
                className={`rounded-lg p-3 border ${
                  isCompleted
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-amber-500/5 border-amber-500/15"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flag size={11} className={isCompleted ? "text-green-400" : "text-amber-400"} />
                  <span className={`text-xs font-semibold ${isCompleted ? "text-green-400" : "text-amber-300"}`}>
                    R{String(race.round)}
                  </span>
                  <span className="text-xs font-medium">{race.title as string}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-tbr-gray">
                  <MapPin size={10} />
                  {race.location as string}
                </div>
                {isCompleted && (
                  <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

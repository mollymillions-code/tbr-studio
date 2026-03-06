import { getSeasonData } from "@/lib/api";
import { Flag, Tv, Circle, MapPin, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Race = Record<string, unknown>;
type Episode = Record<string, unknown>;

function getMonthIndex(dateStr: string) {
  return new Date(dateStr).getMonth();
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.getDate()}-${e.getDate()} ${FULL_MONTHS[s.getMonth()]}`;
}

function isCurrentMonth(monthIdx: number) {
  return new Date().getMonth() === monthIdx;
}

function isPastMonth(monthIdx: number) {
  return monthIdx < new Date().getMonth();
}

function getRacesForMonth(races: Race[], month: number): Race[] {
  return races.filter((r) => getMonthIndex(r.startDate as string) === month);
}

function getEpisodesForMonth(episodes: Episode[], month: number): Episode[] {
  return episodes.filter((ep) => {
    const startMonth = getMonthIndex(ep.startDate as string);
    const endMonth = getMonthIndex(ep.endDate as string);
    return month >= startMonth && month <= endMonth;
  });
}

export default async function CalendarPage() {
  const seasonData = await getSeasonData();
  const races = seasonData.races as Race[];
  const episodes = seasonData.episodes as Episode[];
  const narratives = seasonData.narratives as Record<string, { label: string; color: string }>;

  const currentMonth = new Date().getMonth();

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-tbr-blue" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-tbr-blue-light">
            Season Calendar
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          {seasonData.season} Season
        </h1>
        <p className="text-tbr-gray text-sm mt-2">
          UIM E1 World Championship. {races.length} races. {episodes.length} episodes. 4 continents.
        </p>
      </div>

      {/* Legend */}
      <div className="glass-card rounded-xl p-5 mb-8">
        <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted mb-3">
          Legend
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500/80" />
            <span className="text-xs text-tbr-gray">Race Weekend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-tbr-blue/80" />
            <span className="text-xs text-tbr-gray">Episode / Campaign</span>
          </div>
          <div className="w-px h-4 bg-tbr-border-hover mx-1" />
          {Object.entries(narratives).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
              <span className="text-xs text-tbr-gray">{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Year grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MONTHS.map((month, idx) => {
          const monthRaces = getRacesForMonth(races, idx);
          const monthEpisodes = getEpisodesForMonth(episodes, idx);
          const isCurrent = isCurrentMonth(idx);
          const isPast = isPastMonth(idx);
          const hasContent = monthRaces.length > 0 || monthEpisodes.length > 0;

          return (
            <div
              key={month}
              className={`glass-card rounded-xl p-5 relative overflow-hidden ${
                isCurrent ? "ring-1 ring-tbr-blue/40" : ""
              } ${isPast && !isCurrent ? "opacity-50" : ""}`}
            >
              {isCurrent && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-tbr-blue to-tbr-cyan" />
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight">{FULL_MONTHS[idx]}</span>
                  {isCurrent && (
                    <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-tbr-blue/15 text-tbr-blue-light">
                      Now
                    </span>
                  )}
                </div>
                {hasContent && <CalendarIcon size={14} className="text-tbr-gray-muted" />}
              </div>

              {monthRaces.map((race) => (
                <div key={String(race.round)} className="mb-3 p-3 rounded-lg bg-amber-500/8 border border-amber-500/15">
                  <div className="flex items-center gap-2 mb-1">
                    <Flag size={12} className="text-amber-400" />
                    <span className="text-xs font-semibold text-amber-300">R{String(race.round)}</span>
                    <span className="text-xs font-medium text-tbr-white">{race.title as string}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-5 text-[11px] text-tbr-gray">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {race.location as string}, {race.country as string}
                    </span>
                    <span>{formatDateRange(race.startDate as string, race.endDate as string)}</span>
                  </div>
                  {race.status === "completed" && (
                    <div className="ml-5 mt-1">
                      <span className="text-[9px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">
                        Completed
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {monthEpisodes.map((ep) => {
                const narrativeKey = ep.narrative as string;
                const narrative = narratives[narrativeKey];
                return (
                  <Link
                    key={String(ep.number)}
                    href={ep.id ? `/episodes/${ep.id as string}` : "/episodes"}
                    className="block mb-2 p-2.5 rounded-lg bg-tbr-surface border border-tbr-border hover:border-tbr-border-hover transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Tv size={11} className="text-tbr-blue-light" />
                      <span className="text-[11px] font-medium text-tbr-white-dim">
                        Ep {String(ep.number)}: {ep.title as string}
                      </span>
                      {narrative && (
                        <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: narrative.color }} />
                      )}
                    </div>
                    <div className="ml-5 mt-1 text-[10px] text-tbr-gray-muted">{ep.theme as string}</div>
                    {((ep.contentPieces as number) ?? 0) > 0 && (
                      <div className="ml-5 mt-1 flex items-center gap-1 text-[10px] text-tbr-gray">
                        <Circle size={6} className="fill-current" />
                        {String(ep.contentPieces)} piece{(ep.contentPieces as number) !== 1 ? "s" : ""}
                      </div>
                    )}
                  </Link>
                );
              })}

              {!hasContent && (
                <div className="text-[11px] text-tbr-gray-muted/50 italic">No events scheduled</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Race timeline strip */}
      <div className="mt-10 glass-card rounded-xl p-6">
        <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted mb-5">
          Race Timeline
        </div>
        <div className="relative">
          <div className="absolute top-3 left-0 right-0 h-px bg-tbr-border-hover" />
          <div
            className="absolute top-3 left-0 h-px bg-gradient-to-r from-tbr-blue to-tbr-cyan"
            style={{ width: `${Math.max(0, Math.min(100, (currentMonth / 11) * 100))}%` }}
          />
          <div className="flex justify-between relative">
            {races.map((race) => {
              const monthIdx = getMonthIndex(race.startDate as string);
              const isCompleted = race.status === "completed";
              const isNext = !isCompleted && races.findIndex((r) => r.status === "upcoming") === races.indexOf(race);

              return (
                <div key={String(race.round)} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold z-10 ${
                      isCompleted
                        ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/30"
                        : isNext
                        ? "bg-tbr-blue/20 text-tbr-blue-light ring-1 ring-tbr-blue/40 glow-blue"
                        : "bg-tbr-surface text-tbr-gray-muted ring-1 ring-tbr-border"
                    }`}
                  >
                    {String(race.round)}
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-medium text-tbr-white-dim leading-tight">{race.location as string}</div>
                    <div className="text-[9px] text-tbr-gray-muted">{MONTHS[monthIdx]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

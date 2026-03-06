/**
 * Seed the database with 2026 season data: narratives, races, and episodes.
 * Run: npx tsx scripts/seed-season.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NARRATIVES = [
  { key: "season-intro", label: "Season Intro", color: "#8b5cf6", description: "Setting the stage. Who we are, what's at stake.", sortOrder: 1 },
  { key: "team-evolution", label: "Team Evolution", color: "#f472b6", description: "New faces, changing dynamics, team growth.", sortOrder: 2 },
  { key: "tech-innovation", label: "Tech / Innovation", color: "#06b6d4", description: "The RaceBird, engineering, technology stories.", sortOrder: 3 },
  { key: "race-weekend", label: "Race Weekend", color: "#f59e0b", description: "Race coverage, results, on-water drama.", sortOrder: 4 },
  { key: "character-growth", label: "Character Growth", color: "#10b981", description: "Personal arcs, adversity, breakthroughs.", sortOrder: 5 },
  { key: "conservation", label: "Conservation", color: "#3b82f6", description: "Ocean conservation, clean tech, rising seas.", sortOrder: 6 },
  { key: "season-finale", label: "Season Finale", color: "#ef4444", description: "Season wrap, what it all meant, looking ahead.", sortOrder: 7 },
];

const RACES = [
  { round: 1, title: "Jeddah GP", location: "Jeddah", country: "Saudi Arabia", startDate: "2026-01-23", endDate: "2026-01-24", status: "completed" },
  { round: 2, title: "Lake Como GP", location: "Lake Como", country: "Italy", startDate: "2026-04-24", endDate: "2026-04-25", status: "upcoming" },
  { round: 3, title: "Dubrovnik GP", location: "Dubrovnik", country: "Croatia", startDate: "2026-06-12", endDate: "2026-06-13", status: "upcoming" },
  { round: 4, title: "Monaco GP", location: "Monaco", country: "Monaco", startDate: "2026-07-17", endDate: "2026-07-18", status: "upcoming" },
  { round: 5, title: "Round 5", location: "TBC", country: "TBC", startDate: "2026-09-11", endDate: "2026-09-12", status: "upcoming" },
  { round: 6, title: "Lagos GP", location: "Lagos", country: "Nigeria", startDate: "2026-10-03", endDate: "2026-10-04", status: "upcoming" },
  { round: 7, title: "Miami GP", location: "Miami", country: "USA", startDate: "2026-11-13", endDate: "2026-11-14", status: "upcoming" },
  { round: 8, title: "Bahamas Finale", location: "Bahamas", country: "Bahamas", startDate: "2026-11-21", endDate: "2026-11-22", status: "upcoming" },
];

const EPISODES = [
  { number: 1, title: "Origins", theme: "Who are we. What is at stake. Why this season matters.", narrative: "season-intro", startDate: "2026-01-06", endDate: "2026-01-19", raceRound: null, status: "PLANNED" },
  { number: 2, title: "New Blood", theme: "New faces arrive. The team evolves.", narrative: "team-evolution", startDate: "2026-01-20", endDate: "2026-02-02", raceRound: null, status: "PLANNED" },
  { number: 3, title: "The Machine", theme: "The RaceBird. The technology. What makes this boat fly.", narrative: "tech-innovation", startDate: "2026-02-16", endDate: "2026-03-01", raceRound: null, status: "PLANNED" },
  { number: 4, title: "Race Week 1", theme: "The first test. Real competition begins.", narrative: "race-weekend", startDate: "2026-04-20", endDate: "2026-05-03", raceRound: 2, status: "PLANNED" },
  { number: 5, title: "Adversity", theme: "Things don't go to plan. How does TBR respond?", narrative: "character-growth", startDate: "2026-05-18", endDate: "2026-05-31", raceRound: null, status: "PLANNED" },
  { number: 6, title: "Breakthrough", theme: "Progress. A win, a podium, a personal best.", narrative: "race-weekend", startDate: "2026-06-08", endDate: "2026-06-21", raceRound: 3, status: "PLANNED" },
  { number: 7, title: "The Mission", theme: "Why Blue Rising exists. Conservation. Clean technology.", narrative: "conservation", startDate: "2026-07-06", endDate: "2026-07-19", raceRound: 4, status: "PLANNED" },
  { number: 8, title: "Race Week 2", theme: "Heightened stakes. The team has evolved.", narrative: "race-weekend", startDate: "2026-09-07", endDate: "2026-09-20", raceRound: 5, status: "PLANNED" },
  { number: 9, title: "The Push", theme: "Championship pressure. Everything on the line.", narrative: "character-growth", startDate: "2026-10-12", endDate: "2026-10-25", raceRound: null, status: "PLANNED" },
  { number: 10, title: "The Reckoning", theme: "Where we stand. What this season meant.", narrative: "season-finale", startDate: "2026-11-16", endDate: "2026-11-29", raceRound: null, status: "PLANNED" },
];

async function main() {
  console.log("Seeding 2026 season data...");

  // Upsert narratives
  for (const n of NARRATIVES) {
    await prisma.narrative.upsert({
      where: { key: n.key },
      update: { label: n.label, color: n.color, description: n.description, sortOrder: n.sortOrder },
      create: n,
    });
  }
  console.log(`  Narratives: ${NARRATIVES.length}`);

  // Upsert races
  for (const r of RACES) {
    await prisma.race.upsert({
      where: { round: r.round },
      update: { title: r.title, location: r.location, country: r.country, startDate: new Date(r.startDate), endDate: new Date(r.endDate), status: r.status },
      create: { round: r.round, title: r.title, location: r.location, country: r.country, startDate: new Date(r.startDate), endDate: new Date(r.endDate), status: r.status },
    });
  }
  console.log(`  Races: ${RACES.length}`);

  // Get narrative and race IDs for linking
  const narrativeMap = new Map<string, string>();
  const allNarratives = await prisma.narrative.findMany();
  for (const n of allNarratives) narrativeMap.set(n.key, n.id);

  const raceMap = new Map<number, string>();
  const allRaces = await prisma.race.findMany();
  for (const r of allRaces) raceMap.set(r.round, r.id);

  // Upsert episodes
  for (const ep of EPISODES) {
    await prisma.episode.upsert({
      where: { number: ep.number },
      update: {
        title: ep.title,
        theme: ep.theme,
        status: ep.status,
        startDate: new Date(ep.startDate),
        endDate: new Date(ep.endDate),
        narrativeId: narrativeMap.get(ep.narrative) ?? null,
        raceId: ep.raceRound ? (raceMap.get(ep.raceRound) ?? null) : null,
      },
      create: {
        number: ep.number,
        title: ep.title,
        theme: ep.theme,
        status: ep.status,
        startDate: new Date(ep.startDate),
        endDate: new Date(ep.endDate),
        narrativeId: narrativeMap.get(ep.narrative) ?? null,
        raceId: ep.raceRound ? (raceMap.get(ep.raceRound) ?? null) : null,
      },
    });
  }
  console.log(`  Episodes: ${EPISODES.length}`);

  console.log("Done!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

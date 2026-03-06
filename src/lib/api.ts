/**
 * Data access layer that works both locally (Prisma + SQLite) and on Vercel (static JSON).
 *
 * Set NEXT_PUBLIC_STATIC_DATA=true for Vercel builds.
 * When static, uses imported JSON from src/data/ (bundled with serverless functions).
 */

const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_DATA?.trim() === "true";

// Direct imports ensure JSON files are bundled into the serverless function.
// Dynamic fs.readFileSync does NOT work on Vercel for files outside node_modules.
import statsData from "@/data/stats.json";
import mediaData from "@/data/media.json";
import storyboardsData from "@/data/storyboards.json";
import postsData from "@/data/posts.json";
import videosData from "@/data/videos.json";
import calendarData from "@/data/calendar.json";

// Detail files — import all known IDs
import storyboard_cmmercldr from "@/data/storyboards/cmmercldr0000t1t1hvktqy6h.json";
import post_cmmerd54v from "@/data/posts/cmmerd54v0001114kaf4zzbyp.json";
import video_cmmerd5e6 from "@/data/videos/cmmerd5e60001nu8rl3er02r1.json";
import media_cmmerc7g7 from "@/data/media/cmmerc7g70000nsfy8ucgx2n2.json";
import media_cmmercdsa from "@/data/media/cmmercdsa0000dl1zeo674tqm.json";
import media_cmmerce1g from "@/data/media/cmmerce1g00002e1ms96pkt2w.json";
import media_cmmerceas from "@/data/media/cmmerceas00005uxvoaihnw1w.json";

const detailMap: Record<string, Record<string, unknown>> = {
  "storyboards/cmmercldr0000t1t1hvktqy6h.json": storyboard_cmmercldr as unknown as Record<string, unknown>,
  "posts/cmmerd54v0001114kaf4zzbyp.json": post_cmmerd54v as unknown as Record<string, unknown>,
  "videos/cmmerd5e60001nu8rl3er02r1.json": video_cmmerd5e6 as unknown as Record<string, unknown>,
  "media/cmmerc7g70000nsfy8ucgx2n2.json": media_cmmerc7g7 as unknown as Record<string, unknown>,
  "media/cmmercdsa0000dl1zeo674tqm.json": media_cmmercdsa as unknown as Record<string, unknown>,
  "media/cmmerce1g00002e1ms96pkt2w.json": media_cmmerce1g as unknown as Record<string, unknown>,
  "media/cmmerceas00005uxvoaihnw1w.json": media_cmmerceas as unknown as Record<string, unknown>,
};

function readStaticJson<T>(filePath: string): T {
  const detail = detailMap[filePath];
  if (detail) return detail as T;
  throw new Error(`Static data not found: ${filePath}. Add an import for this file in src/lib/api.ts.`);
}

export async function getStats() {
  if (IS_STATIC) {
    return statsData as {
      mediaCount: number;
      videoFiles: number;
      photoFiles: number;
      audioFiles: number;
      storyboardCount: number;
      postCount: number;
      videoCount: number;
    };
  }

  const { prisma } = await import("./db");
  const [mediaCount, storyboardCount, postCount, videoCount] = await Promise.all([
    prisma.mediaFile.count(),
    prisma.storyboard.count(),
    prisma.post.count(),
    prisma.videoProject.count(),
  ]);

  const mediaCounts = await prisma.mediaFile.groupBy({
    by: ["fileType"],
    _count: true,
  });

  return {
    mediaCount,
    videoFiles: mediaCounts.find((m) => m.fileType === "video")?._count ?? 0,
    photoFiles: mediaCounts.find((m) => m.fileType === "photo")?._count ?? 0,
    audioFiles: mediaCounts.find((m) => m.fileType === "audio")?._count ?? 0,
    storyboardCount,
    postCount,
    videoCount,
  };
}

export async function getMediaFiles(fileType?: string) {
  if (IS_STATIC) {
    const all = mediaData as unknown as Array<Record<string, unknown>>;
    return fileType ? all.filter((m) => m.fileType === fileType) : all;
  }

  const { prisma } = await import("./db");
  return prisma.mediaFile.findMany({
    where: fileType ? { fileType } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getMediaFile(id: string) {
  if (IS_STATIC) {
    return readStaticJson<Record<string, unknown>>(`media/${id}.json`);
  }
  const { prisma } = await import("./db");
  return prisma.mediaFile.findUnique({ where: { id } });
}

export async function getStoryboards() {
  if (IS_STATIC) {
    return storyboardsData as unknown as Array<Record<string, unknown>>;
  }
  const { prisma } = await import("./db");
  return prisma.storyboard.findMany({
    include: { _count: { select: { scenes: true, posts: true, videoProjects: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStoryboard(id: string) {
  if (IS_STATIC) {
    return readStaticJson<Record<string, unknown>>(`storyboards/${id}.json`);
  }
  const { prisma } = await import("./db");
  return prisma.storyboard.findUnique({
    where: { id },
    include: {
      scenes: { orderBy: { order: "asc" } },
      posts: true,
      videoProjects: true,
      media: { include: { mediaFile: true } },
    },
  });
}

export async function getPosts(postType?: string) {
  if (IS_STATIC) {
    const all = postsData as unknown as Array<Record<string, unknown>>;
    return postType ? all.filter((p) => p.postType === postType) : all;
  }
  const { prisma } = await import("./db");
  return prisma.post.findMany({
    where: postType ? { postType } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPost(id: string) {
  if (IS_STATIC) {
    return readStaticJson<Record<string, unknown>>(`posts/${id}.json`);
  }
  const { prisma } = await import("./db");
  return prisma.post.findUnique({
    where: { id },
    include: {
      media: { include: { mediaFile: true } },
      feedback: { orderBy: { createdAt: "desc" } },
      storyboard: { select: { id: true, title: true } },
    },
  });
}

export async function getVideoProjects(format?: string) {
  if (IS_STATIC) {
    const all = videosData as unknown as Array<Record<string, unknown>>;
    return format ? all.filter((v) => v.format === format) : all;
  }
  const { prisma } = await import("./db");
  return prisma.videoProject.findMany({
    where: format ? { format } : undefined,
    include: { _count: { select: { clips: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVideoProject(id: string) {
  if (IS_STATIC) {
    return readStaticJson<Record<string, unknown>>(`videos/${id}.json`);
  }
  const { prisma } = await import("./db");
  return prisma.videoProject.findUnique({
    where: { id },
    include: {
      clips: { orderBy: { order: "asc" }, include: { mediaFile: true } },
      feedback: { orderBy: { createdAt: "desc" } },
      storyboard: { include: { scenes: { orderBy: { order: "asc" } } } },
    },
  });
}

// ─── Season Structure APIs ──────────────────────────────────────

export async function getSeasonData() {
  if (IS_STATIC) {
    return calendarData as {
      season: string;
      races: Array<Record<string, unknown>>;
      episodes: Array<Record<string, unknown>>;
      narratives: Record<string, { label: string; color: string }>;
    };
  }

  const { prisma } = await import("./db");
  const [races, episodes, narratives] = await Promise.all([
    prisma.race.findMany({ orderBy: { round: "asc" } }),
    prisma.episode.findMany({
      include: {
        narrative: true,
        race: true,
        _count: { select: { storyboards: true, posts: true, videoProjects: true } },
      },
      orderBy: { number: "asc" },
    }),
    prisma.narrative.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  // Transform episodes to include content piece counts
  const episodesWithCounts = episodes.map((ep) => ({
    ...ep,
    contentPieces: ep._count.storyboards + ep._count.posts + ep._count.videoProjects,
    storyboardCount: ep._count.storyboards,
    postCount: ep._count.posts,
    videoCount: ep._count.videoProjects,
  }));

  // Build narratives map
  const narrativeMap: Record<string, { label: string; color: string }> = {};
  for (const n of narratives) {
    narrativeMap[n.key] = { label: n.label, color: n.color };
  }

  return {
    season: "2026",
    races: races.map((r) => ({
      ...r,
      startDate: r.startDate.toISOString().split("T")[0],
      endDate: r.endDate.toISOString().split("T")[0],
    })),
    episodes: episodesWithCounts.map((ep) => ({
      id: ep.id,
      number: ep.number,
      title: ep.title,
      theme: ep.theme,
      status: ep.status,
      startDate: ep.startDate?.toISOString().split("T")[0] ?? "",
      endDate: ep.endDate?.toISOString().split("T")[0] ?? "",
      narrative: ep.narrative?.key ?? "",
      narrativeLabel: ep.narrative?.label ?? "",
      narrativeColor: ep.narrative?.color ?? "",
      raceRound: ep.race?.round ?? null,
      contentPieces: ep.contentPieces,
      storyboardCount: ep.storyboardCount,
      postCount: ep.postCount,
      videoCount: ep.videoCount,
      targetPieces: ep.targetPieces,
    })),
    narratives: narrativeMap,
  };
}

export async function getEpisodes() {
  if (IS_STATIC) {
    const data = calendarData as { episodes: Array<Record<string, unknown>> };
    return data.episodes;
  }

  const { prisma } = await import("./db");
  const episodes = await prisma.episode.findMany({
    include: {
      narrative: true,
      race: true,
      _count: { select: { storyboards: true, posts: true, videoProjects: true } },
    },
    orderBy: { number: "asc" },
  });

  return episodes.map((ep) => ({
    id: ep.id,
    number: ep.number,
    title: ep.title,
    theme: ep.theme,
    status: ep.status,
    startDate: ep.startDate?.toISOString().split("T")[0] ?? "",
    endDate: ep.endDate?.toISOString().split("T")[0] ?? "",
    narrative: ep.narrative?.key ?? "",
    narrativeLabel: ep.narrative?.label ?? "",
    narrativeColor: ep.narrative?.color ?? "",
    raceRound: ep.race?.round ?? null,
    raceTitle: ep.race?.title ?? null,
    contentPieces: ep._count.storyboards + ep._count.posts + ep._count.videoProjects,
    storyboardCount: ep._count.storyboards,
    postCount: ep._count.posts,
    videoCount: ep._count.videoProjects,
    targetPieces: ep.targetPieces,
  }));
}

export async function getEpisode(id: string) {
  if (IS_STATIC) {
    const data = calendarData as { episodes: Array<Record<string, unknown>> };
    const ep = data.episodes.find((e) => e.id === id || String(e.number) === id);
    return ep ? { ...ep, storyboards: [], posts: [], videoProjects: [] } : null;
  }

  const { prisma } = await import("./db");
  return prisma.episode.findUnique({
    where: { id },
    include: {
      narrative: true,
      race: true,
      storyboards: {
        include: { _count: { select: { scenes: true, posts: true, videoProjects: true } } },
        orderBy: { createdAt: "desc" },
      },
      posts: {
        include: { media: { include: { mediaFile: true } } },
        orderBy: { createdAt: "desc" },
      },
      videoProjects: {
        include: { _count: { select: { clips: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getRaces() {
  if (IS_STATIC) {
    const data = calendarData as { races: Array<Record<string, unknown>> };
    return data.races;
  }

  const { prisma } = await import("./db");
  const races = await prisma.race.findMany({ orderBy: { round: "asc" } });
  return races.map((r) => ({
    ...r,
    startDate: r.startDate.toISOString().split("T")[0],
    endDate: r.endDate.toISOString().split("T")[0],
  }));
}

export async function getNarratives() {
  if (IS_STATIC) {
    const data = calendarData as { narratives: Record<string, { label: string; color: string }> };
    return Object.entries(data.narratives).map(([key, val]) => ({ key, ...val }));
  }

  const { prisma } = await import("./db");
  return prisma.narrative.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getDashboardSeason() {
  if (IS_STATIC) {
    const data = calendarData as {
      races: Array<Record<string, unknown>>;
      episodes: Array<Record<string, unknown>>;
      narratives: Record<string, { label: string; color: string }>;
    };

    // Find current/next episode
    const now = new Date();
    const currentEp = data.episodes.find((ep) => {
      const start = new Date(ep.startDate as string);
      const end = new Date(ep.endDate as string);
      return now >= start && now <= end;
    });
    const nextRace = data.races.find((r) => r.status === "upcoming");

    return {
      currentEpisode: currentEp ?? null,
      nextRace: nextRace ?? null,
      totalEpisodes: data.episodes.length,
      totalRaces: data.races.length,
      completedRaces: data.races.filter((r) => r.status === "completed").length,
      totalContentPieces: 0,
      narratives: data.narratives,
      episodes: data.episodes,
    };
  }

  const { prisma } = await import("./db");
  const [races, episodes, narrativesRaw] = await Promise.all([
    prisma.race.findMany({ orderBy: { round: "asc" } }),
    prisma.episode.findMany({
      include: {
        narrative: true,
        race: true,
        _count: { select: { storyboards: true, posts: true, videoProjects: true } },
      },
      orderBy: { number: "asc" },
    }),
    prisma.narrative.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const now = new Date();
  const currentEp = episodes.find((ep) => {
    if (!ep.startDate || !ep.endDate) return false;
    return now >= ep.startDate && now <= ep.endDate;
  });
  const nextRace = races.find((r) => r.status === "upcoming");
  const totalContent = episodes.reduce((sum, ep) => sum + ep._count.storyboards + ep._count.posts + ep._count.videoProjects, 0);

  const narrativeMap: Record<string, { label: string; color: string }> = {};
  for (const n of narrativesRaw) narrativeMap[n.key] = { label: n.label, color: n.color };

  return {
    currentEpisode: currentEp ? {
      id: currentEp.id,
      number: currentEp.number,
      title: currentEp.title,
      theme: currentEp.theme,
      status: currentEp.status,
      narrative: currentEp.narrative?.key ?? "",
      narrativeLabel: currentEp.narrative?.label ?? "",
      narrativeColor: currentEp.narrative?.color ?? "",
      contentPieces: currentEp._count.storyboards + currentEp._count.posts + currentEp._count.videoProjects,
      targetPieces: currentEp.targetPieces,
    } : null,
    nextRace: nextRace ? {
      round: nextRace.round,
      title: nextRace.title,
      location: nextRace.location,
      country: nextRace.country,
      startDate: nextRace.startDate.toISOString().split("T")[0],
    } : null,
    totalEpisodes: episodes.length,
    totalRaces: races.length,
    completedRaces: races.filter((r) => r.status === "completed").length,
    totalContentPieces: totalContent,
    narratives: narrativeMap,
    episodes: episodes.map((ep) => ({
      id: ep.id,
      number: ep.number,
      title: ep.title,
      status: ep.status,
      narrative: ep.narrative?.key ?? "",
      narrativeColor: ep.narrative?.color ?? "",
      contentPieces: ep._count.storyboards + ep._count.posts + ep._count.videoProjects,
      targetPieces: ep.targetPieces,
    })),
  };
}

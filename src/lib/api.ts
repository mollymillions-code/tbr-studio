/**
 * Data access layer that works both locally (Prisma + SQLite) and on Vercel (static JSON).
 *
 * Set NEXT_PUBLIC_STATIC_DATA=true for Vercel builds.
 * When static, reads pre-generated JSON from /public/_data/.
 */

import * as fs from "fs";
import * as path from "path";

const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_DATA === "true";

function readStaticJson<T>(filePath: string): T {
  // Use src/data/ which gets bundled into the serverless function on Vercel.
  // public/_data/ is only served as static assets and is NOT available via fs in serverless.
  const full = path.resolve(process.cwd(), "src/data", filePath);
  const raw = fs.readFileSync(full, "utf-8");
  return JSON.parse(raw) as T;
}

// Re-export prisma for local use, but wrap data access for static mode
export async function getStats() {
  if (IS_STATIC) {
    return readStaticJson<{
      mediaCount: number;
      videoFiles: number;
      photoFiles: number;
      audioFiles: number;
      storyboardCount: number;
      postCount: number;
      videoCount: number;
    }>("stats.json");
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
    const all = readStaticJson<Array<Record<string, unknown>>>("media.json");
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
    return readStaticJson<Array<Record<string, unknown>>>("storyboards.json");
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
    const all = readStaticJson<Array<Record<string, unknown>>>("posts.json");
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
    const all = readStaticJson<Array<Record<string, unknown>>>("videos.json");
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

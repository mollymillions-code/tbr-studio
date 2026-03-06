/**
 * Generate static JSON data files for Vercel deployment.
 * Vercel cannot run SQLite, so we pre-generate all data as JSON files
 * that the dashboard reads at build time.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const OUT_DIR = path.resolve("public/_data");

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Stats
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

  fs.writeFileSync(
    path.join(OUT_DIR, "stats.json"),
    JSON.stringify({
      mediaCount,
      videoFiles: mediaCounts.find((m) => m.fileType === "video")?._count ?? 0,
      photoFiles: mediaCounts.find((m) => m.fileType === "photo")?._count ?? 0,
      audioFiles: mediaCounts.find((m) => m.fileType === "audio")?._count ?? 0,
      storyboardCount,
      postCount,
      videoCount,
    })
  );

  // Media files
  const mediaFiles = await prisma.mediaFile.findMany({ orderBy: { createdAt: "desc" } });
  fs.writeFileSync(path.join(OUT_DIR, "media.json"), JSON.stringify(mediaFiles));

  // Storyboards
  const storyboards = await prisma.storyboard.findMany({
    include: {
      scenes: { orderBy: { order: "asc" } },
      _count: { select: { scenes: true, posts: true, videoProjects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  fs.writeFileSync(path.join(OUT_DIR, "storyboards.json"), JSON.stringify(storyboards));

  // Individual storyboard detail files
  const sbDetailDir = path.join(OUT_DIR, "storyboards");
  if (!fs.existsSync(sbDetailDir)) fs.mkdirSync(sbDetailDir, { recursive: true });
  for (const sb of storyboards) {
    const detail = await prisma.storyboard.findUnique({
      where: { id: sb.id },
      include: {
        scenes: { orderBy: { order: "asc" } },
        posts: true,
        videoProjects: true,
        media: { include: { mediaFile: true } },
      },
    });
    fs.writeFileSync(path.join(sbDetailDir, `${sb.id}.json`), JSON.stringify(detail));
  }

  // Posts
  const posts = await prisma.post.findMany({
    include: {
      media: { include: { mediaFile: true } },
      feedback: { orderBy: { createdAt: "desc" } },
      storyboard: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  fs.writeFileSync(path.join(OUT_DIR, "posts.json"), JSON.stringify(posts));

  const postDetailDir = path.join(OUT_DIR, "posts");
  if (!fs.existsSync(postDetailDir)) fs.mkdirSync(postDetailDir, { recursive: true });
  for (const post of posts) {
    fs.writeFileSync(path.join(postDetailDir, `${post.id}.json`), JSON.stringify(post));
  }

  // Video projects
  const videos = await prisma.videoProject.findMany({
    include: {
      clips: { orderBy: { order: "asc" }, include: { mediaFile: true } },
      feedback: { orderBy: { createdAt: "desc" } },
      storyboard: { include: { scenes: { orderBy: { order: "asc" } } } },
      _count: { select: { clips: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  fs.writeFileSync(path.join(OUT_DIR, "videos.json"), JSON.stringify(videos));

  const videoDetailDir = path.join(OUT_DIR, "videos");
  if (!fs.existsSync(videoDetailDir)) fs.mkdirSync(videoDetailDir, { recursive: true });
  for (const vp of videos) {
    fs.writeFileSync(path.join(videoDetailDir, `${vp.id}.json`), JSON.stringify(vp));
  }

  // Media detail files
  const mediaDetailDir = path.join(OUT_DIR, "media");
  if (!fs.existsSync(mediaDetailDir)) fs.mkdirSync(mediaDetailDir, { recursive: true });
  for (const mf of mediaFiles) {
    fs.writeFileSync(path.join(mediaDetailDir, `${mf.id}.json`), JSON.stringify(mf));
  }

  console.log(`Static data generated in ${OUT_DIR}`);
  console.log(`  Media: ${mediaFiles.length}, Storyboards: ${storyboards.length}, Posts: ${posts.length}, Videos: ${videos.length}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

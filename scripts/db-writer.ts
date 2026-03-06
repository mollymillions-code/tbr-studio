#!/usr/bin/env npx tsx
/**
 * TBR Studio — DB Writer CLI
 *
 * Used by Claude Code runtime to write to the shared SQLite database.
 *
 * Usage:
 *   npx tsx scripts/db-writer.ts <command> [flags]
 *
 * Commands:
 *   add-media          Add a media file to the library
 *   add-storyboard     Create a new storyboard
 *   add-scene          Add a scene to a storyboard
 *   add-post           Create a new post
 *   add-video-project  Create a new video project
 *   add-clip           Add a clip to a video project
 *   update-status      Update status of any entity
 *   add-feedback       Add feedback to a post or video
 *   read-feedback      Read unactioned feedback
 *   link-media         Link a media file to a storyboard
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "true";
      result[key] = val;
      if (val !== "true") i++;
    }
  }
  return result;
}

function require(flags: Record<string, string>, ...keys: string[]) {
  for (const k of keys) {
    if (!flags[k]) {
      console.error(`Missing required flag: --${k}`);
      process.exit(1);
    }
  }
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const flags = parseArgs(rest);

  switch (command) {
    // ─── Media Library ────────────────────────────────────────
    case "add-media": {
      require(flags, "fileName", "filePath", "fileType", "sourceType");
      const media = await prisma.mediaFile.create({
        data: {
          fileName: flags.fileName,
          filePath: flags.filePath,
          fileType: flags.fileType,
          sourceType: flags.sourceType,
          mimeType: flags.mimeType || null,
          fileSize: flags.fileSize ? parseInt(flags.fileSize) : null,
          duration: flags.duration ? parseFloat(flags.duration) : null,
          width: flags.width ? parseInt(flags.width) : null,
          height: flags.height ? parseInt(flags.height) : null,
          tags: flags.tags || null,
          description: flags.description || null,
          season: flags.season || null,
          event: flags.event || null,
          location: flags.location || null,
          aiGenerated: flags.aiGenerated === "true",
          aiModel: flags.aiModel || null,
          thumbnailPath: flags.thumbnailPath || null,
        },
      });
      console.log(JSON.stringify({ id: media.id, fileName: media.fileName }));
      break;
    }

    // ─── Storyboard ───────────────────────────────────────────
    case "add-storyboard": {
      require(flags, "title", "format");
      const sb = await prisma.storyboard.create({
        data: {
          title: flags.title,
          format: flags.format,
          description: flags.description || null,
          aiIntensity: flags.aiIntensity ? parseInt(flags.aiIntensity) : 3,
          storyline: flags.storyline || null,
          hook: flags.hook || null,
          cta: flags.cta || null,
          tone: flags.tone || null,
          targetPlatform: flags.targetPlatform || null,
          metadata: flags.metadata || null,
        },
      });
      console.log(JSON.stringify({ id: sb.id, title: sb.title }));
      break;
    }

    case "add-scene": {
      require(flags, "storyboardId", "order", "description");
      const scene = await prisma.storyboardScene.create({
        data: {
          storyboardId: flags.storyboardId,
          order: parseInt(flags.order),
          title: flags.title || null,
          description: flags.description,
          duration: flags.duration ? parseFloat(flags.duration) : null,
          voiceover: flags.voiceover || null,
          textOverlay: flags.textOverlay || null,
          visualNotes: flags.visualNotes || null,
          transition: flags.transition || null,
          sourceType: flags.sourceType || "real",
          aiPrompt: flags.aiPrompt || null,
        },
      });
      console.log(JSON.stringify({ id: scene.id, order: scene.order }));
      break;
    }

    // ─── Posts ────────────────────────────────────────────────
    case "add-post": {
      require(flags, "title", "postType", "platform");
      const post = await prisma.post.create({
        data: {
          title: flags.title,
          postType: flags.postType,
          platform: flags.platform,
          storyboardId: flags.storyboardId || null,
          caption: flags.caption || null,
          hashtags: flags.hashtags || null,
          slides: flags.slides || null,
          scheduledAt: flags.scheduledAt ? new Date(flags.scheduledAt) : null,
          metadata: flags.metadata || null,
        },
      });
      console.log(JSON.stringify({ id: post.id, title: post.title }));
      break;
    }

    // ─── Video Projects ──────────────────────────────────────
    case "add-video-project": {
      require(flags, "title");
      const vp = await prisma.videoProject.create({
        data: {
          title: flags.title,
          storyboardId: flags.storyboardId || null,
          format: flags.format || "reel",
          duration: flags.duration ? parseFloat(flags.duration) : null,
          resolution: flags.resolution || "1080x1920",
          remotionCompositionId: flags.remotionCompositionId || null,
          metadata: flags.metadata || null,
        },
      });
      console.log(JSON.stringify({ id: vp.id, title: vp.title }));
      break;
    }

    case "add-clip": {
      require(flags, "videoProjectId", "order");
      const clip = await prisma.videoClip.create({
        data: {
          videoProjectId: flags.videoProjectId,
          order: parseInt(flags.order),
          mediaFileId: flags.mediaFileId || null,
          label: flags.label || null,
          trimStart: flags.trimStart ? parseFloat(flags.trimStart) : null,
          trimEnd: flags.trimEnd ? parseFloat(flags.trimEnd) : null,
          voiceoverText: flags.voiceoverText || null,
          textOverlay: flags.textOverlay || null,
          effect: flags.effect || null,
          aiGenerated: flags.aiGenerated === "true",
          aiPrompt: flags.aiPrompt || null,
          aiModel: flags.aiModel || null,
        },
      });
      console.log(JSON.stringify({ id: clip.id, order: clip.order }));
      break;
    }

    // ─── Status Updates ──────────────────────────────────────
    case "update-status": {
      require(flags, "entity", "id", "status");
      const { entity, id, status } = flags;
      switch (entity) {
        case "storyboard":
          await prisma.storyboard.update({ where: { id }, data: { status } });
          break;
        case "post":
          await prisma.post.update({
            where: { id },
            data: {
              status,
              publishedAt: status === "PUBLISHED" ? new Date() : undefined,
            },
          });
          break;
        case "video":
          await prisma.videoProject.update({ where: { id }, data: { status } });
          break;
        default:
          console.error(`Unknown entity: ${entity}`);
          process.exit(1);
      }
      console.log(JSON.stringify({ entity, id, status }));
      break;
    }

    // ─── Feedback ────────────────────────────────────────────
    case "add-feedback": {
      require(flags, "entity", "id", "author", "comment");
      if (flags.entity === "post") {
        const fb = await prisma.postFeedback.create({
          data: {
            postId: flags.id,
            author: flags.author,
            comment: flags.comment,
          },
        });
        console.log(JSON.stringify({ feedbackId: fb.id }));
      } else if (flags.entity === "video") {
        const fb = await prisma.videoFeedback.create({
          data: {
            videoProjectId: flags.id,
            author: flags.author,
            comment: flags.comment,
            timecode: flags.timecode ? parseFloat(flags.timecode) : null,
          },
        });
        console.log(JSON.stringify({ feedbackId: fb.id }));
      }
      break;
    }

    case "read-feedback": {
      const postFb = await prisma.postFeedback.findMany({
        where: { actioned: false },
        include: { post: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      });
      const videoFb = await prisma.videoFeedback.findMany({
        where: { actioned: false },
        include: { videoProject: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      });
      console.log(
        JSON.stringify({
          postFeedback: postFb,
          videoFeedback: videoFb,
        }, null, 2)
      );
      break;
    }

    // ─── Link Media ──────────────────────────────────────────
    case "link-media": {
      require(flags, "storyboardId", "mediaFileId", "role");
      const link = await prisma.storyboardMedia.create({
        data: {
          storyboardId: flags.storyboardId,
          mediaFileId: flags.mediaFileId,
          role: flags.role,
          notes: flags.notes || null,
        },
      });
      console.log(JSON.stringify({ id: link.id }));
      break;
    }

    case "link-post-media": {
      require(flags, "postId", "mediaFileId");
      const link = await prisma.postMedia.create({
        data: {
          postId: flags.postId,
          mediaFileId: flags.mediaFileId,
          order: flags.order ? parseInt(flags.order) : 0,
          role: flags.role || "primary",
        },
      });
      console.log(JSON.stringify({ id: link.id }));
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.error(
        "Available: add-media, add-storyboard, add-scene, add-post, add-video-project, add-clip, update-status, add-feedback, read-feedback, link-media, link-post-media"
      );
      process.exit(1);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

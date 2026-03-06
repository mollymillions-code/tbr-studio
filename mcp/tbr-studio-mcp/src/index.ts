#!/usr/bin/env npx tsx
/**
 * TBR Studio MCP Server
 *
 * Provides Claude Code with tools to operate the entire TBR Studio:
 * - Media Library (search, add, browse)
 * - Storyboards (create, add scenes, manage)
 * - Posts (create, attach media, manage)
 * - Video Projects (create, add clips, manage)
 * - Remotion (render videos)
 * - ElevenLabs (voiceover generation)
 * - Gemini/NanoBanana (AI image generation)
 * - Postiz (social media publishing)
 * - Human interaction (ask for input, present for review)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "../../..");

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${path.resolve(PROJECT_ROOT, "prisma/dev.db")}` } },
});

const server = new McpServer({
  name: "tbr-studio",
  version: "1.0.0",
});

// ─── Media Library Tools ─────────────────────────────────────────

server.tool(
  "tbr_library_search",
  "Search the media library for videos, photos, or audio files by type, source, tags, event, or keyword",
  {
    fileType: z.enum(["video", "photo", "audio"]).optional().describe("Filter by file type"),
    sourceType: z.enum(["race", "b_roll", "documentary", "event", "interview", "ambient"]).optional().describe("Filter by source type"),
    event: z.string().optional().describe("Filter by event name (partial match)"),
    season: z.string().optional().describe("Filter by season year"),
    keyword: z.string().optional().describe("Search in fileName, description, tags"),
    limit: z.number().default(20).describe("Max results to return"),
  },
  async (params) => {
    const where: Record<string, unknown> = {};
    if (params.fileType) where.fileType = params.fileType;
    if (params.sourceType) where.sourceType = params.sourceType;
    if (params.season) where.season = params.season;
    if (params.event) where.event = { contains: params.event };
    if (params.keyword) {
      where.OR = [
        { fileName: { contains: params.keyword } },
        { description: { contains: params.keyword } },
        { tags: { contains: params.keyword } },
      ];
    }

    const files = await prisma.mediaFile.findMany({
      where,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(files, null, 2) }],
    };
  }
);

server.tool(
  "tbr_library_add",
  "Add a media file to the library (video, photo, or audio)",
  {
    fileName: z.string().describe("File name"),
    filePath: z.string().describe("Path to the file relative to project root"),
    fileType: z.enum(["video", "photo", "audio"]).describe("Type of media file"),
    sourceType: z.enum(["race", "b_roll", "documentary", "event", "interview", "ambient"]).describe("Source category"),
    duration: z.number().optional().describe("Duration in seconds (video/audio)"),
    width: z.number().optional().describe("Width in pixels (video/photo)"),
    height: z.number().optional().describe("Height in pixels (video/photo)"),
    description: z.string().optional().describe("Description of the media"),
    season: z.string().optional().describe("Season year"),
    event: z.string().optional().describe("Event name"),
    location: z.string().optional().describe("Location"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    aiGenerated: z.boolean().default(false).describe("Whether this was AI-generated"),
    aiModel: z.string().optional().describe("AI model used if generated"),
  },
  async (params) => {
    const file = await prisma.mediaFile.create({
      data: {
        fileName: params.fileName,
        filePath: params.filePath,
        fileType: params.fileType,
        sourceType: params.sourceType,
        duration: params.duration,
        width: params.width,
        height: params.height,
        description: params.description,
        season: params.season,
        event: params.event,
        location: params.location,
        tags: params.tags ? JSON.stringify(params.tags) : null,
        aiGenerated: params.aiGenerated,
        aiModel: params.aiModel,
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ id: file.id, fileName: file.fileName, message: "Media file added to library" }) }],
    };
  }
);

// ─── Storyboard Tools ────────────────────────────────────────────

server.tool(
  "tbr_storyboard_create",
  "Create a new storyboard with storyline, AI intensity, and target format",
  {
    title: z.string().describe("Storyboard title"),
    format: z.enum(["short_video", "post", "carousel", "reel", "story"]).describe("Content format"),
    aiIntensity: z.number().min(0).max(10).default(3).describe("AI intensity 0-10. 0=all real footage, 10=heavy AI"),
    tone: z.enum(["hype", "documentary", "emotional", "technical"]).optional().describe("Content tone"),
    targetPlatform: z.enum(["instagram", "twitter", "linkedin", "youtube", "tiktok"]).optional(),
    storyline: z.string().optional().describe("Full narrative text"),
    hook: z.string().optional().describe("Opening hook (first 3 seconds / first line)"),
    cta: z.string().optional().describe("Call to action"),
    description: z.string().optional(),
    episodeId: z.string().optional().describe("Link to an episode for season tracking"),
  },
  async (params) => {
    const sb = await prisma.storyboard.create({
      data: {
        title: params.title,
        format: params.format,
        aiIntensity: params.aiIntensity,
        tone: params.tone,
        targetPlatform: params.targetPlatform,
        storyline: params.storyline,
        hook: params.hook,
        cta: params.cta,
        description: params.description,
        episodeId: params.episodeId,
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ id: sb.id, title: sb.title, aiIntensity: sb.aiIntensity, episodeId: params.episodeId, message: "Storyboard created" }) }],
    };
  }
);

server.tool(
  "tbr_storyboard_add_scene",
  "Add a scene to a storyboard with visual direction, voiceover, and source preference",
  {
    storyboardId: z.string().describe("Storyboard ID"),
    order: z.number().describe("Scene order (1-based)"),
    title: z.string().optional().describe("Scene title"),
    description: z.string().describe("What happens in this scene"),
    duration: z.number().optional().describe("Target duration in seconds"),
    voiceover: z.string().optional().describe("Narration text for this scene"),
    textOverlay: z.string().optional().describe("On-screen text"),
    visualNotes: z.string().optional().describe("Visual direction notes"),
    transition: z.enum(["cut", "fade", "dissolve", "none"]).optional().describe("Transition to next scene"),
    sourceType: z.enum(["real", "ai", "mixed"]).default("real").describe("Footage source preference"),
    aiPrompt: z.string().optional().describe("AI generation prompt if sourceType is ai or mixed"),
  },
  async (params) => {
    const scene = await prisma.storyboardScene.create({
      data: {
        storyboardId: params.storyboardId,
        order: params.order,
        title: params.title,
        description: params.description,
        duration: params.duration,
        voiceover: params.voiceover,
        textOverlay: params.textOverlay,
        visualNotes: params.visualNotes,
        transition: params.transition,
        sourceType: params.sourceType,
        aiPrompt: params.aiPrompt,
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ id: scene.id, order: scene.order, message: "Scene added" }) }],
    };
  }
);

server.tool(
  "tbr_storyboard_get",
  "Get a storyboard with all its scenes, linked posts, and video projects",
  {
    storyboardId: z.string().describe("Storyboard ID"),
  },
  async (params) => {
    const sb = await prisma.storyboard.findUnique({
      where: { id: params.storyboardId },
      include: {
        scenes: { orderBy: { order: "asc" } },
        posts: true,
        videoProjects: true,
        media: { include: { mediaFile: true } },
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(sb, null, 2) }],
    };
  }
);

// ─── Post Tools ──────────────────────────────────────────────────

server.tool(
  "tbr_post_create",
  "Create a social media post (carousel, single image, text, video clip, story, reel)",
  {
    title: z.string().describe("Post title"),
    postType: z.enum(["single_image", "carousel", "text", "video_clip", "story", "reel"]).describe("Post type"),
    platform: z.enum(["instagram", "twitter", "linkedin", "youtube", "tiktok"]).describe("Target platform"),
    caption: z.string().optional().describe("Post caption"),
    hashtags: z.array(z.string()).optional().describe("Hashtags"),
    slides: z.array(z.object({
      slide: z.number(),
      visual: z.string(),
      text: z.string(),
    })).optional().describe("Carousel slides"),
    storyboardId: z.string().optional().describe("Link to storyboard"),
    episodeId: z.string().optional().describe("Link to an episode for season tracking"),
    scheduledAt: z.string().optional().describe("ISO date for scheduling"),
  },
  async (params) => {
    const post = await prisma.post.create({
      data: {
        title: params.title,
        postType: params.postType,
        platform: params.platform,
        caption: params.caption,
        hashtags: params.hashtags ? JSON.stringify(params.hashtags) : null,
        slides: params.slides ? JSON.stringify(params.slides) : null,
        storyboardId: params.storyboardId,
        episodeId: params.episodeId,
        scheduledAt: params.scheduledAt ? new Date(params.scheduledAt) : null,
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ id: post.id, title: post.title, message: "Post created" }) }],
    };
  }
);

server.tool(
  "tbr_post_attach_media",
  "Attach a media file to a post (for image posts and carousel slides)",
  {
    postId: z.string().describe("Post ID"),
    mediaFileId: z.string().describe("Media file ID from library"),
    order: z.number().default(0).describe("Order (for carousels)"),
    role: z.string().default("primary").describe("Role: primary, slide_1, slide_2, etc."),
  },
  async (params) => {
    const link = await prisma.postMedia.create({
      data: {
        postId: params.postId,
        mediaFileId: params.mediaFileId,
        order: params.order,
        role: params.role,
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ id: link.id, message: "Media attached to post" }) }],
    };
  }
);

// ─── Video Project Tools ─────────────────────────────────────────

server.tool(
  "tbr_video_create",
  "Create a new video project linked to a storyboard",
  {
    title: z.string().describe("Video project title"),
    format: z.enum(["reel", "short", "story", "highlight"]).default("reel"),
    storyboardId: z.string().optional().describe("Link to storyboard"),
    episodeId: z.string().optional().describe("Link to an episode for season tracking"),
    resolution: z.string().default("1080x1920").describe("Resolution (WxH)"),
  },
  async (params) => {
    const vp = await prisma.videoProject.create({
      data: {
        title: params.title,
        format: params.format,
        storyboardId: params.storyboardId,
        episodeId: params.episodeId,
        resolution: params.resolution,
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ id: vp.id, title: vp.title, message: "Video project created" }) }],
    };
  }
);

server.tool(
  "tbr_video_add_clip",
  "Add a clip to a video project (from library or AI-generated)",
  {
    videoProjectId: z.string().describe("Video project ID"),
    order: z.number().describe("Clip order in sequence"),
    mediaFileId: z.string().optional().describe("Media file ID from library"),
    label: z.string().optional().describe("Clip label/description"),
    trimStart: z.number().optional().describe("Trim start in seconds"),
    trimEnd: z.number().optional().describe("Trim end in seconds"),
    voiceoverText: z.string().optional().describe("Narration text for this clip"),
    textOverlay: z.string().optional().describe("On-screen text"),
    effect: z.enum(["ken_burns", "slow_mo", "speed_ramp", "none"]).optional(),
    aiGenerated: z.boolean().default(false),
    aiPrompt: z.string().optional().describe("AI generation prompt"),
    aiModel: z.string().optional().describe("AI model (veo3, gemini, etc.)"),
  },
  async (params) => {
    const clip = await prisma.videoClip.create({
      data: {
        videoProjectId: params.videoProjectId,
        order: params.order,
        mediaFileId: params.mediaFileId,
        label: params.label,
        trimStart: params.trimStart,
        trimEnd: params.trimEnd,
        voiceoverText: params.voiceoverText,
        textOverlay: params.textOverlay,
        effect: params.effect,
        aiGenerated: params.aiGenerated,
        aiPrompt: params.aiPrompt,
        aiModel: params.aiModel,
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ id: clip.id, order: clip.order, message: "Clip added to video project" }) }],
    };
  }
);

server.tool(
  "tbr_video_get",
  "Get a video project with all clips, feedback, and linked storyboard",
  {
    videoProjectId: z.string().describe("Video project ID"),
  },
  async (params) => {
    const vp = await prisma.videoProject.findUnique({
      where: { id: params.videoProjectId },
      include: {
        clips: { orderBy: { order: "asc" }, include: { mediaFile: true } },
        feedback: { orderBy: { createdAt: "desc" } },
        storyboard: { include: { scenes: { orderBy: { order: "asc" } } } },
      },
    });

    return {
      content: [{ type: "text" as const, text: JSON.stringify(vp, null, 2) }],
    };
  }
);

// ─── Status Management ───────────────────────────────────────────

server.tool(
  "tbr_update_status",
  "Update the status of a storyboard, post, or video project",
  {
    entity: z.enum(["storyboard", "post", "video"]).describe("Entity type"),
    id: z.string().describe("Entity ID"),
    status: z.string().describe("New status (DRAFT, IN_PROGRESS, REVIEW, APPROVED, PUBLISHED, etc.)"),
  },
  async (params) => {
    const { entity, id, status } = params;
    if (entity === "storyboard") {
      await prisma.storyboard.update({ where: { id }, data: { status } });
    } else if (entity === "post") {
      await prisma.post.update({
        where: { id },
        data: { status, publishedAt: status === "PUBLISHED" ? new Date() : undefined },
      });
    } else {
      await prisma.videoProject.update({ where: { id }, data: { status } });
    }

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ entity, id, status, message: "Status updated" }) }],
    };
  }
);

// ─── Feedback Tools ──────────────────────────────────────────────

server.tool(
  "tbr_read_feedback",
  "Read all unactioned human feedback across posts and video projects",
  {},
  async () => {
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

    const total = postFb.length + videoFb.length;

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          totalUnactioned: total,
          postFeedback: postFb,
          videoFeedback: videoFb,
        }, null, 2),
      }],
    };
  }
);

// ─── ElevenLabs Voiceover ────────────────────────────────────────

server.tool(
  "tbr_elevenlabs_voiceover",
  "Generate voiceover audio using ElevenLabs Text-to-Speech API. Requires ELEVENLABS_API_KEY env var.",
  {
    text: z.string().describe("Text to convert to speech"),
    voiceId: z.string().default("pNInz6obpgDQGcFmaJgB").describe("ElevenLabs voice ID"),
    outputPath: z.string().describe("Output file path relative to project root"),
    model: z.string().default("eleven_multilingual_v2").describe("ElevenLabs model"),
  },
  async (params) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            error: "ELEVENLABS_API_KEY not set",
            action: "Please set the ELEVENLABS_API_KEY environment variable. You can get a key from https://elevenlabs.io",
          }),
        }],
      };
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${params.voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: params.text,
            model_id: params.model,
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const outputAbs = path.resolve(PROJECT_ROOT, params.outputPath);
      const dir = path.dirname(outputAbs);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputAbs, buffer);

      // Register in media library
      const media = await prisma.mediaFile.create({
        data: {
          fileName: path.basename(params.outputPath),
          filePath: params.outputPath,
          fileType: "audio",
          sourceType: "ambient",
          aiGenerated: true,
          aiModel: "elevenlabs",
          description: `Voiceover: "${params.text.substring(0, 100)}..."`,
        },
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            outputPath: params.outputPath,
            mediaFileId: media.id,
            message: "Voiceover generated and added to library",
          }),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: String(error) }) }],
      };
    }
  }
);

// ─── Gemini / NanoBanana Image Generation ────────────────────────

server.tool(
  "tbr_gemini_generate_image",
  "Generate an AI image using Gemini (NanoBanana2) API. Requires GEMINI_API_KEY env var.",
  {
    prompt: z.string().describe("Detailed image generation prompt"),
    fileName: z.string().describe("Output filename without extension"),
    aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9", "3:2"]).default("9:16"),
    model: z.string().default("gemini-3.1-flash-image-preview"),
    outputDir: z.string().default("assets/images").describe("Output directory relative to project root"),
  },
  async (params) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            error: "GEMINI_API_KEY not set",
            action: "Please set GEMINI_API_KEY. Get one from https://ai.google.dev",
          }),
        }],
      };
    }

    try {
      // Use the generate-image.mjs script if available, otherwise call API directly
      const outputDir = path.resolve(PROJECT_ROOT, params.outputDir);
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const scriptPath = path.resolve(PROJECT_ROOT, "scripts/generate-image.mjs");
      const outputPath = `${params.outputDir}/${params.fileName}.png`;

      if (fs.existsSync(scriptPath)) {
        execSync(
          `node "${scriptPath}" "${params.prompt}" "${params.fileName}" "${params.model}" "${params.aspectRatio}"`,
          { cwd: PROJECT_ROOT, env: { ...process.env, GEMINI_API_KEY: apiKey } }
        );
      } else {
        // Direct API call
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: params.prompt }] }],
              generationConfig: {
                responseModalities: ["TEXT", "IMAGE"],
                ...(params.aspectRatio && { aspectRatio: params.aspectRatio }),
              },
            }),
          }
        );

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
        const data = await response.json() as { candidates: Array<{ content: { parts: Array<{ inlineData?: { data: string } }> } }> };

        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData) {
            const buffer = Buffer.from(part.inlineData.data, "base64");
            fs.writeFileSync(path.resolve(PROJECT_ROOT, outputPath), buffer);
            break;
          }
        }
      }

      // Register in media library
      const media = await prisma.mediaFile.create({
        data: {
          fileName: `${params.fileName}.png`,
          filePath: outputPath,
          fileType: "photo",
          sourceType: "b_roll",
          aiGenerated: true,
          aiModel: params.model,
          description: `AI generated: "${params.prompt.substring(0, 100)}..."`,
        },
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            outputPath,
            mediaFileId: media.id,
            message: "Image generated and added to library",
          }),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: String(error) }) }],
      };
    }
  }
);

// ─── Remotion Render ─────────────────────────────────────────────

server.tool(
  "tbr_remotion_render",
  "Trigger a Remotion video render for a video project. Assembles clips into final video per storyboard.",
  {
    videoProjectId: z.string().describe("Video project ID to render"),
    outputPath: z.string().optional().describe("Output file path (default: assets/videos/<id>/v1.mp4)"),
  },
  async (params) => {
    // Fetch the video project with all clips
    const vp = await prisma.videoProject.findUnique({
      where: { id: params.videoProjectId },
      include: {
        clips: { orderBy: { order: "asc" }, include: { mediaFile: true } },
        storyboard: { include: { scenes: { orderBy: { order: "asc" } } } },
      },
    });

    if (!vp) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: "Video project not found" }) }] };
    }

    const outPath = params.outputPath || `assets/videos/${vp.id}/v1.mp4`;
    const outDir = path.dirname(path.resolve(PROJECT_ROOT, outPath));
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Build a Remotion CompositionSpec (matches /remotion/src/types.ts)
    const width = parseInt(vp.resolution?.split("x")[0] || "1080");
    const height = parseInt(vp.resolution?.split("x")[1] || "1920");
    const fullOutPath = path.resolve(PROJECT_ROOT, outPath);

    const spec = {
      projectId: vp.id,
      title: vp.title,
      width,
      height,
      fps: 30,
      clips: vp.clips.map((clip) => {
        // Calculate clip duration from trim points or storyboard scene
        const scene = vp.storyboard?.scenes.find((s) => s.order === clip.order);
        let duration = 5; // default 5s
        if (clip.trimStart != null && clip.trimEnd != null) {
          duration = clip.trimEnd - clip.trimStart;
        } else if (scene?.duration != null) {
          duration = scene.duration;
        }

        return {
          order: clip.order,
          label: clip.label,
          mediaPath: clip.mediaFile ? path.resolve(PROJECT_ROOT, clip.mediaFile.filePath) : undefined,
          duration,
          trimStart: clip.trimStart ?? undefined,
          trimEnd: clip.trimEnd ?? undefined,
          effect: (clip.effect as "none" | "ken_burns" | "slow_mo" | "speed_ramp") || "none",
          textOverlay: clip.textOverlay || undefined,
          textPosition: "bottom-third" as const,
          voiceoverPath: undefined, // Set after ElevenLabs generation
          transition: (clip.effect === "ken_burns" ? "dissolve" : "cut") as "cut" | "fade" | "dissolve",
          aiGenerated: clip.aiGenerated,
        };
      }),
      outputPath: fullOutPath,
    };

    // Write the composition spec for Remotion to consume
    const specPath = path.resolve(outDir, "composition-spec.json");
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

    // Update video project status
    await prisma.videoProject.update({
      where: { id: vp.id },
      data: {
        status: "RENDERING",
        outputPath: outPath,
        remotionCompositionId: `TBR-${vp.id}`,
      },
    });

    // Try to trigger the Remotion render
    const remotionDir = path.resolve(PROJECT_ROOT, "remotion");
    const renderCmd = `cd "${remotionDir}" && npx tsx src/render.ts --spec "${specPath}"`;

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          videoProjectId: vp.id,
          compositionSpec: specPath,
          outputPath: fullOutPath,
          status: "RENDERING",
          clipCount: vp.clips.length,
          resolution: `${width}x${height}`,
          renderCommand: renderCmd,
          message: `Composition spec written to ${specPath}. Run the render with:\n${renderCmd}`,
          nextStep: "Run the render command above. If Remotion deps are not installed, run 'npm install' in /remotion/ first.",
        }),
      }],
    };
  }
);

// ─── Postiz Publishing ───────────────────────────────────────────
// Postiz is a self-hosted social media CLI and MCP server.
// It runs as a separate MCP (postiz-mcp) or via the `postiz` CLI.
// This tool prepares the post data and shells out to the Postiz CLI.

server.tool(
  "tbr_postiz_publish",
  "Publish a post to social media via the Postiz CLI. Postiz must be installed (`npm i -g postiz`) and configured with connected social accounts.",
  {
    postId: z.string().describe("Post ID to publish"),
    scheduleDate: z.string().optional().describe("ISO date to schedule (omit for immediate)"),
  },
  async (params) => {
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      include: { media: { include: { mediaFile: true } } },
    });

    if (!post) {
      return { content: [{ type: "text" as const, text: JSON.stringify({ error: "Post not found" }) }] };
    }

    // Build the caption with hashtags
    const hashtags = post.hashtags ? JSON.parse(post.hashtags) as string[] : [];
    const fullCaption = [
      post.caption || "",
      "",
      hashtags.map((h: string) => `#${h}`).join(" "),
    ].filter(Boolean).join("\n");

    // Build the Postiz CLI command
    const mediaFiles = post.media.map((m) => path.resolve(PROJECT_ROOT, m.mediaFile.filePath));
    const mediaArgs = mediaFiles.map((f) => `--media "${f}"`).join(" ");
    const scheduleArg = params.scheduleDate ? `--schedule "${params.scheduleDate}"` : "";

    // Map platform names to Postiz integration names
    const platformMap: Record<string, string> = {
      instagram: "instagram",
      twitter: "x",
      linkedin: "linkedin",
      youtube: "youtube",
      tiktok: "tiktok",
    };
    const postizPlatform = platformMap[post.platform] || post.platform;

    const command = `postiz posts:create --platform ${postizPlatform} --content "${fullCaption.replace(/"/g, '\\"')}" ${mediaArgs} ${scheduleArg}`.trim();

    try {
      const output = execSync(command, { cwd: PROJECT_ROOT, timeout: 30000 }).toString();

      // Update post status in DB
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: params.scheduleDate ? "SCHEDULED" : "PUBLISHED",
          scheduledAt: params.scheduleDate ? new Date(params.scheduleDate) : undefined,
          publishedAt: params.scheduleDate ? undefined : new Date(),
          postizJobId: output.trim() || "published",
        },
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            postId: post.id,
            platform: post.platform,
            status: params.scheduleDate ? "SCHEDULED" : "PUBLISHED",
            postizOutput: output.trim(),
            command,
            message: params.scheduleDate
              ? `Post scheduled for ${params.scheduleDate} via Postiz CLI`
              : "Post published via Postiz CLI",
          }),
        }],
      };
    } catch (error) {
      // If Postiz CLI is not installed or fails, provide instructions
      const errorMsg = String(error);
      const isNotInstalled = errorMsg.includes("not found") || errorMsg.includes("ENOENT");

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            error: isNotInstalled
              ? "Postiz CLI not found. Install it with: npm i -g postiz"
              : `Postiz CLI error: ${errorMsg}`,
            command,
            fallback: "You can also use the Postiz MCP server directly if it is configured as a separate MCP in .mcp.json. Or use the Postiz web dashboard to publish manually.",
            postData: {
              platform: post.platform,
              caption: fullCaption,
              mediaFiles: mediaFiles,
            },
          }),
        }],
      };
    }
  }
);

server.tool(
  "tbr_postiz_list_integrations",
  "List connected social media accounts in Postiz. Requires Postiz CLI installed.",
  {},
  async () => {
    try {
      const output = execSync("postiz integrations:list", { timeout: 10000 }).toString();
      return {
        content: [{ type: "text" as const, text: output }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            error: "Could not list Postiz integrations. Is Postiz CLI installed? Run: npm i -g postiz",
            details: String(error),
          }),
        }],
      };
    }
  }
);

// ─── Human Interaction ───────────────────────────────────────────

server.tool(
  "tbr_request_from_human",
  "Request input from the human (audio files, footage, approvals, creative decisions). This pauses the workflow until the human responds.",
  {
    requestType: z.enum(["audio_needed", "footage_needed", "approval_needed", "creative_decision", "music_selection", "general"]).describe("Type of request"),
    context: z.string().describe("What you are working on"),
    question: z.string().describe("The specific question or request for the human"),
    options: z.array(z.string()).optional().describe("Options to choose from (if applicable)"),
    storyboardId: z.string().optional().describe("Related storyboard ID"),
    videoProjectId: z.string().optional().describe("Related video project ID"),
    postId: z.string().optional().describe("Related post ID"),
  },
  async (params) => {
    // Format the request as a clear message for the human
    const request = {
      type: params.requestType,
      context: params.context,
      question: params.question,
      options: params.options,
      relatedIds: {
        storyboard: params.storyboardId,
        videoProject: params.videoProjectId,
        post: params.postId,
      },
      timestamp: new Date().toISOString(),
    };

    // Log the request to a file so it persists
    const requestsDir = path.resolve(PROJECT_ROOT, "assets/requests");
    if (!fs.existsSync(requestsDir)) fs.mkdirSync(requestsDir, { recursive: true });
    const requestFile = path.resolve(requestsDir, `request-${Date.now()}.json`);
    fs.writeFileSync(requestFile, JSON.stringify(request, null, 2));

    return {
      content: [{
        type: "text" as const,
        text: [
          `--- HUMAN INPUT NEEDED ---`,
          ``,
          `Type: ${params.requestType.replace(/_/g, " ").toUpperCase()}`,
          `Context: ${params.context}`,
          ``,
          `${params.question}`,
          ``,
          ...(params.options ? [`Options:`, ...params.options.map((o, i) => `  ${i + 1}. ${o}`), ``] : []),
          `Please respond with your choice or provide the requested input.`,
          `Request logged to: ${requestFile}`,
        ].join("\n"),
      }],
    };
  }
);

// ─── Season Planning ─────────────────────────────────────────────

server.tool(
  "tbr_season_status",
  "Get the current state of all content: storyboards, posts, videos, and their statuses. Use this to assess where you are in the content cycle.",
  {},
  async () => {
    const [storyboards, posts, videos, mediaStats] = await Promise.all([
      prisma.storyboard.findMany({
        include: { _count: { select: { scenes: true, posts: true, videoProjects: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.videoProject.findMany({
        include: { _count: { select: { clips: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.mediaFile.groupBy({
        by: ["fileType"],
        _count: true,
      }),
    ]);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          mediaLibrary: Object.fromEntries(mediaStats.map((m) => [m.fileType, m._count])),
          storyboards: storyboards.map((s) => ({
            id: s.id,
            title: s.title,
            format: s.format,
            status: s.status,
            aiIntensity: s.aiIntensity,
            tone: s.tone,
            scenes: s._count.scenes,
            posts: s._count.posts,
            videos: s._count.videoProjects,
          })),
          posts: posts.map((p) => ({
            id: p.id,
            title: p.title,
            postType: p.postType,
            platform: p.platform,
            status: p.status,
          })),
          videos: videos.map((v) => ({
            id: v.id,
            title: v.title,
            format: v.format,
            status: v.status,
            clips: v._count.clips,
          })),
        }, null, 2),
      }],
    };
  }
);

// ─── Episode & Season Tools ─────────────────────────────────────

server.tool(
  "tbr_episode_list",
  "List all episodes with their status, narrative, and content piece counts",
  {},
  async () => {
    const episodes = await prisma.episode.findMany({
      include: {
        narrative: true,
        race: true,
        _count: { select: { storyboards: true, posts: true, videoProjects: true } },
      },
      orderBy: { number: "asc" },
    });

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(episodes.map((ep) => ({
          id: ep.id,
          number: ep.number,
          title: ep.title,
          theme: ep.theme,
          status: ep.status,
          narrative: ep.narrative?.key,
          narrativeLabel: ep.narrative?.label,
          raceRound: ep.race?.round,
          raceTitle: ep.race?.title,
          startDate: ep.startDate?.toISOString().split("T")[0],
          endDate: ep.endDate?.toISOString().split("T")[0],
          targetPieces: ep.targetPieces,
          contentPieces: ep._count.storyboards + ep._count.posts + ep._count.videoProjects,
          storyboards: ep._count.storyboards,
          posts: ep._count.posts,
          videos: ep._count.videoProjects,
        })), null, 2),
      }],
    };
  }
);

server.tool(
  "tbr_episode_update",
  "Update an episode's status or target pieces",
  {
    episodeId: z.string().describe("Episode ID"),
    status: z.enum(["PLANNED", "ACTIVE", "IN_PROGRESS", "COMPLETED"]).optional().describe("New status"),
    targetPieces: z.number().optional().describe("Update target number of content pieces"),
    theme: z.string().optional().describe("Update episode theme"),
  },
  async (params) => {
    const data: Record<string, unknown> = {};
    if (params.status) data.status = params.status;
    if (params.targetPieces) data.targetPieces = params.targetPieces;
    if (params.theme) data.theme = params.theme;

    const ep = await prisma.episode.update({
      where: { id: params.episodeId },
      data,
      include: { narrative: true },
    });

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          id: ep.id,
          number: ep.number,
          title: ep.title,
          status: ep.status,
          targetPieces: ep.targetPieces,
          message: "Episode updated",
        }),
      }],
    };
  }
);

server.tool(
  "tbr_race_update",
  "Update a race status or result",
  {
    round: z.number().describe("Race round number"),
    status: z.enum(["upcoming", "live", "completed"]).optional(),
    result: z.string().optional().describe("JSON string with race results (position, points, notes)"),
  },
  async (params) => {
    const data: Record<string, unknown> = {};
    if (params.status) data.status = params.status;
    if (params.result) data.result = params.result;

    const race = await prisma.race.update({
      where: { round: params.round },
      data,
    });

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          round: race.round,
          title: race.title,
          status: race.status,
          message: "Race updated",
        }),
      }],
    };
  }
);

// ─── Start Server ────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TBR Studio MCP server running on stdio");
}

main().catch(console.error);

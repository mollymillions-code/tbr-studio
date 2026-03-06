#!/usr/bin/env tsx
/**
 * CLI render script for TBR Studio.
 *
 * Usage:
 *   npx tsx src/render.ts --spec /path/to/composition-spec.json
 *
 * The MCP tool writes a CompositionSpec JSON file, then calls this script.
 * This script reads the spec and calls Remotion's render API.
 */

import * as fs from "fs";
import * as path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { CompositionSpec } from "./types.js";

async function main() {
  const specFlag = process.argv.indexOf("--spec");
  if (specFlag === -1 || !process.argv[specFlag + 1]) {
    console.error("Usage: npx tsx src/render.ts --spec <path-to-spec.json>");
    process.exit(1);
  }

  const specPath = path.resolve(process.argv[specFlag + 1]);
  const spec: CompositionSpec = JSON.parse(fs.readFileSync(specPath, "utf-8"));

  console.log(`[TBR Render] Project: ${spec.title}`);
  console.log(`[TBR Render] Clips: ${spec.clips.length}`);
  console.log(`[TBR Render] Resolution: ${spec.width}x${spec.height} @ ${spec.fps}fps`);
  console.log(`[TBR Render] Output: ${spec.outputPath}`);

  // Calculate total duration
  const totalDuration = spec.clips.reduce((sum, c) => sum + c.duration, 0);
  const totalFrames = Math.round(totalDuration * spec.fps);
  console.log(`[TBR Render] Duration: ${totalDuration}s (${totalFrames} frames)`);

  // Ensure output directory exists
  const outputDir = path.dirname(spec.outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Bundle the Remotion project
  console.log("[TBR Render] Bundling...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve(import.meta.dirname, "index.ts"),
    onProgress: (progress) => {
      if (progress === 100) console.log("[TBR Render] Bundle complete.");
    },
  });

  // Select the composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "TBRVideo",
    inputProps: { spec },
  });

  // Override composition settings from spec
  composition.width = spec.width;
  composition.height = spec.height;
  composition.fps = spec.fps;
  composition.durationInFrames = totalFrames;

  // Render
  console.log("[TBR Render] Rendering...");
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: spec.outputPath,
    inputProps: { spec },
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) {
        process.stdout.write(`\r[TBR Render] Progress: ${pct}%`);
      }
    },
  });

  console.log(`\n[TBR Render] Done. Output: ${spec.outputPath}`);
}

main().catch((err) => {
  console.error("[TBR Render] Error:", err);
  process.exit(1);
});

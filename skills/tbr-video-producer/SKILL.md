# TBR Video Producer

Assemble and render short-form videos for Team Blue Rising using Remotion.

## When to Activate

- Assembling clips into a video from a storyboard
- The TBR Director skill hands off video production
- User asks to "create a video", "assemble clips", "render a reel"
- A storyboard is approved and ready for video production

## Video Formats

| Format | Dimensions | Duration | FPS | Platform |
|--------|-----------|----------|-----|----------|
| Reel | 1080x1920 | 15-90s | 30 | Instagram, TikTok |
| Short | 1080x1920 | 15-60s | 30 | YouTube Shorts |
| Story | 1080x1920 | 5-15s | 30 | Instagram Stories |
| Highlight | 1920x1080 | 30-180s | 30 | YouTube, LinkedIn |

## Video Assembly Workflow

### Step 1: Read the Storyboard

Every video starts from a storyboard. Read:
- Scene order, descriptions, durations
- Voiceover text for each scene
- Text overlay directives
- Transition types between scenes
- Source type per scene (real, ai, mixed)
- AI intensity level

### Step 2: Source Clips

For each scene in the storyboard:

1. **Search media library** by tags, event, source type.
2. **Match the visual direction** from the storyboard scene's visualNotes.
3. **Log the clip assignment** in the video project.

```bash
npx tsx scripts/db-writer.ts add-clip \
  --videoProjectId "<vp-id>" \
  --order 1 \
  --mediaFileId "<media-file-id>" \
  --label "Scene 1: Dawn in Monaco" \
  --trimStart "12.5" \
  --trimEnd "15.5" \
  --effect "ken_burns" \
  --voiceoverText "Nobody gave us a chance in Monaco." \
  --textOverlay ""
```

If no real footage exists and AI intensity allows:
```bash
npx tsx scripts/db-writer.ts add-clip \
  --videoProjectId "<vp-id>" \
  --order 3 \
  --label "Scene 3: Generated B-roll" \
  --aiGenerated true \
  --aiPrompt "Electric powerboat racing through Monaco harbor, cinematic drone shot, golden hour, spray on water" \
  --aiModel "veo3" \
  --effect "none"
```

### Step 3: Generate Voiceover

For clips with voiceoverText, generate audio using ElevenLabs:

```bash
# Via the TBR Studio MCP
# Tool: tbr_elevenlabs_voiceover
# Input: text, voice_id, output_path
```

Voice selection:
- **Narration (neutral):** Deep, authoritative male voice. Documentary tone.
- **Masha-focused:** Female voice, warm, determined.
- **Hype content:** Energetic, faster pace, building intensity.
- **Reflective:** Slower, measured, emotional weight.

### Step 4: Music Selection

Options in priority order:
1. **Human provides a track** — always preferred.
2. **Select from library** — check audio files in media library.
3. **Generate via AI** — ElevenLabs sound effects or AI music generation.
4. **No music** — voiceover + ambient sound only. Valid choice for documentary tone.

Always ask the human before generating music.

### Step 5: Remotion Composition

The video is rendered programmatically using Remotion via MCP.

Composition structure for a typical TBR reel:
```
[Fade in]
Scene 1: 2-3s — Hook shot (real footage, ken burns on photo, or bold text)
[Cut]
Scene 2: 4-6s — Context (B-roll, voiceover begins)
[Cut]
Scene 3: 6-8s — Core content (race footage, behind-the-scenes, key moment)
[Dissolve]
Scene 4: 4-6s — Emotional beat (celebration, determination, team moment)
[Fade]
Scene 5: 3s — CTA card (TBR logo, text overlay, URL)
[Fade out]
```

### Transition Types
- **cut** — Direct cut. Fast, energetic. Default for race footage.
- **fade** — 0.5s crossfade. Opening and closing scenes.
- **dissolve** — 1s dissolve. Emotional transitions, time passage.
- **none** — Hard cut, no transition.

### Text Overlay Specifications
- Font: Clean sans-serif (Inter or similar)
- Color: White (#FFFFFF) with semi-transparent dark backing (rgba(0,0,0,0.6))
- Position: Bottom-third for subtitles, center for key statements
- Animation: Fade in over 10 frames, hold, fade out over 10 frames
- Max words: 8 per overlay

### Step 6: Render

Trigger Remotion render via MCP:
```
Tool: tbr_remotion_render
Input: {
  videoProjectId: "<id>",
  compositionId: "TBRReel",
  outputPath: "/assets/videos/<id>/v1.mp4",
  width: 1080,
  height: 1920,
  fps: 30
}
```

### Step 7: Review Cycle

Present the rendered video for review:
```
"Video ready for review:
Title: <title>
Duration: <duration>s
Format: <format>
Clips: <count>
AI clips: <count> (AI intensity: <n>/10)
Output: <path>

Review in dashboard at /videos/<id>.
Provide feedback and I will iterate."
```

Process feedback:
- Timing changes: adjust trim points, re-render
- Scene replacement: swap clips, re-render
- Audio changes: regenerate voiceover or swap music
- Each iteration creates a new version (v2.mp4, v3.mp4)

## Effects Reference

| Effect | Use For | Notes |
|--------|---------|-------|
| ken_burns | Still photos as video scenes | Slow zoom + pan, 2-5s |
| slow_mo | Impact moments, celebrations | 50% speed, smooth |
| speed_ramp | Race footage transitions | Normal → fast → normal |
| none | Standard footage | No modification |

## Quality Checklist

- [ ] Hook in first 3 seconds
- [ ] Audio levels balanced (voiceover clear over music)
- [ ] Text overlays readable (contrast, size, duration)
- [ ] Transitions feel natural (not jarring)
- [ ] Duration matches platform spec
- [ ] CTA visible for 3+ seconds at end
- [ ] No AI artifacts visible (if AI clips used)
- [ ] Brand consistency (colors, tone, logo placement)
- [ ] Rendered at correct resolution and FPS

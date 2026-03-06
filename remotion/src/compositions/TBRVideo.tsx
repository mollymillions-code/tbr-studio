import { AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame } from "remotion";
import type { CompositionSpec } from "../types.js";
import { ClipScene } from "../components/ClipScene.js";

/**
 * Main TBR video composition.
 * Reads a CompositionSpec and renders clips in sequence with transitions.
 */
export const TBRVideo: React.FC<{ spec: CompositionSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { clips, fps, musicPath, musicVolume = 0.3 } = spec;

  // Calculate frame offsets for each clip
  const TRANSITION_FRAMES = 15; // ~0.5s at 30fps
  let currentFrame = 0;
  const clipFrames = clips.map((clip) => {
    const durationInFrames = Math.round(clip.duration * fps);
    const start = currentFrame;
    currentFrame += durationInFrames;
    // Subtract overlap for dissolve/fade transitions (except last clip)
    if (clip.transition === "fade" || clip.transition === "dissolve") {
      currentFrame -= TRANSITION_FRAMES;
    }
    return { clip, start, durationInFrames };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1628" }}>
      {/* Clip sequences */}
      {clipFrames.map(({ clip, start, durationInFrames }, idx) => {
        const transition = clip.transition ?? "cut";
        const isLast = idx === clipFrames.length - 1;

        // Calculate opacity for fade/dissolve transitions
        let opacity = 1;
        if (transition === "fade" || transition === "dissolve") {
          if (!isLast) {
            // Fade out at the end of this clip
            opacity = interpolate(
              frame,
              [
                start + durationInFrames - TRANSITION_FRAMES,
                start + durationInFrames,
              ],
              [1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
          }
        }

        // First clip: fade in
        if (idx === 0) {
          const fadeIn = interpolate(frame, [0, TRANSITION_FRAMES], [0, 1], {
            extrapolateRight: "clamp",
          });
          opacity = Math.min(opacity, fadeIn);
        }

        return (
          <Sequence
            key={clip.order}
            from={start}
            durationInFrames={durationInFrames}
          >
            <AbsoluteFill style={{ opacity }}>
              <ClipScene
                clip={clip}
                durationInFrames={durationInFrames}
                fps={fps}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Background music */}
      {musicPath && (
        <Audio src={musicPath} volume={musicVolume} />
      )}

      {/* Voiceover audio for each clip */}
      {clipFrames.map(({ clip, start, durationInFrames }) =>
        clip.voiceoverPath ? (
          <Sequence
            key={`vo-${clip.order}`}
            from={start}
            durationInFrames={durationInFrames}
          >
            <Audio src={clip.voiceoverPath} volume={0.9} />
          </Sequence>
        ) : null
      )}
    </AbsoluteFill>
  );
};

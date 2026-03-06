import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  useCurrentFrame,
} from "remotion";
import type { ClipSpec } from "../types.js";
import { TextOverlay } from "./TextOverlay.js";

interface ClipSceneProps {
  clip: ClipSpec;
  durationInFrames: number;
  fps: number;
}

export const ClipScene: React.FC<ClipSceneProps> = ({
  clip,
  durationInFrames,
  fps,
}) => {
  const frame = useCurrentFrame();
  const isImage = clip.mediaPath?.match(/\.(png|jpe?g|webp|gif|bmp)$/i);
  const isVideo = clip.mediaPath?.match(/\.(mp4|mov|webm|avi|mkv)$/i);

  // Ken Burns effect for images
  const kenBurnsScale =
    clip.effect === "ken_burns"
      ? interpolate(frame, [0, durationInFrames], [1, 1.15], {
          extrapolateRight: "clamp",
        })
      : 1;

  const kenBurnsX =
    clip.effect === "ken_burns"
      ? interpolate(frame, [0, durationInFrames], [0, -3], {
          extrapolateRight: "clamp",
        })
      : 0;

  // Slow-mo handled at trim level (playback rate)
  const playbackRate = clip.effect === "slow_mo" ? 0.5 : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1628" }}>
      {/* Media layer */}
      {clip.mediaPath && isVideo && (
        <OffthreadVideo
          src={clip.mediaPath}
          startFrom={clip.trimStart ? Math.round(clip.trimStart * fps) : 0}
          endAt={clip.trimEnd ? Math.round(clip.trimEnd * fps) : undefined}
          playbackRate={playbackRate}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {clip.mediaPath && isImage && (
        <Img
          src={clip.mediaPath}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${kenBurnsScale}) translateX(${kenBurnsX}%)`,
          }}
        />
      )}

      {/* Fallback: no media (placeholder) */}
      {!clip.mediaPath && (
        <AbsoluteFill
          style={{
            backgroundColor: "#0a1628",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "#334155",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 24,
            }}
          >
            {clip.label}
          </div>
        </AbsoluteFill>
      )}

      {/* Text overlay */}
      {clip.textOverlay && (
        <TextOverlay
          text={clip.textOverlay}
          position={clip.textPosition ?? "bottom-third"}
          durationInFrames={durationInFrames}
        />
      )}
    </AbsoluteFill>
  );
};

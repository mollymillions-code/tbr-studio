import { interpolate, useCurrentFrame } from "remotion";

interface TextOverlayProps {
  text: string;
  position: "bottom-third" | "center" | "top";
  durationInFrames: number;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  position,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Fade in over 10 frames, hold, fade out over 10 frames
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const positionStyle: React.CSSProperties =
    position === "bottom-third"
      ? { bottom: "15%", left: "50%", transform: "translateX(-50%)" }
      : position === "top"
        ? { top: "10%", left: "50%", transform: "translateX(-50%)" }
        : {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          };

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyle,
        opacity,
        zIndex: 10,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "#FFFFFF",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 42,
          fontWeight: 600,
          padding: "12px 24px",
          borderRadius: 8,
          textAlign: "center",
          maxWidth: "80%",
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </div>
  );
};

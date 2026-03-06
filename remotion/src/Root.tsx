import { Composition } from "remotion";
import { TBRVideo } from "./compositions/TBRVideo.js";
import type { CompositionSpec } from "./types.js";

/**
 * Default spec for Remotion Studio preview.
 * When rendering from the CLI, the spec is injected via inputProps.
 */
const defaultSpec: CompositionSpec = {
  projectId: "preview",
  title: "TBR Preview",
  width: 1080,
  height: 1920,
  fps: 30,
  clips: [
    {
      order: 1,
      label: "Scene 1: Hook",
      duration: 3,
      textOverlay: "Team Blue Rising",
      textPosition: "center",
      transition: "fade",
    },
    {
      order: 2,
      label: "Scene 2: The Story",
      duration: 5,
      textOverlay: "Electric Powerboat Racing",
      textPosition: "bottom-third",
      transition: "dissolve",
    },
    {
      order: 3,
      label: "Scene 3: CTA",
      duration: 3,
      textOverlay: "Follow the journey",
      textPosition: "center",
      transition: "fade",
    },
  ],
  outputPath: "out/preview.mp4",
};

export const RemotionRoot: React.FC = () => {
  // Calculate total duration from clips
  const totalDuration = defaultSpec.clips.reduce(
    (sum, c) => sum + c.duration,
    0
  );

  return (
    <Composition
      id="TBRVideo"
      component={TBRVideo}
      durationInFrames={Math.round(totalDuration * defaultSpec.fps)}
      fps={defaultSpec.fps}
      width={defaultSpec.width}
      height={defaultSpec.height}
      defaultProps={{ spec: defaultSpec }}
    />
  );
};

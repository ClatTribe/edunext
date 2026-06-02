// @ts-nocheck
import { Composition, registerRoot } from 'remotion';
import { ReelComposition } from './ReelComposition';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={ReelComposition}
        calculateMetadata={({ props }) => {
          const durationInSeconds = props.audioDurationInSeconds || 30;
          return {
            durationInFrames: Math.ceil(durationInSeconds * 30) + 15, // +15 frames padding
            props,
          };
        }}
        durationInFrames={900} // fallback
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          text: "Welcome to EduNext Magazine.",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          audioDurationInSeconds: 30,
          imageKeywords: ["education", "study", "books"]
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);

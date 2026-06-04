// @ts-nocheck
// src/remotion/index.tsx
import { Composition, registerRoot } from 'remotion';
import { ReelComposition } from './ReelComposition';
import { SceneComposition } from './SceneComposition';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="SceneReel"
        component={SceneComposition}
        calculateMetadata={({ props }) => {
          const durationInSeconds = props.audioDurationInSeconds || 30;
          return { durationInFrames: Math.max(30, Math.floor(durationInSeconds * 30)), props };
        }}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: [],
          imageUrls: [],
          sceneDurations: [],
          audioRelPath: '',
          audioDurationInSeconds: 30,
        }}
      />
      <Composition
        id="Reel"
        component={ReelComposition}
        calculateMetadata={({ props }) => {
          const durationInSeconds = props.audioDurationInSeconds || 30;
          return {
            durationInFrames: Math.floor(durationInSeconds * 30), // Exact match, no padding to prevent out-of-bounds crash
            props,
          };
        }}
        durationInFrames={900} // fallback
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          text: 'Welcome to EduNext Magazine.',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          audioDurationInSeconds: 30,
          imageKeywords: ['education', 'study', 'books'],
          imageUrls: [],
          faceVideoUrl: '',
          quoteText: '',
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);

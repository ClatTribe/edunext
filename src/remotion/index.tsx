import { Composition, registerRoot } from 'remotion';
import { ReelComposition } from './ReelComposition';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={ReelComposition}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          text: "Welcome to EduNext Magazine.",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);

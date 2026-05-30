import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';

export const ReelComposition: React.FC<{ text: string; audioUrl: string }> = ({ text, audioUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split text into words for pop-up animation
  const words = text.split(' ');

  // Gradient animation
  const progress = interpolate(frame, [0, 900], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ 
      background: 'linear-gradient(' + progress + 'deg, #0a0f24, #1e1b4b)', 
      color: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '100px',
      fontFamily: 'sans-serif'
    }}>
      <Audio src={audioUrl} />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          {words.map((word, i) => {
            // Simple logic: show 2 words per second (15 frames per word)
            const delay = i * 15;
            const scale = spring({
              fps,
              frame: frame - delay,
              config: { damping: 12 },
            });
            const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  fontSize: '80px',
                  fontWeight: 'bold',
                  transform: 'scale(' + scale + ')',
                  opacity,
                  textShadow: '0px 4px 20px rgba(0,0,0,0.5)',
                  color: i % 3 === 0 ? '#fbbf24' : '#ffffff' // highlight every 3rd word
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Logo watermark */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', padding: '60px' }}>
        <h1 style={{ fontSize: '50px', color: '#4f46e5', fontWeight: 900 }}>EduNext</h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

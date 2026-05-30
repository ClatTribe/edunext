// @ts-nocheck
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';

export const ReelComposition: React.FC<{ text: string; audioUrl: string; logoDataUri?: string; bgmUrl?: string; dataPoints?: any[] }> = ({ text, audioUrl, logoDataUri, bgmUrl, dataPoints }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtitle Engine: Split text into chunks of 4 words
  const words = text.split(' ');
  const chunkSize = 4;
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }

  // Assume 150 WPM -> 2.5 words/sec -> 1 word = 12 frames (at 30fps)
  const framesPerWord = 12;
  const chunkDuration = chunkSize * framesPerWord;

  // Ken Burns zoom effect
  const scaleImage = interpolate(frame, [0, 900], [1, 1.2], { extrapolateRight: 'clamp' });

  // Data Graph Animation
  const showGraph = dataPoints && dataPoints.length > 0;
  const graphProgress = spring({
    fps,
    frame: frame - 60, // Delay graph entry
    config: { damping: 14, stiffness: 50 },
  });

  // Multi-Template Backgrounds
  const bgImages = [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1080&auto=format&fit=crop"
  ];
  const framesPerBg = fps * 5; // Change background every 5 seconds
  const currentBgIndex = Math.floor(frame / framesPerBg) % bgImages.length;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* Background Images Array (only show the active one) */}
      <AbsoluteFill style={{ opacity: 0.35 }}>
        {bgImages.map((imgSrc, idx) => {
          const isActive = idx === currentBgIndex;
          if (!isActive) return null; // Unmount inactive to save memory, or keep them with opacity 0 for fading
          return (
            <AbsoluteFill key={idx}>
              <Img 
                src={imgSrc} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scaleImage})` }} 
              />
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>
      
      {/* Dark overlay for readability */}
      <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.4) 100%)' }} />

      {/* Main TTS Audio */}
      <Audio src={audioUrl} />
      {/* Background Music (Lo-Fi/Ambient) */}
      {bgmUrl && <Audio src={bgmUrl} volume={0.15} />}

      {/* Animated Graph (if data is present) */}
      {showGraph && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: '300px' }}>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end', height: '300px', transform: `scale(${graphProgress})` }}>
            {dataPoints.map((dp, idx) => {
              const barHeight = Math.min((dp.value / 100) * 300, 300); // normalized height
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '80px', 
                    height: `${barHeight}px`, 
                    backgroundColor: idx === 0 ? '#4f46e5' : '#fef08a',
                    borderRadius: '16px 16px 0 0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }} />
                  <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{dp.label}</span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
      
      {/* Dynamic Subtitles (Hormozi Style) */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '60px', marginTop: showGraph ? '250px' : '0px' }}>
        {chunks.map((chunkWords, chunkIndex) => {
          const startFrame = chunkIndex * chunkDuration;
          const endFrame = startFrame + chunkDuration;

          if (frame < startFrame || frame >= endFrame) return null;

          // Chunk entry animation
          const chunkScale = spring({ fps, frame: frame - startFrame, config: { damping: 12 } });

          return (
            <div key={chunkIndex} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', transform: `scale(${chunkScale})` }}>
              {chunkWords.map((word, wordIndex) => {
                // Determine if this specific word is currently being spoken
                const wordStartFrame = startFrame + (wordIndex * framesPerWord);
                const isSpoken = frame >= wordStartFrame && frame < (wordStartFrame + framesPerWord);
                
                // Highlight important keywords regardless of spoken status (simulated AI highlight)
                const isImportant = word.length > 5 || ['JEE', 'NEET', 'Cutoff', 'Percent'].includes(word);
                
                let color = '#ffffff';
                if (isSpoken) color = '#fef08a'; // Yellow when spoken
                else if (isImportant) color = '#818cf8'; // Purple for important keywords

                // Word pop animation when spoken
                const wordScale = isSpoken ? spring({ fps, frame: frame - wordStartFrame, config: { damping: 10, stiffness: 200 } }) : 1;

                return (
                  <span key={wordIndex} style={{
                    fontSize: '90px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: color,
                    transform: `scale(${isSpoken ? wordScale : 1})`,
                    textShadow: '0px 8px 25px rgba(0,0,0,0.9)',
                    display: 'inline-block'
                  }}>
                    {word}
                  </span>
                );
              })}
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Top Right Logo */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'flex-end', padding: '60px' }}>
        {logoDataUri ? (
          <Img src={logoDataUri} style={{ width: '150px', height: 'auto', opacity: 0.9 }} />
        ) : (
          <h1 style={{ fontSize: '50px', color: '#818cf8', fontWeight: 900 }}>EduNext.</h1>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

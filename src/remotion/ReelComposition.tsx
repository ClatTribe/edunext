// @ts-nocheck
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from 'remotion';

export const ReelComposition: React.FC<{ text: string; audioUrl: string; audioDurationInSeconds?: number; imageKeywords?: string[]; logoDataUri?: string; bgmUrl?: string; dataPoints?: any[] }> = ({ text, audioUrl, audioDurationInSeconds = 30, imageKeywords = ['education', 'student', 'exam'], logoDataUri, bgmUrl, dataPoints }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Subtitle Sync Engine ---
  const words = text.split(' ');
  const chunkSize = 3;
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }
  const totalFrames = audioDurationInSeconds * fps;
  const framesPerWord = totalFrames / words.length;
  const chunkDuration = chunkSize * framesPerWord;

  // --- Template Selector ---
  // Hash text to pick template (0: Images, 1: Grid, 2: Blobs)
  const templateType = text.length % 3;

  // Template 0 logic
  const premiumImages = [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1080&auto=format&fit=crop"
  ];
  const framesPerBg = fps * 4;
  const currentBgIndex = Math.floor(frame / framesPerBg) % premiumImages.length;

  // --- Prop Animations ---
  // Graph (Frames 30 to 300)
  const showGraph = dataPoints && dataPoints.length > 0;
  const graphEntry = spring({ fps, frame: frame - 30, config: { damping: 14, stiffness: 50 } });
  const graphOpacity = interpolate(frame, [280, 310], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Quote Card (Frames 350 to 600)
  const quoteEntry = spring({ fps, frame: frame - 350, config: { damping: 12, stiffness: 60 } });
  const quoteOpacity = interpolate(frame, [570, 600], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Checklist (Frames 650 to 900)
  const checkEntry = spring({ fps, frame: frame - 650, config: { damping: 12, stiffness: 60 } });
  const checkOpacity = interpolate(frame, [870, 900], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* ALWAYS SHOW BACKGROUND IMAGES (Low Opacity) */}
      <AbsoluteFill style={{ opacity: 0.35 }}>
        {premiumImages.map((imgSrc, idx) => {
          const isActive = idx === currentBgIndex;
          if (!isActive) return null; 
          const localFrame = frame % framesPerBg;
          const scaleImage = interpolate(localFrame, [0, framesPerBg], [1, 1.15], { extrapolateRight: 'clamp' });
          return (
            <AbsoluteFill key={idx}>
              <Img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scaleImage})` }} />
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>

      {/* TEMPLATE OVERLAYS (Grid or Blobs on top of images) */}
      {templateType === 1 && (
        <AbsoluteFill style={{ 
          backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 2px, transparent 2px)`, 
          backgroundSize: '100px 100px',
          transform: `translateY(${frame * 1.5}px)`,
          opacity: 0.7
        }} />
      )}

      {templateType === 2 && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '1400px', height: '1400px', background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 60%)', top: '-300px', left: '-300px', transform: `rotate(${frame * 0.3}deg)`, filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', width: '1600px', height: '1600px', background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 60%)', bottom: '-500px', right: '-400px', transform: `rotate(-${frame * 0.4}deg)`, filter: 'blur(80px)' }} />
        </AbsoluteFill>
      )}
      
      {/* Dark vignette overlay for readability */}
      <AbsoluteFill style={{ background: 'radial-gradient(circle, transparent 20%, rgba(15,23,42,0.85) 120%)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.1) 100%)' }} />

      {/* Main TTS Audio */}
      <Audio src={audioUrl} />
      {/* Background Music */}
      {bgmUrl && <Audio src={bgmUrl} volume={0.15} />}

      {/* TOP 65% ZONE: PROPS & GRAPHS */}
      <AbsoluteFill style={{ height: '65%', top: 0, justifyContent: 'center', alignItems: 'center' }}>
        
        {/* GRAPH PROP (0 to 10s) */}
        {showGraph && frame < 310 && (
          <div style={{ 
            opacity: graphOpacity, transform: `scale(${graphEntry})`,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(30px)', 
            borderRadius: '40px', padding: '50px 70px', 
            border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '35px'
          }}>
            <h2 style={{ margin: 0, fontSize: '38px', fontWeight: 900, color: '#f8fafc', letterSpacing: '3px', textTransform: 'uppercase' }}>Data Insights</h2>
            <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-end', height: '320px' }}>
              {dataPoints.map((dp, idx) => {
                const targetHeight = Math.max(50, Math.min((dp.value / 100) * 200, 200));
                const barGrowth = spring({ fps, frame: frame - (45 + idx * 10), config: { damping: 12, stiffness: 60 } });
                const currentHeight = targetHeight * barGrowth;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '45px', fontWeight: 900, color: '#ffffff', opacity: barGrowth, transform: `translateY(${10 - (10 * barGrowth)}px)` }}>{dp.value}%</div>
                    <div style={{ 
                      width: '90px', height: `${currentHeight}px`, 
                      background: idx === 0 ? 'linear-gradient(to top, #4f46e5, #818cf8)' : 'linear-gradient(to top, #0284c7, #38bdf8)',
                      borderRadius: '20px 20px 0 0', boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                      borderTop: '2px solid rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)'
                    }} />
                    <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', maxWidth: '140px', textAlign: 'center', lineHeight: '1.3' }}>{dp.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QUOTE CARD PROP (11s to 20s) */}
        {frame >= 350 && frame < 600 && (
          <div style={{ 
            opacity: quoteOpacity, transform: `scale(${quoteEntry}) translateY(${(1 - quoteEntry) * 100}px)`,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', backdropFilter: 'blur(40px)', 
            borderRadius: '40px', padding: '70px', width: '80%', maxWidth: '850px',
            border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-40px', left: '20px', fontSize: '250px', color: 'rgba(255,255,255,0.05)', fontWeight: 900, lineHeight: 1 }}>"</div>
            <h2 style={{ fontSize: '32px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '30px' }}>Key Takeaway</h2>
            <p style={{ fontSize: '50px', fontWeight: 800, color: '#ffffff', lineHeight: '1.4', margin: 0, textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
              Mastering <span style={{ color: '#38bdf8' }}>deep concepts</span> always beats chasing ranks blindly.
            </p>
          </div>
        )}

        {/* CHECKLIST PROP (21s to 30s) */}
        {frame >= 650 && frame < 900 && (
          <div style={{ 
            opacity: checkOpacity, transform: `scale(${checkEntry}) translateX(${(1 - checkEntry) * -100}px)`,
            background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(30px)', 
            borderRadius: '40px', padding: '60px 80px', width: '80%', maxWidth: '850px',
            border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#f8fafc', letterSpacing: '2px', marginBottom: '50px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>YOUR BLUEPRINT</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
              {[
                { icon: '🧠', text: 'Active Self-Testing' },
                { icon: '🎯', text: 'Target Weak Areas' },
                { icon: '🛡️', text: 'Mental Endurance' }
              ].map((item, idx) => {
                const itemScale = spring({ fps, frame: frame - (680 + idx * 20), config: { damping: 10, stiffness: 80 } });
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '25px', opacity: itemScale, transform: `translateX(${(1 - itemScale) * -50}px)` }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(to right, #4f46e5, #38bdf8)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '35px', boxShadow: '0 10px 20px rgba(56, 189, 248, 0.4)' }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '42px', fontWeight: 800, color: '#e2e8f0' }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AbsoluteFill>

      {/* BOTTOM 35% ZONE: SUBTITLES (Shifted up slightly for Instagram UI) */}
      <AbsoluteFill style={{ height: '35%', bottom: '12%', top: 'auto', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        {chunks.map((chunkWords, chunkIndex) => {
          const startFrame = chunkIndex * chunkDuration;
          const endFrame = startFrame + chunkDuration;

          if (frame < startFrame || frame >= endFrame) return null;

          const chunkScale = spring({ fps, frame: frame - startFrame, config: { damping: 12, stiffness: 150 } });

          return (
            <div key={chunkIndex} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '25px', transform: `scale(${chunkScale})` }}>
              {chunkWords.map((word, wordIndex) => {
                const wordStartFrame = startFrame + (wordIndex * framesPerWord);
                const isSpoken = frame >= wordStartFrame && frame < (wordStartFrame + framesPerWord);
                const isImportant = word.length > 5 || ['JEE', 'NEET', 'Cutoff', 'Percent', 'IPMAT'].includes(word);
                
                let color = '#ffffff'; // Base White
                if (isSpoken) color = '#f97316'; // Vivid Orange when spoken
                else if (isImportant) color = '#fef08a'; // Yellow for important words

                const wordScale = isSpoken ? spring({ fps, frame: frame - wordStartFrame, config: { damping: 10, stiffness: 200 } }) : 1;

                return (
                  <span key={wordIndex} style={{
                    fontSize: '90px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: color,
                    transform: `scale(${isSpoken ? wordScale : 1})`,
                    textShadow: '8px 8px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 2px 2px 0px #000',
                    WebkitTextStroke: '3px black',
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

      {/* REAL EDUNEXT LOGO WATERMARK (TOP LEFT) */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'flex-start', padding: '60px' }}>
        <Img src={staticFile('whitelogo.svg')} style={{ width: '450px', height: 'auto', opacity: 0.9, filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' }} />
      </AbsoluteFill>

    </AbsoluteFill>
  );
};

// @ts-nocheck
// src/remotion/ReelComposition.tsx
//
// ENHANCED next-level template.
//  - TEMPLATE mode (faceless): rotating dynamic images (passed via imageUrls) +
//    Ken-Burns zoom + animated widgets (graph / quote / checklist) + karaoke captions.
//  - FACE mode (Tavus day): the Tavus talking-head video sits in a rounded card on top,
//    and a branded panel below still shows the rotating widgets + captions.
// Widget timings are now RELATIVE to the real duration, so they fit any length (25-35s).

import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Video,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  staticFile,
} from 'remotion';

// ===================================================================
// UGC BRAND COMPONENTS — replicated from the reference edit, rethemed
// to EduNext's sky/indigo palette (white pills + #38bdf8 / #818cf8).
// ===================================================================
const U = {
  accent: '#38bdf8',   // sky (primary, was their RED)
  accent2: '#6366f1',  // indigo (secondary, was their GOLD)
  dark: '#0f172a',
  white: '#ffffff',
  font: "'Montserrat','Inter',Helvetica,Arial,sans-serif",
};

const UHandle: React.FC = () => (
  <div style={{ position: 'absolute', top: 70, left: 60, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.92 }}>
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: U.accent2, boxShadow: '0 0 0 4px rgba(255,255,255,0.35)' }} />
    <span style={{ fontFamily: U.font, fontWeight: 700, fontSize: 40, color: U.white, textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>@getedunext</span>
  </div>
);

const UItem: React.FC<{ label: string; appearFrame: number }> = ({ label, appearFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < appearFrame) return null;
  const local = frame - appearFrame;
  const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 160, mass: 0.7 } });
  const x = interpolate(enter, [0, 1], [-60, 0]);
  const opacity = interpolate(local, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
  const checkScale = spring({ frame: local - 4, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, transform: `translateX(${x}px)`, opacity, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '12px 24px 12px 14px', boxShadow: '0 10px 24px rgba(0,0,0,0.26)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: U.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${Math.min(checkScale, 1)})`, flexShrink: 0 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 6.5" stroke={U.white} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <span style={{ fontFamily: U.font, fontWeight: 700, fontSize: 32, color: U.dark, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
};

// Pills accumulate top-left and STAY for the whole clip (reference style).
const UChecklist: React.FC<{ a: number; b: number; c: number }> = ({ a, b, c }) => {
  return (
    <div style={{ position: 'absolute', top: 150, left: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
      <UItem label="10,000+ colleges" appearFrame={a} />
      <UItem label="Real NIRF data" appearFrame={b} />
      <UItem label="Verified reviews" appearFrame={c} />
    </div>
  );
};

const UCounter: React.FC<{ fromFrame: number }> = ({ fromFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hideAt = fromFrame + 78;
  if (frame < fromFrame || frame > hideAt) return null;
  const local = frame - fromFrame;
  const enter = spring({ frame: local, fps, config: { damping: 13, stiffness: 150, mass: 0.7 } });
  const out = interpolate(frame, [hideAt - 8, hideAt], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = interpolate(enter, [0, 1], [0.7, 1]);
  const opacity = Math.min(interpolate(local, [0, 5], [0, 1]), 1) * out;
  const count = Math.round(interpolate(local, [0, 28], [0, 10000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const bars = [0.45, 0.72, 1.0];
  return (
    <div style={{ position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity }}>
      <div style={{ transform: `scale(${scale})`, background: 'rgba(255,255,255,0.96)', borderRadius: 32, padding: '30px 44px', boxShadow: '0 18px 44px rgba(0,0,0,0.32)', display: 'flex', alignItems: 'flex-end', gap: 30 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
          {bars.map((h, i) => {
            const grow = spring({ frame: local - 3 - i * 3, fps, config: { damping: 12, stiffness: 170 } });
            return <div key={i} style={{ width: 26, height: Math.max(8, 120 * h * Math.min(grow, 1)), background: U.accent2, borderRadius: 8 }} />;
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: U.font, fontWeight: 900, fontSize: 92, lineHeight: 1, color: U.accent }}>{count.toLocaleString()}+</span>
          <span style={{ fontFamily: U.font, fontWeight: 700, fontSize: 38, color: U.dark }}>colleges compared</span>
        </div>
      </div>
    </div>
  );
};

const UPill: React.FC<{ text: string; delay: number; from: number }> = ({ text, delay, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - from - delay, fps, config: { damping: 14, stiffness: 170 } });
  const y = interpolate(enter, [0, 1], [30, 0]);
  return (
    <div style={{ transform: `translateY(${y}px) scale(${Math.min(enter, 1)})`, background: 'rgba(255,255,255,0.96)', borderRadius: 999, padding: '11px 24px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.26)' }}>
      <span style={{ color: U.accent, fontSize: 30, fontWeight: 900 }}>✓</span>
      <span style={{ fontFamily: U.font, fontWeight: 700, fontSize: 32, color: U.dark, whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  );
};

const UTrust: React.FC<{ fromFrame: number; toFrame: number }> = ({ fromFrame, toFrame }) => {
  const frame = useCurrentFrame();
  if (frame < fromFrame || frame > toFrame + 6) return null;
  const out = interpolate(frame, [toFrame, toFrame + 6], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: out }}>
      <UPill text="No spam calls" delay={0} from={fromFrame} />
      <UPill text="No bias" delay={6} from={fromFrame} />
    </div>
  );
};

const UEndCard: React.FC<{ fromFrame: number }> = ({ fromFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < fromFrame) return null;
  const local = frame - fromFrame;
  const enter = spring({ frame: local, fps, config: { damping: 15, stiffness: 150, mass: 0.8 } });
  const y = interpolate(enter, [0, 1], [200, 0]);
  const pulse = 1 + 0.06 * Math.sin((local / fps) * Math.PI * 3);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 140, display: 'flex', justifyContent: 'center', transform: `translateY(${y}px)` }}>
      <div style={{ background: U.white, borderRadius: 36, padding: '34px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, boxShadow: '0 22px 50px rgba(0,0,0,0.4)', borderTop: `8px solid ${U.accent}` }}>
        <span style={{ fontFamily: U.font, fontWeight: 900, fontSize: 84, color: U.accent2, letterSpacing: -2 }}>EduNext</span>
        <span style={{ fontFamily: U.font, fontWeight: 700, fontSize: 36, color: U.dark, textAlign: 'center' }}>Find your college — no spam, no bias</span>
        <div style={{ marginTop: 12, transform: `scale(${pulse})`, background: U.accent, color: U.dark, borderRadius: 999, padding: '14px 40px', fontFamily: U.font, fontWeight: 800, fontSize: 44 }}>getedunext.com</div>
      </div>
    </div>
  );
};

// Data graph shown during the mid "cutaway" (on the bluish background). Bars grow
// + numbers count up, with a fade in/out. Always renders (falls back to proxy data).
const UGraph: React.FC<{ dataPoints: any[]; fromFrame: number; toFrame: number }> = ({ dataPoints, fromFrame, toFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < fromFrame || frame > toFrame) return null;
  const dp = (dataPoints && dataPoints.length ? dataPoints : [{ label: 'Difficulty', value: 90 }, { label: 'Success rate', value: 30 }]).slice(0, 4);
  const local = frame - fromFrame;
  const enter = spring({ frame: local, fps, config: { damping: 16, stiffness: 120 } });
  const out = interpolate(frame, [toFrame - 10, toFrame], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(interpolate(local, [0, 8], [0, 1]), 1) * out;
  const scale = interpolate(enter, [0, 1], [0.85, 1]);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity }}>
      <div style={{ transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 110, width: '82%' }}>
        <span style={{ fontFamily: U.font, fontWeight: 900, fontSize: 52, color: U.white, letterSpacing: 2, textTransform: 'uppercase' }}>By the numbers</span>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 70, height: 360 }}>
          {dp.map((d, i) => {
            const grow = spring({ frame: local - 6 - i * 5, fps, config: { damping: 14, stiffness: 90 } });
            const v = Math.max(0, Math.min(100, Number(d.value) || 0));
            const h = Math.max(40, (v / 100) * 280 * Math.min(grow, 1));
            const shown = Math.round(v * Math.min(grow, 1));
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: U.font, fontWeight: 900, fontSize: 56, color: U.white }}>{shown}%</span>
                <div style={{ width: 110, height: h, borderRadius: '20px 20px 0 0', background: i % 2 === 0 ? `linear-gradient(to top, ${U.accent2}, ${U.accent})` : `linear-gradient(to top, #0284c7, ${U.accent})`, boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }} />
                <span style={{ fontFamily: U.font, fontWeight: 700, fontSize: 30, color: '#cbd5e1', textAlign: 'center', maxWidth: 200 }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelComposition: React.FC<{
  text: string;
  audioUrl?: string;
  audioDurationInSeconds?: number;
  imageKeywords?: string[];
  imageUrls?: string[];
  faceVideoUrl?: string;
  logoDataUri?: string;
  bgmUrl?: string;
  dataPoints?: any[];
  quoteText?: string;
  overlayOnly?: boolean;
  wordFrames?: number[];
}> = ({
  text,
  audioUrl,
  audioDurationInSeconds = 30,
  imageUrls = [],
  faceVideoUrl = '',
  bgmUrl,
  dataPoints,
  quoteText,
  overlayOnly = false,
  wordFrames = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // overlayOnly = render ONLY the graphics on a transparent background (no face).
  // ffmpeg then composites this over the raw Tavus video, so Remotion never decodes it.
  const isFaceMode = !!faceVideoUrl || overlayOnly;
  const totalFrames = audioDurationInSeconds * fps;

  // --- Subtitle Sync Engine (relative, works for any length) ---
  const words = text.split(' ').filter(Boolean);
  const chunkSize = 3;
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }
  const framesPerWord = totalFrames / Math.max(words.length, 1);
  const chunkDuration = chunkSize * framesPerWord;

  // Pause-aware word timing (from ffmpeg silence detection). Falls back to even spread.
  const useWF = Array.isArray(wordFrames) && wordFrames.length === words.length + 1;
  const wfStart = (i: number) => (useWF ? wordFrames[Math.min(Math.max(i, 0), words.length)] : i * framesPerWord);

  // --- Background image pool (use dynamic imageUrls, else a curated fallback) ---
  const fallbackImages = [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1080&auto=format&fit=crop',
  ];
  const images = imageUrls && imageUrls.length > 0 ? imageUrls : fallbackImages;
  const framesPerBg = fps * 3.5;
  const currentBgIndex = Math.floor(frame / framesPerBg) % images.length;

  // --- Relative widget windows (fractions of total length) ---
  // FACE mode = intro face -> graph cutaway -> quote cutaway -> outro face.
  // TEMPLATE mode = widgets spread across the whole clip.
  const W = (a, b) => [Math.floor(totalFrames * a), Math.floor(totalFrames * b)];
  const [gIn, gOut] = isFaceMode ? W(0.26, 0.49) : W(0.04, 0.34); // graph
  const [qIn, qOut] = isFaceMode ? W(0.53, 0.76) : W(0.38, 0.66); // quote
  const [cIn, cOut] = isFaceMode ? [totalFrames + 10, totalFrames + 11] : W(0.7, 0.99); // checklist (template only)

  // Face cutaway: dim the speaker + let them recede while a widget is on screen.
  const cutStart = gIn;
  const cutEnd = qOut;
  const cutKeys = [cutStart - 15, cutStart + 15, cutEnd - 15, cutEnd + 15];
  const clampBoth = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
  const dimOpacity = interpolate(frame, cutKeys, [0, 0.82, 0.82, 0], clampBoth);
  const faceCutScale = interpolate(frame, cutKeys, [1, 1.07, 1.07, 1], clampBoth);
  const faceCutBlur = interpolate(frame, [cutStart - 10, cutStart + 18, cutEnd - 18, cutEnd + 10], [0, 5, 5, 0], clampBoth);
  const faceBaseZoom = interpolate(frame, [0, totalFrames], [1.0, 1.06], clampBoth); // slow Ken-Burns on the speaker

  // Story beats:
  //  intro face  ->  checklist  ->  GRAPH cutaway (bluish bg)  ->  face + trust  ->  end card
  // Minimal reference style: pills accumulate top-left and stay; face always visible.
  const B = {
    checkA: Math.round(totalFrames * 0.14),
    checkB: Math.round(totalFrames * 0.30),
    checkC: Math.round(totalFrames * 0.46),
    trustStart: Math.round(totalFrames * 0.58),
    trustEnd: Math.round(totalFrames * 0.76),
    endCard: Math.round(totalFrames * 0.80),
  };

  const fade = (start, end) => ({
    enter: spring({ fps, frame: frame - start, config: { damping: 13, stiffness: 55 } }),
    opacity: interpolate(frame, [end - 25, end], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  });

  const showGraph = dataPoints && dataPoints.length > 0;
  const g = fade(gIn, gOut);
  const q = fade(qIn, qOut);
  const c = fade(cIn, cOut);

  // overall progress bar
  const progress = interpolate(frame, [0, totalFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });

  // ===================================================================
  // WIDGET RENDERERS (shared between face & template mode)
  // ===================================================================
  const GraphWidget = (compact = false) =>
    showGraph && frame >= gIn && frame < gOut ? (
      <div
        style={{
          opacity: g.opacity,
          transform: `scale(${g.enter})`,
          background: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(30px)',
          borderRadius: '36px',
          padding: compact ? '28px 40px' : '50px 70px',
          border: '2px solid rgba(255,255,255,0.15)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: compact ? '18px' : '35px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: compact ? '26px' : '38px',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          Data Insights
        </h2>
        <div
          style={{
            display: 'flex',
            gap: compact ? '36px' : '60px',
            alignItems: 'flex-end',
            height: compact ? '180px' : '320px',
          }}
        >
          {dataPoints.map((dp, idx) => {
            const targetHeight = Math.max(
              40,
              Math.min((dp.value / 100) * (compact ? 130 : 200), compact ? 130 : 200)
            );
            const barGrowth = spring({
              fps,
              frame: frame - (gIn + 15 + idx * 8),
              config: { damping: 12, stiffness: 60 },
            });
            const currentHeight = targetHeight * barGrowth;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: compact ? '30px' : '45px', fontWeight: 900, color: '#fff', opacity: barGrowth }}>
                  {Math.round(dp.value * barGrowth)}%
                </div>
                <div
                  style={{
                    width: compact ? '60px' : '90px',
                    height: `${currentHeight}px`,
                    background:
                      idx % 2 === 0
                        ? 'linear-gradient(to top, #4f46e5, #818cf8)'
                        : 'linear-gradient(to top, #0284c7, #38bdf8)',
                    borderRadius: '18px 18px 0 0',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                    borderTop: '2px solid rgba(255,255,255,0.4)',
                  }}
                />
                <span
                  style={{
                    fontSize: compact ? '18px' : '26px',
                    fontWeight: 'bold',
                    color: '#cbd5e1',
                    textTransform: 'uppercase',
                    maxWidth: compact ? '110px' : '140px',
                    textAlign: 'center',
                    lineHeight: '1.3',
                  }}
                >
                  {dp.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    ) : null;

  const QuoteWidget = (compact = false) =>
    frame >= qIn && frame < qOut ? (
      <div
        style={{
          opacity: q.opacity,
          transform: `scale(${q.enter}) translateY(${(1 - q.enter) * 80}px)`,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.92))',
          backdropFilter: 'blur(40px)',
          borderRadius: '36px',
          padding: compact ? '40px' : '70px',
          width: compact ? '90%' : '80%',
          maxWidth: '850px',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '20px',
            fontSize: '200px',
            color: 'rgba(255,255,255,0.05)',
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          &ldquo;
        </div>
        <h2 style={{ fontSize: compact ? '22px' : '32px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '24px' }}>
          Key Takeaway
        </h2>
        <p style={{ fontSize: compact ? '36px' : '50px', fontWeight: 800, color: '#fff', lineHeight: '1.4', margin: 0 }}>
          {quoteText || 'Mastering deep concepts always beats chasing ranks blindly.'}
        </p>
      </div>
    ) : null;

  const ChecklistWidget = (compact = false) =>
    frame >= cIn && frame < cOut ? (
      <div
        style={{
          opacity: c.opacity,
          transform: `scale(${c.enter}) translateX(${(1 - c.enter) * -80}px)`,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(30px)',
          borderRadius: '36px',
          padding: compact ? '36px 50px' : '60px 80px',
          width: compact ? '90%' : '80%',
          maxWidth: '850px',
          border: '2px solid rgba(255,255,255,0.15)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}
      >
        <h2
          style={{
            fontSize: compact ? '30px' : '42px',
            fontWeight: 900,
            color: '#f8fafc',
            letterSpacing: '2px',
            marginBottom: compact ? '28px' : '50px',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            paddingBottom: '18px',
          }}
        >
          YOUR BLUEPRINT
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '22px' : '35px' }}>
          {[
            { icon: '🧠', text: 'Active Self-Testing' },
            { icon: '🎯', text: 'Target Weak Areas' },
            { icon: '🛡️', text: 'Mental Endurance' },
          ].map((item, idx) => {
            const itemScale = spring({ fps, frame: frame - (cIn + 20 + idx * 18), config: { damping: 10, stiffness: 80 } });
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '22px', opacity: itemScale, transform: `translateX(${(1 - itemScale) * -40}px)` }}>
                <div
                  style={{
                    width: compact ? '54px' : '70px',
                    height: compact ? '54px' : '70px',
                    borderRadius: '50%',
                    background: 'linear-gradient(to right, #4f46e5, #38bdf8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: compact ? '26px' : '35px',
                    boxShadow: '0 10px 20px rgba(56, 189, 248, 0.4)',
                  }}
                >
                  {item.icon}
                </div>
                <span style={{ fontSize: compact ? '32px' : '42px', fontWeight: 800, color: '#e2e8f0' }}>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    ) : null;

  // ===================================================================
  // CAPTIONS (shared)
  // ===================================================================
  const Captions = () => (
    <>
      {chunks.map((chunkWords, chunkIndex) => {
        const gi0 = chunkIndex * chunkSize;
        const startFrame = wfStart(gi0);
        const endFrame = wfStart(Math.min(gi0 + chunkWords.length, words.length));
        if (frame < startFrame || frame >= endFrame) return null;

        const span = Math.max(endFrame - startFrame, 1);
        const fadeFrames = Math.min(7, span / 3);
        const op = interpolate(
          frame,
          [startFrame, startFrame + fadeFrames, endFrame - fadeFrames, endFrame],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        // Cinematic spring-pop entrance (overshoot, like the reference edit).
        const enter = spring({ fps, frame: frame - startFrame, config: { damping: 14, stiffness: 170, mass: 0.6 } });
        const popScale = interpolate(enter, [0, 1], [0.82, 1]);
        const rise = interpolate(enter, [0, 1], [40, 0]);

        return (
          <div
            key={chunkIndex}
            style={{
              opacity: op,
              transform: `translateY(${rise}px) scale(${popScale})`,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: isFaceMode ? '18px' : '16px',
              maxWidth: '88%',
              padding: '0 30px',
            }}
          >
            {chunkWords.map((word, wordIndex) => {
              const gi = gi0 + wordIndex;
              const wStart = wfStart(gi);
              const wEnd = wfStart(gi + 1);
              const isSpoken = frame >= wStart && frame < wEnd;
              return (
                <span
                  key={wordIndex}
                  style={{
                    fontFamily: U.font,
                    fontSize: isFaceMode ? '46px' : '76px',
                    fontWeight: 900,
                    letterSpacing: '-1px',
                    color: isSpoken ? U.accent : U.white,
                    transform: isSpoken ? 'scale(1.08)' : 'scale(1)',
                    textShadow: isSpoken
                      ? '0 0 22px rgba(56,189,248,0.6), 0 4px 18px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.9)'
                      : '0 4px 18px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.9)',
                    display: 'inline-block',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </>
  );

  // ===================================================================
  // RENDER
  // ===================================================================
  return (
    <AbsoluteFill style={{ backgroundColor: overlayOnly ? 'transparent' : '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
      {/* ---------- AUDIO (none in overlayOnly; ffmpeg keeps the face's own audio) ---------- */}
      {!overlayOnly && !isFaceMode && audioUrl ? <Audio src={audioUrl} /> : null}
      {!overlayOnly && bgmUrl ? <Audio src={bgmUrl} volume={isFaceMode ? 0.06 : 0.13} /> : null}

      {isFaceMode ? (
        // =============================================================
        // FACE MODE — UGC ad layout (reference-style, EduNext theme)
        //   full-bleed speaker + cinematic gradient + brand components
        //   (handle, checklist, counter, trust pills, end card) + captions
        // =============================================================
        <>
          {/* Speaker — only when NOT overlayOnly (overlayOnly = ffmpeg composites the face). */}
          {!overlayOnly && (
            <AbsoluteFill>
              <Video
                src={faceVideoUrl.startsWith('http') || faceVideoUrl.includes(':') || faceVideoUrl.startsWith('/') ? faceVideoUrl : staticFile(faceVideoUrl)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${faceBaseZoom})`,
                  filter: 'contrast(1.05) saturate(1.08)',
                }}
              />
            </AbsoluteFill>
          )}

          {/* Cinematic gradient (top + bottom) for legibility. */}
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.58) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Small brand pills that accumulate top-left and STAY (reference style). */}
          <UHandle />
          <UChecklist a={B.checkA} b={B.checkB} c={B.checkC} />
          <UTrust fromFrame={B.trustStart} toFrame={B.trustEnd} />
          <UEndCard fromFrame={B.endCard} />

          {/* Small captions at the bottom; hidden during the end card (no clash). */}
          {frame < B.endCard - 4 && (
            <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '26%' }}>
              <Captions />
            </AbsoluteFill>
          )}
        </>
      ) : (
        // =============================================================
        // TEMPLATE MODE — rotating dynamic images + center widgets
        // =============================================================
        <>
          {/* Rotating background images with Ken-Burns zoom */}
          <AbsoluteFill style={{ opacity: 0.4 }}>
            {images.map((imgSrc, idx) => {
              if (idx !== currentBgIndex) return null;
              const localFrame = frame % framesPerBg;
              const scaleImage = interpolate(localFrame, [0, framesPerBg], [1, 1.18], { extrapolateRight: 'clamp' });
              const panX = interpolate(localFrame, [0, framesPerBg], [0, -40], { extrapolateRight: 'clamp' });
              return (
                <AbsoluteFill key={idx}>
                  <Img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scaleImage}) translateX(${panX}px)` }} />
                </AbsoluteFill>
              );
            })}
          </AbsoluteFill>

          {/* Vignette + readability gradients */}
          <AbsoluteFill style={{ background: 'radial-gradient(circle, transparent 18%, rgba(15,23,42,0.88) 120%)' }} />
          <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.05) 100%)' }} />

          {/* Center widget zone (top 65%) */}
          <AbsoluteFill style={{ height: '65%', top: 0, justifyContent: 'center', alignItems: 'center' }}>
            {GraphWidget(false)}
            {QuoteWidget(false)}
            {ChecklistWidget(false)}
          </AbsoluteFill>

          {/* Captions (bottom) */}
          <AbsoluteFill style={{ height: '35%', bottom: '12%', top: 'auto', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
            <Captions />
          </AbsoluteFill>
        </>
      )}

      {/* ---------- SHARED OVERLAYS (template mode only — face mode uses UHandle/UEndCard) ---------- */}
      {!isFaceMode && (
        <>
          {/* Brand chip (top center) */}
          <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '30px' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '100px',
                padding: '10px 28px',
                fontSize: '26px',
                fontWeight: 800,
                letterSpacing: '4px',
                color: '#e2e8f0',
                textTransform: 'uppercase',
                backdropFilter: 'blur(10px)',
              }}
            >
              EduNext Magazine
            </div>
          </AbsoluteFill>

          {/* Logo watermark (top left) */}
          <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'flex-start', padding: '40px' }}>
            <Img src={staticFile('whitelogo.svg')} style={{ width: '320px', height: 'auto', opacity: 0.9, filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' }} />
          </AbsoluteFill>

          {/* Progress bar (very bottom) */}
          <AbsoluteFill style={{ justifyContent: 'flex-end' }}>
            <div style={{ height: '10px', width: '100%', background: 'rgba(255,255,255,0.12)' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(to right, #818cf8, #38bdf8)' }} />
            </div>
          </AbsoluteFill>
        </>
      )}

      {/* Intro fade-in — hides the speaker's first-second warm-up artifact
          (symmetric to the outro fade, which is why the outro already looked smooth). */}
      <AbsoluteFill
        style={{
          backgroundColor: '#0f172a',
          opacity: interpolate(frame, [0, 16], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />

      {/* End fade-out — clean ending + hides any Tavus tail/mouth artifact */}
      <AbsoluteFill
        style={{
          backgroundColor: '#0f172a',
          opacity: interpolate(frame, [totalFrames - 12, totalFrames - 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
    </AbsoluteFill>
  );
};

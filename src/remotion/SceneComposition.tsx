// @ts-nocheck
// src/remotion/SceneComposition.tsx
// Faceless, scene-based reel: each scene = a fast cut with its own background,
// ALL-CAPS-emphasised caption, optional widget pop-up, and an SFX hit.

import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
} from 'remotion';

const FONT = "'Montserrat','Inter',Helvetica,Arial,sans-serif";
const ACCENT = '#38bdf8';
const ACCENT2 = '#6366f1';
const FALLBACK = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop';

const SceneWidget: React.FC<{ widget: any; enter: number }> = ({ widget, enter }) => {
  if (!widget) return null;
  if (widget.type === 'checklist') {
    return (
      <div style={{ position: 'absolute', top: '16%', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: enter, transform: `translateY(${(1 - enter) * 30}px)` }}>
        {widget.items.map((it: string, i: number) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '12px 26px 12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 6.5" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: '#0f172a' }}>{it}</span>
          </div>
        ))}
      </div>
    );
  }
  if (widget.type === 'graph') {
    const dp = (widget.dataPoints || []).slice(0, 3);
    return (
      <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: enter, transform: `translateY(${(1 - enter) * 30}px)` }}>
        <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 28, padding: '26px 42px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', gap: 44 }}>
          {dp.map((d: any, i: number) => {
            const v = Math.max(0, Math.min(100, Number(d.value) || 0));
            const h = Math.max(28, (v / 100) * 190 * enter);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#0f172a' }}>{Math.round(v * enter)}%</span>
                <div style={{ width: 70, height: h, borderRadius: '14px 14px 0 0', background: i % 2 === 0 ? `linear-gradient(to top, ${ACCENT2}, ${ACCENT})` : 'linear-gradient(to top, #0284c7, #38bdf8)', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} />
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#334155', maxWidth: 150, textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // brand_reveal
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '20%', opacity: enter }}>
      <div style={{ transform: `scale(${0.8 + enter * 0.2})`, background: 'rgba(255,255,255,0.97)', borderRadius: 36, padding: '36px 56px', boxShadow: '0 22px 50px rgba(0,0,0,0.45)', borderTop: `8px solid ${ACCENT}`, maxWidth: '88%' }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, color: ACCENT2, letterSpacing: -2, wordBreak: 'break-word' }}>{widget.text}</span>
      </div>
    </AbsoluteFill>
  );
};

// Foreground only (caption + widget + SFX). Background is a separate block layer.
const SceneClip: React.FC<{ scene: any; durFrames: number }> = ({ scene, durFrames }) => {
  const frame = useCurrentFrame(); // local to the Sequence
  const { fps } = useVideoConfig();

  const enter = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 170, mass: 0.6 } });
  const capScale = interpolate(enter, [0, 1], [0.82, 1]);
  const wEnter = Math.min(spring({ frame: frame - 5, fps, config: { damping: 13, stiffness: 160 } }), 1);

  const capText: string = scene.caption !== undefined && scene.caption !== null ? scene.caption : scene.narration;
  const words = capText ? capText.split(' ') : [];
  const framesPerWord = words.length > 0 ? Math.max(3, (durFrames * 0.8) / words.length) : 0;

  return (
    <>
      {/* SFX hit at the start of the scene */}
      {scene.sfx ? <Audio src={staticFile(`sfx/${scene.sfx}.mp3`)} /> : null}

      {/* Widget pop-up (one per scene -> never clashes) */}
      <SceneWidget widget={scene.widget} enter={wEnter} />

      {/* Caption — Hormozi Style Word-by-Word Popup */}
      {words.length > 0 ? (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingTop: '35%' }}>
          <div style={{ transform: `scale(${capScale})`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 24, maxWidth: '85%' }}>
            {words.map((w: string, idx: number) => {
              const emph = /[A-Z]{3,}/.test(w.replace(/[^A-Za-z]/g, ''));
              
              // Word pops in at its designated time
              const wordEnter = spring({ frame: frame - (idx * framesPerWord), fps, config: { damping: 12, stiffness: 220 } });
              
              if (wordEnter === 0) return null;

              return (
                <span key={idx} style={{ 
                  fontFamily: FONT, 
                  fontSize: emph ? '110px' : '86px', 
                  fontWeight: 900, 
                  color: emph ? '#0f172a' : '#fff', 
                  backgroundColor: emph ? '#FCD34D' : 'transparent', // Yellow neon marker
                  padding: emph ? '4px 20px' : '0',
                  borderRadius: '16px',
                  letterSpacing: '-2px', 
                  textShadow: emph ? 'none' : '0 6px 24px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.9)', 
                  display: 'inline-block',
                  transform: `scale(${wordEnter}) translateY(${(1 - wordEnter) * 30}px)`
                }}>
                  {w}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}
    </>
  );
};

export const SceneComposition: React.FC<{
  scenes?: any[];
  imageUrls?: string[];
  sceneDurations?: number[];
  audioRelPath?: string;
  audioDurationInSeconds?: number;
}> = ({ scenes = [], imageUrls = [], sceneDurations = [], audioRelPath = '', audioDurationInSeconds = 30 }) => {
  const { fps } = useVideoConfig();
  const gframe = useCurrentFrame();
  const totalFrames = Math.max(1, Math.round(audioDurationInSeconds * fps));

  let acc = 0;
  const starts = sceneDurations.map((d) => { const s = acc; acc += d; return Math.round(s * fps); });
  const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

  // Group consecutive scenes that share a background into BLOCKS, so the bg only
  // changes a few times (3-4) across the whole video instead of every scene.
  const blocks: { img: string; start: number; end: number }[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const img = imageUrls[i] || '';
    const sf = starts[i];
    const ef = i < scenes.length - 1 ? starts[i + 1] : totalFrames;
    if (blocks.length && blocks[blocks.length - 1].img === img) blocks[blocks.length - 1].end = ef;
    else blocks.push({ img, start: sf, end: ef });
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b1020' }}>
      {/* Narration + low background music */}
      {audioRelPath ? <Audio src={audioRelPath.startsWith('http') ? audioRelPath : staticFile(audioRelPath)} /> : null}
      <Audio src={staticFile('music.mp3')} volume={0.08} />

      {/* BACKGROUND BLOCKS — only change 3-4 times, cross-fade + slow Ken-Burns. */}
      {blocks.map((b, i) => {
        const opIn = i === 0 ? 1 : interpolate(gframe, [b.start - 9, b.start + 9], [0, 1], clamp);
        const opOut = i === blocks.length - 1 ? 1 : interpolate(gframe, [b.end - 9, b.end + 9], [1, 0], clamp);
        const op = Math.min(opIn, opOut);
        if (op <= 0) return null;
        const zoom = interpolate(gframe, [b.start, b.end], [1.06, 1.2], clamp);
        return (
          <AbsoluteFill key={i} style={{ opacity: op }}>
            <Img src={b.img || FALLBACK} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
          </AbsoluteFill>
        );
      })}

      {/* Global dark shadow overlay + readability gradient (over bg, under captions). */}
      <AbsoluteFill style={{ backgroundColor: 'rgba(0,0,0,0.42)' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.7) 100%)' }} />

      {/* FOREGROUND — caption + widget + SFX per scene (fast). */}
      {scenes.map((sc, i) => {
        const durF = Math.max(1, Math.round((sceneDurations[i] || 2) * fps));
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={durF}>
            <SceneClip scene={sc} durFrames={durF} />
          </Sequence>
        );
      })}

      {/* Persistent handle */}
      <div style={{ position: 'absolute', top: 60, left: 50, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.92 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: ACCENT2, boxShadow: '0 0 0 4px rgba(255,255,255,0.3)' }} />
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>@getedunext</span>
      </div>

      {/* Progress bar */}
      <AbsoluteFill style={{ justifyContent: 'flex-end' }}>
        <div style={{ height: 8, width: '100%', background: 'rgba(255,255,255,0.12)' }}>
          <div style={{ height: '100%', width: `${(gframe / totalFrames) * 100}%`, background: `linear-gradient(to right, ${ACCENT2}, ${ACCENT})` }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

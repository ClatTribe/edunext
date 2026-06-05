// src/app/lib/social-automation/satori-carousel.ts
// Next-level Instagram carousel for EduNext, rendered with Satori + Resvg.
// Theme: Dark navy background with amber accents, clean typography.

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CarouselContent {
  topic: string;                 // small label e.g. "JEE ADVANCED"
  hook: string;                  // slide 1 big title
  dataTitle?: string;            // slide 2 heading
  dataHook?: string;             // slide 2 massive text
  dataBody?: string;             // slide 2 paragraph
  dataPoints?: { label: string; value: number | string }[]; // legacy/fallback

  pointsTitle?: string;          // slide 3 heading
  points: string[];              // slide 3 bullets (3-4)
  ctaTitle: string;              // slide 4 main line
  ctaUrl: string;                // slide 4 link (no protocol)
}

const T = {
  bg: '#050818',             // Very dark navy blue
  secondaryBg: '#0F172B',    // Slightly lighter navy
  accent: '#F59E0B',         // Amber main theme color
  white: '#ffffff',
  muted: '#9ca3af',          // Gray-400
  border: 'rgba(245, 158, 11, 0.15)', // Amber border tint
};

// element helpers (Satori object form)
const box = (style: any, children: any): any => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
const txt = (style: any, content: string): any => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: content } });

// Helper to highlight the middle part of a text string with the accent color
function highlightedText(text: string, baseStyle: any): any {
  const words = text.split(' ');
  // Highlight roughly the middle 40% of the words
  const start = Math.floor(words.length * 0.3);
  const end = Math.floor(words.length * 0.8);
  
  return box({ flexDirection: 'row', flexWrap: 'wrap', ...baseStyle }, 
    words.map((w, i) => {
      const isHl = i >= start && i < end;
      return txt({ 
        color: isHl ? T.accent : T.white, 
        marginRight: '0.25em',
        fontStyle: isHl ? 'italic' : 'normal' 
      }, w);
    })
  );
}

function shell(inner: any[], page: number, total: number, logo: string): any {
  return box(
    { width: '1080px', height: '1350px', flexDirection: 'column', background: T.bg, position: 'relative' },
    [
      // Main container with padding
      box({ flexDirection: 'column', flexGrow: 1, padding: '70px', paddingBottom: '160px' }, [
        // Top header: Logo + @getedunext
        box({ alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '30px' }, [
          logo ? { type: 'img', props: { src: logo, style: { height: '56px', objectFit: 'contain' } } } : txt({ fontSize: '46px', fontWeight: 800, color: T.white }, 'EduNext'),
          box({ flexDirection: 'column', alignItems: 'flex-end' }, [
            txt({ fontSize: '20px', color: T.white, fontWeight: 700 }, 'Official EduNext'),
            txt({ fontSize: '18px', color: T.muted, fontWeight: 600, marginTop: '6px' }, 'Learning Partner')
          ])
        ]),
        
        // Thin accent line below header
        box({ width: '100%', height: '3px', background: T.accent, marginBottom: '80px' }, []),
        
        // Slide Specific Content (allows it to grow and center if needed)
        box({ flexDirection: 'column', width: '100%', flexGrow: 1 }, inner),
      ]),

      // Footer
      box({ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: T.secondaryBg, alignItems: 'center', padding: '0 70px', justifyContent: 'space-between' }, [
         box({ alignItems: 'center' }, [
            logo ? { type: 'img', props: { src: logo, style: { height: '30px', objectFit: 'contain', marginRight: '20px' } } } : null,
            txt({ fontSize: '20px', color: T.white, fontWeight: 600, marginTop: '2px' }, 'In association with getedunext.com')
         ]),
         // Dots
         box({ alignItems: 'center' }, 
            Array.from({ length: total }).map((_, i) =>
                box({ width: '12px', height: '12px', borderRadius: '6px', background: i === page ? T.white : 'rgba(255,255,255,0.2)', marginLeft: i === 0 ? '0' : '14px' }, [])
            )
         )
      ])
    ]
  );
}

function slideHook(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '28px', fontWeight: 800, color: T.accent, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '30px' }, `UPDATE • ${c.topic || 'INSIGHT'}`),
    highlightedText(c.hook, { fontSize: '90px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-2px', marginBottom: '46px' }),
    txt({ fontSize: '38px', color: T.white, fontWeight: 700, lineHeight: 1.4 }, 'Swipe for the breakdown →'),
  ];
}

function slideData(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '28px', fontWeight: 800, color: T.accent, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '30px' }, (c.dataTitle || 'KEY INSIGHT').toUpperCase()),
    highlightedText(c.dataHook || 'The Future of Education is Data-Driven', { fontSize: '90px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-2px', marginBottom: '46px' }),
    box({ flexDirection: 'column', width: '100%', flexGrow: 1 }, [
      txt({ fontSize: '42px', color: T.white, fontWeight: 600, lineHeight: 1.5 }, c.dataBody || 'Major industry shifts are creating new opportunities for early adopters who understand the changing landscape.'),
    ])
  ];
}

function slidePoints(c: CarouselContent): any[] {
  const pts = (c.points || []).slice(0, 4);
  return [
    txt({ fontSize: '28px', fontWeight: 800, color: T.accent, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '50px' }, (c.pointsTitle || 'THE BLUEPRINT').toUpperCase()),
    box({ flexDirection: 'column', width: '100%', flexGrow: 1, justifyContent: 'center', paddingBottom: '40px' },
      pts.map((p, i) =>
        box({ alignItems: 'flex-start', borderBottom: i === pts.length - 1 ? 'none' : `1px solid ${T.border}`, paddingBottom: '36px', marginBottom: '36px', width: '100%' }, [
          txt({ fontSize: '56px', fontWeight: 800, color: T.accent, marginRight: '34px', marginTop: '-6px' }, String(i + 1).padStart(2, '0')),
          txt({ fontSize: '42px', fontWeight: 700, color: T.white, flexGrow: 1, lineHeight: 1.35 }, p),
        ])
      )
    ),
  ];
}

function slideCTA(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '28px', fontWeight: 800, color: T.accent, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '30px' }, 'YOUR • NEXT STEP'),
    highlightedText(c.ctaTitle, { fontSize: '90px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-2px', marginBottom: '46px' }),
    box({ flexDirection: 'column', flexGrow: 1, justifyContent: 'flex-end', paddingBottom: '60px' }, [
      txt({ fontSize: '36px', fontWeight: 600, color: T.muted, lineHeight: 1.5, marginBottom: '20px' }, 'Tap the link in bio to connect with our experts.'),
      txt({ fontSize: '36px', fontWeight: 600, color: T.muted, lineHeight: 1.5 }, 'Save this post for your reference.'),
    ])
  ];
}

export async function generateCarousel(content: CarouselContent, outputDir: string = os.tmpdir()): Promise<string[]> {
  const fontUrl = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf';
  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) throw new Error('Font fetch failed: ' + fontRes.statusText);
  const fontData = await fontRes.arrayBuffer();
  const fonts = [400, 600, 700, 800].map((w) => ({ name: 'Inter', data: fontData, weight: w as any, style: 'normal' as const }));

  let logo = '';
  try {
    const logoSvg = fs.readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'whitelogo.svg'), 'utf8');
    const png = new Resvg(logoSvg, { fitTo: { mode: 'width', value: 500 } }).render().asPng();
    logo = `data:image/png;base64,${png.toString('base64')}`;
  } catch { /* text fallback */ }

  const slidesRaw = [];
  slidesRaw.push(slideHook(content));
  if ((content.dataPoints && content.dataPoints.length > 0) || content.dataHook) {
    slidesRaw.push(slideData(content));
  }
  if (content.points && content.points.length > 0) {
    slidesRaw.push(slidePoints(content));
  }
  slidesRaw.push(slideCTA(content));

  const total = slidesRaw.length;
  const filePaths: string[] = [];

  for (let i = 0; i < total; i++) {
    const svg = await satori(shell(slidesRaw[i], i, total, logo), { width: 1080, height: 1350, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } }).render().asPng();
    const fp = path.join(outputDir, `carousel_${Date.now()}_${i}.png`);
    fs.writeFileSync(fp, png);
    filePaths.push(fp);
  }
  return filePaths;
}

// ---------------------------------------------------------------------------
// Back-compat: old signature (hook, value, cta) still used by the existing cron.
// ---------------------------------------------------------------------------
export async function generateCarouselImages(
  hookText: string,
  valueText: string,
  ctaText: string,
  outputDir: string = os.tmpdir()
): Promise<string[]> {
  const points = valueText.split(/[\n.]/).map((p) => p.trim()).filter((p) => p.length > 6).slice(0, 3);
  return generateCarousel(
    {
      topic: 'Insight',
      hook: hookText,
      points: points.length ? points : ['Deep insights', 'Verified data', 'No spam'],
      ctaTitle: ctaText || 'Read the full analysis',
      ctaUrl: 'getedunext.com/magazine',
    },
    outputDir
  );
}

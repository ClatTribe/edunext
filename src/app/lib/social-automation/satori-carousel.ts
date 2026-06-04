// src/app/lib/social-automation/satori-carousel.ts
// Next-level 4-slide Instagram carousel for EduNext, rendered with Satori + Resvg.
// Theme: slate/indigo gradient + sky (#38bdf8) / indigo (#818cf8) accents, glass cards.

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CarouselContent {
  topic: string;                 // small label e.g. "JEE ADVANCED"
  hook: string;                  // slide 1 big title
  dataTitle?: string;            // slide 2 heading
  dataPoints?: { label: string; value: number }[]; // slide 2 bars
  pointsTitle?: string;          // slide 3 heading
  points: string[];              // slide 3 bullets (3-4)
  ctaTitle: string;              // slide 4 main line
  ctaUrl: string;                // slide 4 link (no protocol)
}

const T = {
  bg: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 58%, #0b1020 100%)',
  sky: '#38bdf8',
  indigo: '#818cf8',
  white: '#ffffff',
  muted: '#94a3b8',
  glass: 'rgba(30, 41, 59, 0.66)',
  glassBorder: 'rgba(148, 163, 184, 0.22)',
};

// element helpers (Satori object form)
const box = (style: any, children: any): any => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
const txt = (style: any, content: string): any => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: content } });

function shell(inner: any[], page: number, total: number, logo: string): any {
  return box(
    { width: '1080px', height: '1350px', flexDirection: 'column', background: T.bg, padding: '70px', position: 'relative' },
    [
      box({ position: 'absolute', top: '-160px', right: '-120px', width: '420px', height: '420px', borderRadius: '50%', background: 'rgba(56,189,248,0.18)' }, []),
      box({ position: 'absolute', bottom: '-180px', left: '-140px', width: '460px', height: '460px', borderRadius: '50%', background: 'rgba(129,140,248,0.16)' }, []),
      box({ alignItems: 'center', justifyContent: 'space-between', width: '100%' }, [
        logo ? { type: 'img', props: { src: logo, style: { width: '250px', height: '56px', objectFit: 'contain' } } } : txt({ fontSize: '40px', fontWeight: 800, color: T.white }, 'EduNext'),
        txt({ fontSize: '28px', color: T.muted, fontWeight: 600 }, '@getedunext'),
      ]),
      box({ flexDirection: 'column', flexGrow: 1, justifyContent: 'center', width: '100%' }, inner),
      box({ alignItems: 'center', justifyContent: 'center', width: '100%' },
        Array.from({ length: total }).map((_, i) =>
          box({ width: i === page ? '42px' : '14px', height: '14px', borderRadius: '7px', background: i === page ? T.sky : 'rgba(148,163,184,0.4)', marginLeft: i === 0 ? '0' : '12px' }, [])
        )
      ),
    ]
  );
}

function chip(label: string): any {
  return box({ alignSelf: 'flex-start', background: 'rgba(56,189,248,0.14)', border: `1px solid ${T.sky}`, borderRadius: '100px', padding: '12px 30px', marginBottom: '40px' },
    [txt({ fontSize: '28px', fontWeight: 700, color: T.sky, letterSpacing: '3px' }, label.toUpperCase())]);
}

function slideHook(c: CarouselContent): any[] {
  return [
    chip(`EduNext • ${c.topic}`),
    txt({ fontSize: '108px', fontWeight: 800, color: T.white, lineHeight: 1.05, letterSpacing: '-2px' }, c.hook),
    box({ marginTop: '46px', alignItems: 'center' }, [
      txt({ fontSize: '34px', color: T.muted, fontWeight: 600 }, 'Swipe for the breakdown'),
      txt({ fontSize: '38px', color: T.sky, marginLeft: '14px' }, '→'),
    ]),
  ];
}

function slideData(c: CarouselContent): any[] {
  const dp = (c.dataPoints || []).slice(0, 2);
  return [
    txt({ fontSize: '46px', fontWeight: 800, color: T.indigo, letterSpacing: '2px', marginBottom: '50px' }, (c.dataTitle || 'BY THE NUMBERS').toUpperCase()),
    box({ background: T.glass, border: `2px solid ${T.glassBorder}`, borderRadius: '40px', padding: '60px', width: '100%', justifyContent: 'space-around', alignItems: 'flex-end', height: '560px' },
      dp.map((d, i) => {
        const v = Math.max(0, Math.min(100, Number(d.value) || 0));
        const h = Math.max(60, (v / 100) * 380);
        return box({ flexDirection: 'column', alignItems: 'center', width: '40%' }, [
          txt({ fontSize: '76px', fontWeight: 800, color: T.white, marginBottom: '18px' }, `${v}%`),
          box({ width: '150px', height: `${h}px`, borderRadius: '22px 22px 0 0', background: i % 2 === 0 ? `linear-gradient(to top, ${T.indigo}, ${T.sky})` : 'linear-gradient(to top, #0284c7, #38bdf8)' }, []),
          txt({ fontSize: '32px', fontWeight: 600, color: T.muted, marginTop: '22px', textAlign: 'center' }, d.label),
        ]);
      })
    ),
  ];
}

function slidePoints(c: CarouselContent): any[] {
  const pts = (c.points || []).slice(0, 4);
  return [
    txt({ fontSize: '46px', fontWeight: 800, color: T.sky, letterSpacing: '2px', marginBottom: '46px' }, (c.pointsTitle || 'THE BLUEPRINT').toUpperCase()),
    box({ flexDirection: 'column', width: '100%' },
      pts.map((p, i) =>
        box({ alignItems: 'center', background: T.glass, border: `2px solid ${T.glassBorder}`, borderRadius: '28px', padding: '34px 40px', width: '100%', marginBottom: i === pts.length - 1 ? '0' : '26px' }, [
          box({ width: '64px', height: '64px', borderRadius: '50%', background: i % 2 === 0 ? T.sky : T.indigo, alignItems: 'center', justifyContent: 'center', marginRight: '30px' },
            [txt({ fontSize: '38px', fontWeight: 800, color: T.white }, '✓')]),
          txt({ fontSize: '42px', fontWeight: 700, color: T.white, flexGrow: 1 }, p),
        ])
      )
    ),
  ];
}

function slideCTA(c: CarouselContent): any[] {
  return [
    box({ flexDirection: 'column', alignItems: 'center', width: '100%' }, [
      txt({ fontSize: '120px', fontWeight: 800, color: T.white, letterSpacing: '-3px' }, 'EduNext'),
      txt({ fontSize: '40px', fontWeight: 600, color: T.muted, marginTop: '20px', textAlign: 'center' }, c.ctaTitle),
      box({ marginTop: '56px', background: `linear-gradient(90deg, ${T.indigo}, ${T.sky})`, borderRadius: '100px', padding: '30px 60px' },
        [txt({ fontSize: '44px', fontWeight: 800, color: '#0b1020' }, c.ctaUrl)]),
      txt({ fontSize: '32px', fontWeight: 600, color: T.muted, marginTop: '44px' }, 'Zero spam • Verified data • Unbiased'),
    ]),
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
    const logoSvg = fs.readFileSync(path.join(process.cwd(), 'public', 'whitelogo.svg'), 'utf8');
    const png = new Resvg(logoSvg, { fitTo: { mode: 'width', value: 500 } }).render().asPng();
    logo = `data:image/png;base64,${png.toString('base64')}`;
  } catch { /* text fallback */ }

  const slides = [slideHook(content), slideData(content), slidePoints(content), slideCTA(content)];
  const total = slides.length;
  const filePaths: string[] = [];

  for (let i = 0; i < total; i++) {
    const svg = await satori(shell(slides[i], i, total, logo), { width: 1080, height: 1350, fonts });
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
      topic: 'Update',
      hook: hookText,
      points: points.length ? points : ['Deep insights', 'Verified data', 'No spam'],
      ctaTitle: ctaText || 'Read the full analysis',
      ctaUrl: 'getedunext.com/magazine',
    },
    outputDir
  );
}

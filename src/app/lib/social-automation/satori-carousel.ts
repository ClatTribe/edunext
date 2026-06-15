import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CarouselContent {
  topic: string;                 
  hook: string;                  
  dataTitle?: string;            
  dataHook?: string;             
  dataBody?: string;             
  pointsTitle?: string;          
  points: string[];              
  ctaTitle: string;              
  ctaUrl: string;                
}

const T = {
  bg: '#F4EFE6',             // Cream / Off-white (Gen-Z minimal)
  secondaryBg: '#EBE5DA',    // Slightly darker cream for footer
  text: '#111827',           // Dark charcoal / black
  muted: '#6B7280',          // Medium gray
  white: '#ffffff',
  // Highlighters
  hlCyan: '#A5F3FC',
  hlPink: '#FBCFE8',
  hlAmber: '#FDE68A',
  hlLime: '#D9F99D',
};

// Satori object helpers
const box = (style: any, children: any): any => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
const txt = (style: any, content: string): any => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: content } });

// Highlighter effect: chunks text and adds a background color block to the middle section
function highlightedText(text: string, hlColor: string, baseStyle: any): any {
  const words = text.split(' ');
  // highlight roughly from 40% to 80% of words
  const start = Math.floor(words.length * 0.4);
  const end = Math.floor(words.length * 0.8);
  
  return box({ flexDirection: 'row', flexWrap: 'wrap', ...baseStyle }, 
    words.map((w, i) => {
      const isHl = i >= start && i < end;
      return box({ 
        background: isHl ? hlColor : 'transparent', 
        padding: '0 10px', 
        margin: '0 -2px',
        marginBottom: '10px',
        borderRadius: '6px'
      }, [
        txt({ color: T.text, fontWeight: 800, fontFamily: 'Montserrat' }, w)
      ]);
    })
  );
}

function shell(inner: any[], page: number, total: number, logo: string): any {
  return box(
    { width: '1080px', height: '1350px', flexDirection: 'column', background: T.bg, position: 'relative', fontFamily: 'Inter' },
    [
      box({ flexDirection: 'column', flexGrow: 1, padding: '80px', paddingBottom: '160px', paddingTop: '100px' }, inner),
      
      // Minimal Footer (Swipe indicator & tiny branding)
      box({ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', alignItems: 'center', padding: '0 80px', justifyContent: 'space-between' }, [
         txt({ fontSize: '28px', color: T.muted, fontWeight: 500 }, page === total - 1 ? '' : 'swipe'),
         box({ alignItems: 'center' }, 
            Array.from({ length: total }).map((_, i) =>
                box({ width: '10px', height: '10px', borderRadius: '5px', background: i === page ? T.text : 'rgba(0,0,0,0.1)', marginLeft: i === 0 ? '0' : '14px' }, [])
            )
         )
      ])
    ]
  );
}

// Slide 1: Big hook with yellow highlight
function slideHook(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '32px', fontWeight: 800, color: '#F27A21', marginBottom: '80px', fontFamily: 'Montserrat' }, `for every student following ${c.topic}:`.toLowerCase()),
    highlightedText(c.hook.toLowerCase(), T.hlAmber, { fontSize: '110px', lineHeight: 1.15, letterSpacing: '-3px' }),
    box({ flexGrow: 1 }, []), // spacer
    txt({ fontSize: '36px', color: T.muted, fontWeight: 500, lineHeight: 1.5, maxWidth: '900px' }, 'swipe to understand exactly what this means for your future.')
  ];
}

// Slide 2: Twitter / X Theme
function slideTwitter(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '36px', fontWeight: 800, color: '#F27A21', marginBottom: '60px', fontFamily: 'Montserrat' }, 'trending on X this week:'),
    box({ flexDirection: 'column', width: '100%', alignItems: 'center' }, [
      // Tweet container
      box({ background: T.white, padding: '50px', borderRadius: '32px', width: '95%', flexDirection: 'column', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }, [
        // Header
        box({ alignItems: 'center', marginBottom: '30px' }, [
          box({ width: '90px', height: '90px', borderRadius: '45px', background: '#0F1419', marginRight: '24px' }, []), // Avatar placeholder
          box({ flexDirection: 'column' }, [
            txt({ fontSize: '34px', color: '#0F1419', fontWeight: 800, fontFamily: 'Montserrat' }, 'EduNext Official'),
            txt({ fontSize: '28px', color: '#536471', fontWeight: 500, marginTop: '4px' }, '@getedunext')
          ]),
          // Twitter logo X
          box({ marginLeft: 'auto' }, [
            txt({ fontSize: '48px', color: '#0F1419', fontWeight: 800, fontFamily: 'Montserrat' }, '𝕏')
          ])
        ]),
        // Body
        txt({ fontSize: '44px', color: '#0F1419', fontWeight: 500, lineHeight: 1.4, marginBottom: '36px' }, c.dataBody || "45 Scams in 24 Years. If you're relying on just ONE entrance exam right now, you're playing a dangerous game. Have a backup plan."),
        // Meta
        txt({ fontSize: '28px', color: '#536471', fontWeight: 500, marginBottom: '30px' }, '10:45 AM · Jun 5, 2026'),
        // Divider
        box({ width: '100%', height: '2px', background: '#EFF3F4', marginBottom: '28px' }, []),
        // Action Bar
        box({ alignItems: 'center', color: '#536471', fontSize: '32px', width: '100%', justifyContent: 'space-between', paddingRight: '60px' }, [
          txt({}, '💬 142'), txt({}, '🔁 4.2K'), txt({}, '❤️ 12.8K'), txt({}, '🔖')
        ])
      ])
    ])
  ];
}

// Slide 3: Big statement with Pink highlight
function slideStatement(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '32px', fontWeight: 800, color: '#F27A21', marginBottom: '80px', fontFamily: 'Montserrat' }, 'the reality check:'.toLowerCase()),
    highlightedText('adapt your strategy before it is too late.', T.hlPink, { fontSize: '110px', lineHeight: 1.15, letterSpacing: '-3px' }),
    box({ flexGrow: 1 }, []), // spacer
    txt({ fontSize: '36px', color: T.muted, fontWeight: 500, lineHeight: 1.5, maxWidth: '900px' }, 'start building your profile using these new insights to stay ahead of the curve.')
  ];
}

// Slide 4: Eligibility / Rules with HUGE Highlight & Contrast Bubble CTA
function slideCTA(c: CarouselContent): any[] {
  return [
    // Huge highlighted title just like Slide 1 and 3
    highlightedText(c.pointsTitle || 'the full eligibility rule.', T.hlLime, { fontSize: '100px', lineHeight: 1.15, letterSpacing: '-3px', marginBottom: '80px' }),
    
    // Bullet points
    box({ flexDirection: 'column', width: '100%', paddingBottom: '40px' },
      (c.points || []).slice(0, 4).map((p, i) =>
        box({ alignItems: 'center', marginBottom: '36px', width: '100%' }, [
          txt({ fontSize: '48px', fontWeight: 800, color: '#F27A21', marginRight: '34px', fontFamily: 'Montserrat' }, '✓'),
          txt({ fontSize: '42px', fontWeight: 500, color: T.text, flexGrow: 1, lineHeight: 1.35 }, p.toLowerCase()),
        ])
      )
    ),
    box({ flexGrow: 1 }, []), // spacer
    
    // Unique contrast bubble CTA at the bottom
    box({ alignItems: 'center', justifyContent: 'space-between', width: '100%', background: '#111827', padding: '36px 50px', borderRadius: '100px', boxShadow: '0 12px 32px rgba(17, 24, 39, 0.2)' }, [
      txt({ fontSize: '32px', color: '#9CA3AF', fontWeight: 500 }, 'want the full breakdown?'),
      txt({ fontSize: '36px', color: T.hlLime, fontWeight: 800, fontFamily: 'Montserrat', letterSpacing: '-1px' }, 'getedunext.com ↗')
    ])
  ];
}

// Slide 2: WhatsApp Chat Theme
function slideWhatsApp(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '36px', fontWeight: 800, color: '#F27A21', marginBottom: '60px', fontFamily: 'Montserrat' }, 'this came in our DMs this week:'),
    box({ flexDirection: 'column', width: '100%', alignItems: 'center' }, [
      box({ background: T.white, padding: '35px', borderRadius: '24px', alignSelf: 'flex-start', maxWidth: '85%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, [
        box({ flexDirection: 'column' }, [
          txt({ fontSize: '24px', color: '#F27A21', fontWeight: 700, marginBottom: '10px' }, '@student_aspirant'),
          txt({ fontSize: '34px', color: T.text, fontWeight: 500, lineHeight: 1.4 }, c.dataHook || 'Sir I am stressed, should I even apply?')
        ])
      ]),
      box({ background: '#DCF8C6', padding: '35px', borderRadius: '24px', alignSelf: 'flex-end', maxWidth: '85%', marginTop: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }, [
        box({ flexDirection: 'column' }, [
          txt({ fontSize: '24px', color: '#25D366', fontWeight: 700, marginBottom: '10px' }, 'EduNext'),
          txt({ fontSize: '34px', color: T.text, fontWeight: 500, lineHeight: 1.4 }, c.dataBody || "Yes bhai — it's tough. But you need a secure backup plan. Start now.")
        ])
      ])
    ])
  ];
}

// Slide 2: Reddit Thread Theme
function slideReddit(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '36px', fontWeight: 800, color: '#F27A21', marginBottom: '60px', fontFamily: 'Montserrat' }, 'spotted on reddit this week:'),
    box({ flexDirection: 'column', width: '100%', alignItems: 'center' }, [
      box({ background: '#1A1A1B', padding: '45px', borderRadius: '16px', width: '95%', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #343536' }, [
        box({ alignItems: 'center', marginBottom: '24px' }, [
          box({ width: '40px', height: '40px', borderRadius: '20px', background: '#FF4500', marginRight: '16px' }, []),
          txt({ fontSize: '24px', color: '#D7DADC', fontWeight: 700, marginRight: '12px' }, 'r/JEENEETards'),
          txt({ fontSize: '24px', color: '#818384', fontWeight: 500 }, '• Posted by u/stressed_aspirant 4h ago')
        ]),
        txt({ fontSize: '42px', color: '#D7DADC', fontWeight: 700, lineHeight: 1.3, marginBottom: '24px' }, c.dataHook || 'Is there even a point in preparing anymore?'),
        txt({ fontSize: '32px', color: '#D7DADC', fontWeight: 500, lineHeight: 1.4, marginBottom: '40px', opacity: 0.8 }, c.dataBody || "I feel completely lost. I've spent 2 years grinding. What's the backup plan?"),
        box({ alignItems: 'center', color: '#818384', fontSize: '26px', fontWeight: 700 }, [
          box({ background: '#272729', borderRadius: '24px', padding: '10px 24px', alignItems: 'center', marginRight: '16px' }, [
            txt({ color: '#FF4500', marginRight: '16px', fontSize: '28px' }, '▲'),
            txt({ color: '#D7DADC', marginRight: '16px' }, '2.4k'),
            txt({ color: '#818384', fontSize: '28px', transform: 'rotate(180deg)' }, '▲')
          ]),
          box({ background: '#272729', borderRadius: '24px', padding: '12px 24px', alignItems: 'center', marginRight: '16px' }, [
            txt({ marginRight: '12px' }, '💬'), txt({}, '142 Comments')
          ]),
          box({ background: '#272729', borderRadius: '24px', padding: '12px 24px', alignItems: 'center' }, [
            txt({ marginRight: '12px' }, '↪'), txt({}, 'Share')
          ])
        ])
      ])
    ])
  ];
}

// Slide 2: Instagram Post Theme
function slideInstagram(c: CarouselContent): any[] {
  return [
    txt({ fontSize: '36px', fontWeight: 800, color: '#F27A21', marginBottom: '60px', fontFamily: 'Montserrat' }, 'trending on instagram:'),
    box({ flexDirection: 'column', width: '100%', alignItems: 'center' }, [
      box({ background: T.white, borderRadius: '16px', width: '95%', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', overflow: 'hidden' }, [
        // Header
        box({ alignItems: 'center', padding: '24px', borderBottom: '1px solid #DBDBDB' }, [
          box({ width: '60px', height: '60px', borderRadius: '30px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', marginRight: '16px' }, []),
          txt({ fontSize: '28px', color: '#262626', fontWeight: 700, flexGrow: 1 }, 'edunext_official'),
          txt({ fontSize: '36px', color: '#262626', fontWeight: 700 }, '⋮')
        ]),
        // Image / Content Box
        box({ background: '#FAFAFA', padding: '60px 40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }, [
           txt({ fontSize: '48px', color: '#262626', fontWeight: 800, textAlign: 'center', lineHeight: 1.3 }, c.dataHook || 'Is your future safe from the latest leaks?')
        ]),
        // Footer Actions
        box({ flexDirection: 'column', padding: '24px' }, [
          box({ alignItems: 'center', marginBottom: '16px' }, [
            txt({ fontSize: '42px', color: '#ED4956', marginRight: '24px' }, '❤️'),
            txt({ fontSize: '42px', color: '#262626', marginRight: '24px' }, '💬'),
            txt({ fontSize: '42px', color: '#262626' }, '↗️')
          ]),
          txt({ fontSize: '24px', color: '#262626', fontWeight: 700, marginBottom: '8px' }, '8,492 likes'),
          box({ alignItems: 'baseline' }, [
            txt({ fontSize: '24px', color: '#262626', fontWeight: 700, marginRight: '12px' }, 'edunext_official'),
            txt({ fontSize: '24px', color: '#262626', fontWeight: 500, lineHeight: 1.4 }, c.dataBody || 'The truth about college admissions in 2026.')
          ])
        ])
      ])
    ])
  ];
}

export async function generateCarousel(content: CarouselContent, outputDir: string = os.tmpdir()): Promise<string[]> {
  const fontUrlInter = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf';
  
  const resI = await fetch(fontUrlInter);
  if (!resI.ok) throw new Error('Font fetch failed');
  const dataI = await resI.arrayBuffer();

  const fonts = [
    { name: 'Inter', data: dataI, weight: 500 as any, style: 'normal' as const },
    { name: 'Montserrat', data: dataI, weight: 800 as any, style: 'normal' as const },
  ];

  const appSlideTemplates = [slideWhatsApp(content), slideReddit(content), slideTwitter(content), slideInstagram(content)];
  const randomAppSlide = appSlideTemplates[Math.floor(Math.random() * appSlideTemplates.length)];

  const slidesRaw = [
    slideHook(content),
    randomAppSlide,
    slideStatement(content),  
    slideCTA(content)
  ];

  const total = slidesRaw.length;
  const filePaths: string[] = [];

  for (let i = 0; i < total; i++) {
    const svg = await satori(shell(slidesRaw[i], i, total, ''), { width: 1080, height: 1350, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } }).render().asPng();
    const fp = path.join(outputDir, `carousel_${Date.now()}_${i}.png`);
    fs.writeFileSync(fp, png);
    filePaths.push(fp);
  }
  return filePaths;
}

// ---------------------------------------------------------------------------
// Back-compat: old signature still used by the existing manual cron scripts.
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

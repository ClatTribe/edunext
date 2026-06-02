import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function generateCarouselImages(
  hookText: string,
  valueText: string,
  ctaText: string,
  outputDir: string = os.tmpdir()
): Promise<string[]> {
  
  // Use Inter font for a modern look
  const fontUrl = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf'; 
  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) throw new Error('Failed to fetch font: ' + fontRes.statusText);
  const fontData = await fontRes.arrayBuffer();

  // Load logo SVG
  const logoPath = path.join(process.cwd(), 'public', 'whitelogo.svg');
  let logoDataUri = '';
  try {
    const logoSvg = fs.readFileSync(logoPath, 'utf8');
    const logoResvg = new Resvg(logoSvg, { fitTo: { mode: 'width', value: 360 } });
    const logoPng = logoResvg.render().asPng();
    logoDataUri = `data:image/png;base64,${logoPng.toString('base64')}`;
  } catch (err) {
    console.warn('Could not load logo SVG, falling back to text.');
  }

  // Define EduNext theme colors
  const theme = {
    bgStart: '#0f172a', // Slate 900
    bgEnd: '#1e1b4b',   // Indigo 950
    primary: '#818cf8', // Indigo 400
    secondary: '#38bdf8', // Sky 400
    textMain: '#ffffff',
    textMuted: '#94a3b8',
    glassBg: 'rgba(30, 41, 59, 0.7)', // Slate 800 semi-transparent
    glassBorder: 'rgba(148, 163, 184, 0.2)' // Slate 400 faint
  };

  const filePaths: string[] = [];
  const slidesContent = [hookText, valueText, ctaText];

  for (let i = 0; i < 3; i++) {
    const textContent = slidesContent[i] || 'EduNext Update';
    
    // Slide 1: Big glowing hook
    // Slide 2: Glassmorphic cards/table layout
    // Slide 3: Standard CTA layout
    
    let slideLayout: any;

    if (i === 0) {
      // Slide 1: Big bold hook text (like "Am I ELIGIBLE?")
      slideLayout = {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '80px', textAlign: 'center' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: '100px', fontWeight: 800, color: theme.textMain, lineHeight: 1.1, textShadow: '0 0 40px rgba(129, 140, 248, 0.5)' },
                children: textContent
              }
            },
            {
              type: 'div',
              props: {
                style: { marginTop: '40px', fontSize: '32px', color: theme.textMuted, fontWeight: 500 },
                children: 'Swipe to see the insights 👉'
              }
            }
          ]
        }
      };
    } else if (i === 1) {
      // Slide 2: Glassmorphism list/table (like the "Marks Rule" screen)
      // We'll split the value text into bullet points to simulate table rows
      const points = textContent.split(/[\n-]/).filter(p => p.trim().length > 5).slice(0, 4); // Take up to 4 points
      
      slideLayout = {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '60px' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: '50px', fontWeight: 700, color: theme.primary, marginBottom: '40px' },
                children: 'Key Details'
              }
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' },
                children: points.map(point => ({
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: theme.glassBg,
                      border: `2px solid ${theme.glassBorder}`,
                      borderRadius: '24px',
                      padding: '30px 40px',
                      width: '100%',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { width: '16px', height: '16px', borderRadius: '8px', backgroundColor: theme.secondary, marginRight: '30px' }
                        }
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: '36px', color: theme.textMain, fontWeight: 600, lineHeight: 1.4 },
                          children: point.trim()
                        }
                      }
                    ]
                  }
                }))
              }
            }
          ]
        }
      };
    } else {
      // Slide 3: CTA
      slideLayout = {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '80px', textAlign: 'center' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: '70px', fontWeight: 800, color: theme.primary, marginBottom: '40px' },
                children: textContent
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  backgroundColor: theme.textMain,
                  color: theme.bgStart,
                  padding: '24px 60px',
                  borderRadius: '100px',
                  fontSize: '40px',
                  fontWeight: 700,
                  marginTop: '40px'
                },
                children: 'Visit getedunext.com'
              }
            }
          ]
        }
      };
    }

    const element = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(135deg, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`,
          fontFamily: '"Inter"',
        },
        children: [
          // Background Glows
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute', top: '-10%', right: '-10%', width: '700px', height: '700px', borderRadius: '350px',
                backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', opacity: 0.2, filter: 'blur(80px)'
              }
            }
          },
          // Main Container for content
          {
            type: 'div',
            props: {
              style: { display: 'flex', flex: 1, position: 'relative' },
              children: [slideLayout]
            }
          },
          // Header Overlay (Logo)
          {
            type: 'div',
            props: {
              style: { position: 'absolute', top: '40px', left: '60px', display: 'flex', alignItems: 'center' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center' },
                    children: [
                      logoDataUri ? { type: 'img', props: { src: logoDataUri, style: { height: '30px', marginRight: '12px' } } } : null,
                      { type: 'span', props: { style: { color: theme.textMain, fontSize: '24px', fontWeight: 600 }, children: 'EduNext' } }
                    ]
                  }
                }
              ]
            }
          },
          // Footer Overlay (Pagination)
          {
            type: 'div',
            props: {
              style: { position: 'absolute', bottom: '40px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '16px' },
              children: [0, 1, 2].map((idx) => ({
                type: 'div',
                props: {
                  style: {
                    width: i === idx ? '60px' : '20px',
                    height: '10px',
                    borderRadius: '5px',
                    backgroundColor: i === idx ? theme.primary : 'rgba(255,255,255,0.3)',
                  }
                }
              }))
            }
          }
        ]
      }
    };

    const svg = await satori(element as any, {
      width: 1080,
      height: 1080,
      fonts: [
        { name: 'Inter', data: fontData, weight: 700, style: 'normal' },
        { name: 'Inter', data: fontData, weight: 500, style: 'normal' },
        { name: 'Inter', data: fontData, weight: 800, style: 'normal' }
      ],
    });

    const resvg = new Resvg(svg, {
      background: theme.bgStart,
      fitTo: { mode: 'width', value: 1080 },
    });
    
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    const filePath = path.join(outputDir, 'carousel_slide_' + (i + 1) + '.png');
    fs.writeFileSync(filePath, pngBuffer);
    filePaths.push(filePath);
  }

  return filePaths;
}

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
  
  // Use Inter font instead of Roboto
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
    console.error('Could not load logo SVG', err);
  }

  const slides = [
    { text: hookText, subtitle: "Trending on EduNext", color: '#ffffff' },
    { text: valueText, subtitle: "Key Insights", color: '#fef08a' },
    { text: ctaText, subtitle: "Read More at getedunext.com", color: '#a5b4fc' }
  ];

  const filePaths: string[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    const element = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: '"Inter"',
          padding: '60px',
        },
        children: [
          // Background decorative circle 1
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '800px',
                height: '800px',
                borderRadius: '400px',
                backgroundImage: 'linear-gradient(135deg, #4f46e5 0%, #c026d3 100%)',
                opacity: 0.15,
              }
            }
          },
          // Background decorative circle 2
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '300px',
                backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                opacity: 0.15,
              }
            }
          },
          // Glass Card
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '900px',
                height: '900px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '48px',
                padding: '80px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              },
              children: [
                // Header (Logo + Subtitle)
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: '28px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' },
                          children: slide.subtitle
                        }
                      },
                      logoDataUri ? {
                        type: 'img',
                        props: {
                          src: logoDataUri,
                          style: { width: '180px', height: 'auto', opacity: 0.9 }
                        }
                      } : {
                        type: 'div',
                        props: {
                          style: { fontSize: '48px', fontWeight: 800, color: '#818cf8', letterSpacing: '-1px' },
                          children: 'EduNext.'
                        }
                      }
                    ]
                  }
                },
                // Main Content
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: slide.text.length > 250 ? '36px' : slide.text.length > 150 ? '48px' : slide.text.length > 80 ? '56px' : '76px',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      color: slide.color,
                      textAlign: 'left',
                      display: 'flex',
                      flexWrap: 'wrap',
                      whiteSpace: 'pre-wrap',
                    },
                    children: slide.text
                  }
                },
                // Footer (Pagination)
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', gap: '16px' },
                          children: slides.map((_, idx) => ({
                            type: 'div',
                            props: {
                              style: {
                                width: i === idx ? '64px' : '24px',
                                height: '12px',
                                borderRadius: '6px',
                                backgroundColor: i === idx ? '#818cf8' : 'rgba(255,255,255,0.2)',
                              }
                            }
                          }))
                        }
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: '32px', fontWeight: 500, color: '#94a3b8' },
                          children: `0${i + 1} / 0${slides.length}`
                        }
                      }
                    ]
                  }
                }
              ]
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
      ],
    });

    const resvg = new Resvg(svg, {
      background: 'rgba(15, 23, 42, 1)',
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

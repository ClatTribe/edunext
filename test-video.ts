import { generateSceneAudio, renderSceneVideo } from './src/app/lib/social-automation/video-generator';
import { getManualScenes } from './src/app/lib/social-automation/manual-content';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  console.log('Generating FULL length Gen-Z video...');
  
  const { scenes: allScenes } = getManualScenes();
  const scenes = allScenes; // Using all scenes for 20-25s duration
  const narrations = scenes.map(s => s.narration);
  
  console.log('Generating TTS...');
  const { audioUrl, sceneDurations, totalDuration } = await generateSceneAudio(narrations);
  
  const tempAudioDir = path.join(process.cwd(), 'public', 'temp-audio');
  if (!fs.existsSync(tempAudioDir)) fs.mkdirSync(tempAudioDir, { recursive: true });
  
  const audioName = `test_narration_${Date.now()}.mp3`;
  const audioAbs = path.join(tempAudioDir, audioName);
  const base64Data = audioUrl.split(';base64,').pop();
  if (base64Data) {
    fs.writeFileSync(audioAbs, Buffer.from(base64Data, 'base64'));
  }
  
  const baseImgs = [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?q=80&w=1080&auto=format&fit=crop'
  ];
  const imageUrls = scenes.map((_, i) => baseImgs[i % baseImgs.length]);
  
  console.log('Rendering video...');
  const outDir = path.join(process.cwd(), 'public');
  const videoPath = await renderSceneVideo({
    scenes,
    imageUrls,
    sceneDurations,
    audioRelPath: `temp-audio/${audioName}`,
    totalDuration,
    outputDir: outDir
  });
  
  const finalPath = path.join(outDir, 'test-video.mp4');
  fs.copyFileSync(videoPath, finalPath);
  
  console.log('Done! Video saved to:', finalPath);
}

run();

// src/app/lib/social-automation/tavus-api.ts
//
// Thin wrapper around the Tavus v2 Video Generation API.
// Free "Basic" plan: ~5 min of video generation / month, 41 stock replicas.
// Supports BOTH:
//   - script mode  : Tavus speaks the text in the replica's own voice
//   - audio mode   : Tavus lip-syncs the replica to an audio file you provide
//                    (we use this to keep our Edge-TTS "Neerja" voice + exact length)
// Docs: https://docs.tavus.io/

const TAVUS_BASE = 'https://tavusapi.com/v2';

export interface TavusReadyVideo {
  status: string;
  downloadUrl?: string;
  hostedUrl?: string;
  streamUrl?: string;
  durationInSeconds?: number;
}

export interface TavusGenerateParams {
  replicaId: string;
  videoName: string;
  script?: string;     // text -> Tavus TTS voice
  audioUrl?: string;   // public mp3 url -> replica lip-syncs to YOUR voice
  backgroundUrl?: string;
}

/**
 * Kicks off a Tavus talking-head generation (script OR audio driven).
 * Returns the video_id (used for polling) and the hosted preview URL.
 */
export async function generateTavusVideo(
  apiKey: string,
  params: TavusGenerateParams
): Promise<{ videoId: string; hostedUrl?: string }> {
  const body: Record<string, unknown> = {
    replica_id: params.replicaId,
    video_name: params.videoName,
  };
  if (params.audioUrl) body.audio_url = params.audioUrl;
  else if (params.script) body.script = params.script;
  if (params.backgroundUrl) body.background_url = params.backgroundUrl;

  const res = await fetch(`${TAVUS_BASE}/videos`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.error || !data.video_id) {
    console.error('Tavus create error:', JSON.stringify(data));
    throw new Error(
      'Tavus API error creating video: ' +
        (data.error || data.message || JSON.stringify(data))
    );
  }

  console.log('Tavus: video queued. video_id =', data.video_id, '| mode =', params.audioUrl ? 'audio' : 'script');
  return { videoId: data.video_id, hostedUrl: data.hosted_url };
}

/**
 * Polls a Tavus video until it is "ready", then returns its URLs + duration.
 * Default: up to 60 attempts x 10s = 10 minutes max wait.
 */
export async function pollTavusVideo(
  apiKey: string,
  videoId: string,
  maxAttempts = 45,   // ~6 min max (healthy jobs finish in 1-3 min) — fail faster if stuck
  intervalMs = 8000
): Promise<TavusReadyVideo> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${TAVUS_BASE}/videos/${videoId}`, {
      headers: { 'x-api-key': apiKey },
    });
    const data = await res.json();
    const status = data.status as string;
    console.log(`Tavus status [${i + 1}/${maxAttempts}]:`, status);

    if (status === 'ready') {
      return {
        status,
        downloadUrl: data.download_url,
        hostedUrl: data.hosted_url,
        streamUrl: data.stream_url,
        durationInSeconds:
          typeof data.duration === 'number' ? data.duration : undefined,
      };
    }

    if (status === 'error' || status === 'failed' || status === 'deleted') {
      console.error('Tavus generation failed:', JSON.stringify(data));
      throw new Error('Tavus generation failed with status: ' + status);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error('Tavus video generation timed out.');
}

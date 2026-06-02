import { google } from 'googleapis';
import * as fs from 'fs';

/**
 * Uploads a local MP4 video file to YouTube Shorts.
 * Note: YouTube determines if a video is a "Short" based on its aspect ratio (vertical)
 * and duration (< 60 seconds). Adding #Shorts in the description helps indexing.
 */
export async function uploadToYouTubeShorts(
  videoPath: string,
  title: string,
  description: string,
  tags: string[] = []
): Promise<string> {
  const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
  const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing YouTube OAuth credentials in environment variables.');
  }

  // Initialize the OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  // Set the refresh token so it can auto-generate access tokens
  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });

  const fileSize = fs.statSync(videoPath).size;

  console.log(`Starting YouTube upload for video: ${title}`);

  try {
    const res = await youtube.videos.insert(
      {
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: title.substring(0, 100), // Max length for title is 100 chars
            description: `${description}\n\n#Shorts #EduNext`,
            tags: tags,
            categoryId: '27', // 27 = Education category
          },
          status: {
            privacyStatus: 'public', // Set to public to publish immediately
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      },
      {
        onUploadProgress: (evt) => {
          if (evt.bytesRead) {
            const progress = (evt.bytesRead / fileSize) * 100;
            console.log(`YouTube upload progress: ${Math.round(progress)}%`);
          }
        },
      }
    );

    if (res.data && res.data.id) {
      const shortUrl = `https://www.youtube.com/shorts/${res.data.id}`;
      console.log(`YouTube Shorts upload successful! URL: ${shortUrl}`);
      return shortUrl;
    } else {
      throw new Error('Upload succeeded but no video ID was returned.');
    }
  } catch (error: any) {
    console.error('Error during YouTube video upload:', error.message || error);
    throw error;
  }
}

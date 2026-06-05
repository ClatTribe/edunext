

/**
 * Publishes a Carousel to Instagram using the official Graph API.
 * 
 * @param igUserId The Instagram Business Account ID
 * @param accessToken The Meta Long-Lived Access Token
 * @param imageUrls Array of public URLs to the carousel images
 * @param caption The caption for the post
 */
export async function publishInstagramCarousel(
  igUserId: string,
  accessToken: string,
  imageUrls: string[],
  caption: string
) {
  const containerIds: string[] = [];

  // Step 1: Create item containers for each image
  console.log('Graph API: Creating item containers for Carousel...');
  for (const url of imageUrls) {
    const res = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(url)}&is_carousel_item=true&access_token=${accessToken}`, {
      method: 'POST'
    });
    const data = await res.json();
    if (data.error) {
      console.error('Error creating item container:', data.error);
      throw new Error('Graph API Error: ' + data.error.message);
    }
    containerIds.push(data.id);
  }

  // Step 2: Create the main carousel container
  console.log('Graph API: Creating main Carousel container...', containerIds);
  const creationUrl = `https://graph.facebook.com/v19.0/${igUserId}/media?media_type=CAROUSEL&caption=${encodeURIComponent(caption)}&children=${containerIds.join(',')}&access_token=${accessToken}`;
  
  const creationRes = await fetch(creationUrl, { method: 'POST' });
  const creationData = await creationRes.json();
  
  if (creationData.error) {
    console.error('Error creating carousel container:', creationData.error);
    throw new Error('Graph API Error: ' + creationData.error.message);
  }
  
  const creationId = creationData.id;

  // Step 3: Publish the carousel with retry logic (Meta takes time to process images)
  console.log('Graph API: Publishing Carousel...');
  const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`;
  
  let publishData: any;
  let retries = 0;
  while (retries < 6) {
    const publishRes = await fetch(publishUrl, { method: 'POST' });
    publishData = await publishRes.json();
    
    if (publishData.error) {
      // 9007 / 2207027 = Media not ready
      if (publishData.error.code === 9007 || publishData.error.error_subcode === 2207027) {
        console.log(`Media not ready, waiting 5 seconds... (Attempt ${retries + 1}/6)`);
        await new Promise(res => setTimeout(res, 5000));
        retries++;
      } else {
        console.error('Error publishing carousel:', publishData.error);
        throw new Error('Graph API Error: ' + publishData.error.message);
      }
    } else {
      break; // Success!
    }
  }

  if (publishData?.error) {
    throw new Error('Graph API Error after retries: ' + publishData.error.message);
  }

  console.log('Graph API: Successfully published! Post ID:', publishData.id);
  return publishData.id;
}

/**
 * Publishes a Video Reel to Instagram using the official Graph API.
 * 
 * @param igUserId The Instagram Business Account ID
 * @param accessToken The Meta Long-Lived Access Token
 * @param videoUrl Public URL to the mp4 video (e.g. Supabase Storage URL)
 * @param caption The caption for the post
 */
export async function publishInstagramReel(
  igUserId: string,
  accessToken: string,
  videoUrl: string,
  caption: string
) {
  // Step 1: Create Reel container
  console.log('Graph API: Creating Reel container...');
  const creationUrl = `https://graph.facebook.com/v19.0/${igUserId}/media?media_type=REELS&video_url=${encodeURIComponent(videoUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`;
  
  const creationRes = await fetch(creationUrl, { method: 'POST' });
  const creationData = await creationRes.json();
  
  if (creationData.error) {
    console.error('Error creating reel container:', creationData.error);
    throw new Error('Graph API Error: ' + creationData.error.message);
  }
  
  const creationId = creationData.id;

  // Step 2: Wait for Meta to process the video
  console.log('Graph API: Waiting for Meta to process the video...');
  let isReady = false;
  let attempts = 0;
  while (!isReady && attempts < 40) {
    await new Promise(res => setTimeout(res, 5000)); // wait 5 seconds
    const statusRes = await fetch(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${accessToken}`);
    const statusData = await statusRes.json();
    console.log('Status:', statusData.status_code);
    if (statusData.status_code === 'FINISHED') {
      isReady = true;
    } else if (statusData.status_code === 'ERROR') {
      throw new Error('Meta failed to process the video.');
    }
    attempts++;
  }

  if (!isReady) throw new Error('Video processing timed out on Meta side.');

  // Step 3: Publish the reel
  console.log('Graph API: Publishing Reel...');
  const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`;
  
  const publishRes = await fetch(publishUrl, { method: 'POST' });
  const publishData = await publishRes.json();
  
  if (publishData.error) {
    console.error('Error publishing reel:', publishData.error);
    throw new Error('Graph API Error: ' + publishData.error.message);
  }

  console.log('Graph API: Successfully published REEL! Post ID:', publishData.id);
  return publishData.id;
}

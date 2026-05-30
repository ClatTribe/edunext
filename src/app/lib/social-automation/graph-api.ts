

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

  // Step 3: Publish the carousel
  console.log('Graph API: Publishing Carousel...');
  const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`;
  
  const publishRes = await fetch(publishUrl, { method: 'POST' });
  const publishData = await publishRes.json();
  
  if (publishData.error) {
    console.error('Error publishing carousel:', publishData.error);
    throw new Error('Graph API Error: ' + publishData.error.message);
  }

  console.log('Graph API: Successfully published! Post ID:', publishData.id);
  return publishData.id;
}

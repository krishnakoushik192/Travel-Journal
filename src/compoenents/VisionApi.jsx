import RNFS from 'react-native-fs';

export const getImageTags = async (images) => {
    console.log('Fetching tags for images:', images);
  if (!images || images.length === 0) {
    console.log('No images provided for tagging');
    return [];
  }

  const apiKey = 'AIzaSyDRI_aEJaT6ZNZrCW_GHKXo-Ydn5XKCyr8';
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  let requests = [];

  for (let image of images) {
    try {
      // Read file as base64
      const base64 = await RNFS.readFile(image.url, 'base64');

      requests.push({
        image: { content: base64 },
        features: [{ type: 'LABEL_DETECTION', maxResults: 5 }]
      });
    } catch (err) {
      console.log(`Error reading image file ${image.path}: ${err}`);
    }
  }

  try {
    const body = JSON.stringify({ requests });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const result = await response.json();
    console.log('Vision API response:', result);

    // Extract tags from Vision API response
    const tags = result.responses.map(res =>
      res.labelAnnotations ? res.labelAnnotations.map(label => label.description) : []
    );
    console.log('Fetched tags:', tags);

    return tags;
  } catch (err) {
    console.log('Error fetching tags:', err);
    return [];
  }
};

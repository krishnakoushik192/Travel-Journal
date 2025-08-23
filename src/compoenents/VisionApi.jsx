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
        features: [{ type: 'LANDMARK_DETECTION', maxResults: 5 }]
      });
    } catch (err) {
      console.log(`Error reading image file ${image.url}: ${err}`);
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

    // Store all landmarks per image in a clean list
    const landmarksPerImage = result.responses.map(res =>
      res.landmarkAnnotations
        ? res.landmarkAnnotations.map(label => label.description)
        : []
    );

    console.log('Landmarks per image:', landmarksPerImage);

    return landmarksPerImage;
  } catch (err) {
    console.log('Error fetching tags:', err);
    return [];
  }
};

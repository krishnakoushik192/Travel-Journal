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
        features: [{ type: 'LANDMARK_DETECTION', maxResults: 5 }, { type: 'LABEL_DETECTION', maxResults: 5 }]
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

    const landmarksPerImage = result.responses.map(res => {
      if (res.landmarkAnnotations && res.landmarkAnnotations.length > 0) {
        return res.landmarkAnnotations.map(label => label.description);
      } else if (res.labelAnnotations && res.labelAnnotations.length > 0) {
        return res.labelAnnotations.map(label => label.description);
      } else {
        return []; // no results at all
      }
    });

    console.log('Landmarks per image:', landmarksPerImage);

    return landmarksPerImage;
  } catch (err) {
    console.log('Error fetching tags:', err);
    return [];
  }
};

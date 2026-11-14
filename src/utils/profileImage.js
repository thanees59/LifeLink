import { Platform } from 'react-native';

const MAX_BASE64_LENGTH = 1500000;

/** Compress a selected photo to a small square JPEG before saving it in SQLite. */
export async function makeProfileImageDataUri(asset) {
  if (Platform.OS === 'web' && asset?.uri && typeof document !== 'undefined') {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Could not read that photo. Please choose another image.'));
      image.src = asset.uri;
    });

    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const cropSize = Math.min(sourceWidth, sourceHeight);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare that photo. Please try another image.');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 512, 512);
    context.drawImage(image, (sourceWidth - cropSize) / 2, (sourceHeight - cropSize) / 2, cropSize, cropSize, 0, 0, 512, 512);
    const dataUri = canvas.toDataURL('image/jpeg', 0.72);
    if (asset.uri.startsWith('blob:')) URL.revokeObjectURL(asset.uri);
    if (dataUri.length > MAX_BASE64_LENGTH) throw new Error('Choose a smaller image.');
    return dataUri;
  }

  if (!asset?.base64) throw new Error('Could not read that photo. Please choose another image.');
  const dataUri = `data:image/jpeg;base64,${asset.base64}`;
  if (dataUri.length > MAX_BASE64_LENGTH) throw new Error('Choose a smaller image.');
  return dataUri;
}

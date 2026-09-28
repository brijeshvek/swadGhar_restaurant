const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Ensures an Unsplash image URL has fm=webp and optimal query parameters
 * @param {string} url 
 * @returns {string}
 */
const optimizeUnsplashUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('images.unsplash.com')) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('fm', 'webp');
    if (!parsed.searchParams.has('auto')) {
      parsed.searchParams.set('auto', 'format');
    }
    if (!parsed.searchParams.has('fit')) {
      parsed.searchParams.set('fit', 'crop');
    }
    if (!parsed.searchParams.has('q')) {
      parsed.searchParams.set('q', '80');
    }
    return parsed.toString();
  } catch (e) {
    // If not a standard URL, append or replace fm
    if (url.includes('fm=')) {
      return url.replace(/fm=[a-zA-Z0-9]+/, 'fm=webp');
    }
    return url.includes('?') ? `${url}&fm=webp` : `${url}?auto=format&fit=crop&w=800&q=80&fm=webp`;
  }
};

/**
 * Converts a Base64 data URI string or Buffer to WebP format Base64 Data URI
 * @param {string} base64String - Data URI (e.g. data:image/jpeg;base64,...)
 * @param {object} options - { maxWidth: 1200, quality: 80 }
 * @returns {Promise<string>} WebP Data URI (data:image/webp;base64,...)
 */
const convertBase64ToWebp = async (base64String, options = {}) => {
  if (!base64String || typeof base64String !== 'string') {
    return base64String;
  }

  // Check if it is a Base64 image
  const matches = base64String.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return optimizeUnsplashUrl(base64String);
  }

  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const maxWidth = options.maxWidth || 1200;
  const quality = options.quality || 80;

  try {
    const webpBuffer = await sharp(buffer)
      .resize({
        width: maxWidth,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
  } catch (error) {
    console.error('[ImageOptimizer] Error converting base64 to webp:', error.message);
    return base64String;
  }
};

/**
 * Converts any input image (Base64 or URL) to WebP format
 * @param {string} imageInput 
 * @param {object} options 
 * @returns {Promise<string>}
 */
const processImageToWebp = async (imageInput, options = {}) => {
  if (!imageInput || typeof imageInput !== 'string') return imageInput;

  if (imageInput.startsWith('data:image')) {
    return await convertBase64ToWebp(imageInput, options);
  }

  if (imageInput.includes('images.unsplash.com')) {
    return optimizeUnsplashUrl(imageInput);
  }

  return imageInput;
};

/**
 * Converts a locally saved file to .webp format on disk and deletes the original if extension differs.
 * @param {string} localFilePath - Full path to uploaded file
 * @param {object} options - { maxWidth: 1200, quality: 80 }
 * @returns {Promise<{ filename: string, relativeUrl: string, fullPath: string }>}
 */
const convertLocalFileToWebp = async (localFilePath, options = {}) => {
  const maxWidth = options.maxWidth || 1200;
  const quality = options.quality || 80;

  const parsed = path.parse(localFilePath);
  const webpFilename = `${parsed.name}.webp`;
  const webpFullPath = path.join(parsed.dir, webpFilename);

  // If already a webp file, optimize it in place (or via temp file)
  if (parsed.ext.toLowerCase() === '.webp') {
    const tempPath = path.join(parsed.dir, `temp-${webpFilename}`);
    await sharp(localFilePath)
      .resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality, effort: 4 })
      .toFile(tempPath);

    fs.unlinkSync(localFilePath);
    fs.renameSync(tempPath, webpFullPath);
  } else {
    // Convert to webp
    await sharp(localFilePath)
      .resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality, effort: 4 })
      .toFile(webpFullPath);

    // Remove the original non-webp file
    if (fs.existsSync(localFilePath) && localFilePath !== webpFullPath) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.warn('[ImageOptimizer] Failed to delete original file:', err.message);
      }
    }
  }

  return {
    filename: webpFilename,
    relativeUrl: `/uploads/${webpFilename}`,
    fullPath: webpFullPath,
  };
};

module.exports = {
  optimizeUnsplashUrl,
  convertBase64ToWebp,
  processImageToWebp,
  convertLocalFileToWebp,
};

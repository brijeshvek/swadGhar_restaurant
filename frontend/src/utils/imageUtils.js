/**
 * Converts a selected image File into an optimized WebP Base64 Data URI string.
 * Resizes excessive dimensions while maintaining high visual quality.
 *
 * @param {File} file - The image file selected by user
 * @param {number} maxWidth - Maximum allowable width in px (default: 1200)
 * @param {number} quality - WebP compression quality from 0 to 1 (default: 0.85)
 * @returns {Promise<string>} WebP Base64 Data URL string ('data:image/webp;base64,...')
 */
export const convertFileToBase64 = (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for WebP conversion.'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const resultDataUrl = event.target.result;
      const img = new Image();
      img.src = resultDataUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if width exceeds max
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // Smooth image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP format with compression quality
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          
          // Verify browser supports WebP canvas export
          if (webpDataUrl.startsWith('data:image/webp')) {
            resolve(webpDataUrl);
          } else {
            // Fallback to jpeg if webp canvas not supported in old browser
            const fallbackString = canvas.toDataURL('image/jpeg', quality);
            resolve(fallbackString);
          }
        } catch (canvasErr) {
          console.warn('Canvas optimization fallback to raw Base64:', canvasErr);
          resolve(resultDataUrl);
        }
      };

      img.onerror = () => {
        // Fallback to raw base64 data url if image object fails
        resolve(resultDataUrl);
      };
    };

    reader.onerror = (err) => {
      reject(err);
    };
  });
};

/**
 * Converts a selected image File into an optimized Base64 Data URI string.
 * Resizes excessive dimensions while maintaining high visual quality.
 *
 * @param {File} file - The image file selected by user
 * @param {number} maxWidth - Maximum allowable width in px (default: 1200)
 * @param {number} quality - JPEG compression quality from 0 to 1 (default: 0.85)
 * @returns {Promise<string>} Base64 Data URL string ('data:image/jpeg;base64,...')
 */
export const convertFileToBase64 = (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for Base64 conversion.'));
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

          // Get optimized Base64 data URL
          const base64String = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
          resolve(base64String);
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

/**
 * Advanced image compression with quality preservation
 * @param {File} file - Image file from input
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - {base64, thumbnail, dimensions}
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,           // Higher quality (was 1200)
      maxHeight = 1920,
      quality = 0.92,            // Higher quality (was 0.8)
      outputFormat = 'image/jpeg',
      createThumbnail = true     // Create small preview for fast loading
    } = options;

    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image size must be less than 10MB'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = async () => {
        try {
          // Calculate dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const aspectRatio = width / height;

          if (width > height) {
            if (width > maxWidth) {
              width = maxWidth;
              height = Math.round(width / aspectRatio);
            }
          } else {
            if (height > maxHeight) {
              height = maxHeight;
              width = Math.round(height * aspectRatio);
            }
          }

          // Main image (high quality)
          const mainImage = createImageCanvas(img, width, height, quality, outputFormat);

          // Thumbnail (for fast initial load)
          let thumbnail = null;
          if (createThumbnail) {
            const thumbWidth = Math.min(width, 400);
            const thumbHeight = Math.round(thumbWidth / aspectRatio);
            thumbnail = createImageCanvas(img, thumbWidth, thumbHeight, 0.7, outputFormat);
          }

          resolve({
            base64: mainImage,
            thumbnail: thumbnail,
            dimensions: { width, height },
            originalSize: file.size
          });
        } catch (error) {
          reject(new Error('Compression failed: ' + error.message));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Create optimized canvas with better quality
 */
const createImageCanvas = (img, width, height, quality, format) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { alpha: format === 'image/png' });

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Use better scaling algorithm for quality
  if (width < img.width || height < img.height) {
    // Step-down scaling for better quality
    const steps = Math.ceil(Math.log2(Math.max(img.width / width, img.height / height)));
    let tempCanvas = canvas;
    let tempCtx = ctx;
    let tempWidth = img.width;
    let tempHeight = img.height;

    for (let i = 0; i < steps; i++) {
      const ratio = Math.pow(0.5, steps - i);
      const newWidth = Math.max(width, Math.floor(img.width * ratio));
      const newHeight = Math.max(height, Math.floor(img.height * ratio));

      if (i === steps - 1) {
        tempCanvas = canvas;
        tempCtx = ctx;
        tempWidth = width;
        tempHeight = height;
      } else {
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
      }

      tempCtx.drawImage(i === 0 ? img : tempCanvas, 0, 0, tempWidth, tempHeight);
      tempWidth = newWidth;
      tempHeight = newHeight;
    }
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }

  return canvas.toDataURL(format, quality);
};

/**
 * Generate blur placeholder (tiny base64 for instant load)
 */
export const generateBlurPlaceholder = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Very small size (10px wide)
        const aspectRatio = img.width / img.height;
        canvas.width = 10;
        canvas.height = Math.round(10 / aspectRatio);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.1));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Preload image for smooth display
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate image file
 */
export const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image must be less than 10MB' };
  }

  return { valid: true };
};

/**
 * Calculate compression ratio
 */
export const getCompressionRatio = (originalSize, compressedBase64) => {
  const compressedSize = Math.round((compressedBase64.length * 3) / 4);
  const ratio = ((originalSize - compressedSize) / originalSize) * 100;
  return {
    originalSize,
    compressedSize,
    savedPercentage: Math.round(ratio)
  };
};
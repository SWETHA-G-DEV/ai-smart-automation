import { PhotoQualityResult } from '../types';

/**
 * Analyzes an image for passport photo quality requirements:
 * 1. Resolution (min 300x400 px recommended)
 * 2. Sharpness / Blurriness using Laplacian edge variance
 * 3. Brightness & exposure using perceived luminance
 * 4. Aspect ratio & cropping
 */
export async function analyzePhotoQuality(imageSource: string | File): Promise<PhotoQualityResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const aspectRatio = Number((width / height).toFixed(2));

        // Create canvas to read pixel data
        // For performance and consistent metrics, scale large images to max 600px width
        const sampleWidth = Math.min(width, 600);
        const sampleHeight = Math.round((height / width) * sampleWidth);

        const canvas = document.createElement('canvas');
        canvas.width = sampleWidth;
        canvas.height = sampleHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
        const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
        const data = imageData.data;

        // 1. Calculate Average Brightness (Luminance)
        let totalLuminance = 0;
        const pixelCount = sampleWidth * sampleHeight;
        const grayPixels = new Float32Array(pixelCount);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Rec. 601 perceived luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += lum;
          grayPixels[i / 4] = lum;
        }

        const avgBrightness = (totalLuminance / pixelCount / 255) * 100;

        // 2. Calculate Sharpness / Blur using discrete Laplacian filter
        // Kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0]
        let laplacianSum = 0;
        let laplacianSqSum = 0;
        let edgePixelCount = 0;

        for (let y = 1; y < sampleHeight - 1; y++) {
          for (let x = 1; x < sampleWidth - 1; x++) {
            const idx = y * sampleWidth + x;
            const top = (y - 1) * sampleWidth + x;
            const bottom = (y + 1) * sampleWidth + x;
            const left = y * sampleWidth + (x - 1);
            const right = y * sampleWidth + (x + 1);

            const lap =
              grayPixels[top] +
              grayPixels[bottom] +
              grayPixels[left] +
              grayPixels[right] -
              4 * grayPixels[idx];

            laplacianSum += lap;
            laplacianSqSum += lap * lap;
            edgePixelCount++;
          }
        }

        const laplacianMean = laplacianSum / edgePixelCount;
        const laplacianVariance = laplacianSqSum / edgePixelCount - laplacianMean * laplacianMean;

        // Map variance to a 0 - 100 score (typical blurry images have variance < 80, sharp > 300)
        // Normalize logarithmically for natural perceptual feel
        const normalizedSharpness = Math.min(100, Math.max(10, Math.round((Math.sqrt(Math.max(0, laplacianVariance)) / 25) * 100)));

        // 3. Flags
        const isBlurry = normalizedSharpness < 55;
        const isLowBrightness = avgBrightness < 35;
        const isOverExposed = avgBrightness > 85;
        const isLowResolution = width < 300 || height < 350;
        // Standard passport photo is 35mm x 45mm (approx 0.77:1) or 1:1 square
        const isExcessivelyCropped = aspectRatio < 0.55 || aspectRatio > 1.35;

        // 4. Overall Score calculation (out of 100)
        let score = 100;

        // Sharpness penalty (up to 40 pts)
        if (isBlurry) {
          score -= Math.min(40, Math.round((55 - normalizedSharpness) * 1.0));
        }

        // Brightness penalty (up to 25 pts)
        if (isLowBrightness) {
          score -= Math.min(25, Math.round((35 - avgBrightness) * 1.5));
        } else if (isOverExposed) {
          score -= Math.min(25, Math.round((avgBrightness - 85) * 1.6));
        }

        // Resolution penalty (up to 20 pts)
        if (isLowResolution) {
          const resRatio = Math.min(width / 300, height / 350);
          score -= Math.min(20, Math.round((1 - resRatio) * 20));
        }

        // Aspect ratio penalty (up to 15 pts)
        if (isExcessivelyCropped) {
          score -= 15;
        }

        score = Math.max(15, Math.min(100, Math.round(score)));

        // 5. Suggestions
        const suggestions: string[] = [];
        if (isBlurry) {
          suggestions.push('Photo appears blurry. Hold camera steady or place device on a stable surface with good lighting.');
        }
        if (isLowBrightness) {
          suggestions.push('Photo is too dark. Take the picture facing natural light or well-lit indoor lighting.');
        }
        if (isOverExposed) {
          suggestions.push('Photo has strong glare or overexposure. Avoid direct flash directly into the lens.');
        }
        if (isLowResolution) {
          suggestions.push(`Image resolution (${width}x${height}px) is low. Upload a photo of at least 300x400 pixels.`);
        }
        if (isExcessivelyCropped) {
          suggestions.push(`Aspect ratio (${aspectRatio}:1) is unusual. Passport photos should be portrait oriented (approx 3.5cm x 4.5cm or square).`);
        }
        if (suggestions.length === 0) {
          suggestions.push('Photo meets standard passport admission criteria. Clear focus, balanced lighting, and correct dimensions.');
        }

        resolve({
          score,
          blurScore: normalizedSharpness,
          brightness: Math.round(avgBrightness),
          resolution: { width, height },
          aspectRatio,
          isBlurry,
          isLowBrightness,
          isOverExposed,
          isLowResolution,
          isExcessivelyCropped,
          suggestions,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for quality analysis: ' + err));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file for image processing'));
      reader.readAsDataURL(imageSource);
    }
  });
}

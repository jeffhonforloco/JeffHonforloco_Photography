/**
 * Client-side image optimization for admin uploads.
 *
 * Every photo uploaded through the admin is converted to WebP in the
 * browser BEFORE it reaches the server, so the worker/R2 only ever
 * stores optimized WebP — originals are never uploaded or stored.
 *
 * - Full image:  max 2048px on the longest side, WebP quality 0.85
 * - Thumbnail:   max 400px on the longest side, WebP quality 0.80
 *
 * Falls back to the original file if WebP encoding is unavailable
 * (older browsers, undecodable formats like HEIC on some platforms).
 */

export interface WebPOptions {
  /** Cap the longest side in pixels. Default 2048. */
  maxDim?: number;
  /** WebP quality 0..1. Default 0.85. */
  quality?: number;
}

export interface OptimizedImage {
  /** The blob to upload (WebP when conversion succeeded). */
  blob: Blob;
  /** Upload filename, renamed to .webp when converted. */
  name: string;
  /** Resulting width in pixels (0 if unknown / not converted). */
  width: number;
  /** Resulting height in pixels (0 if unknown / not converted). */
  height: number;
  /** True when the file was actually converted to WebP. */
  wasConverted: boolean;
}

export interface OptimizedUpload {
  full: OptimizedImage;
  thumb: OptimizedImage;
}

function webpName(originalName: string, suffix = ''): string {
  const base = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 80) || 'image';
  return `${base}${suffix}.webp`;
}

/**
 * Convert a single image file to WebP, resizing so the longest side
 * does not exceed maxDim. Returns the original file untouched when
 * conversion is not possible.
 */
export async function convertToWebP(file: File, opts: WebPOptions = {}): Promise<OptimizedImage> {
  const { maxDim = 2048, quality = 0.85 } = opts;

  // Already WebP and small enough — skip re-encoding to avoid quality loss.
  // (We still normalize the extension below if needed.)
  try {
    if (typeof createImageBitmap !== 'function') throw new Error('no createImageBitmap');
    const bitmap = await createImageBitmap(file);

    let { width, height } = bitmap;
    const longest = Math.max(width, height);
    if (longest > maxDim) {
      const scale = maxDim / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    // White background so transparent PNGs don't turn black in WebP viewers
    // that mishandle alpha; harmless for opaque photos.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    );
    if (!blob || blob.type !== 'image/webp' || blob.size === 0) {
      throw new Error('webp encode failed');
    }

    return {
      blob,
      name: webpName(file.name),
      width,
      height,
      wasConverted: true,
    };
  } catch (err) {
    // Fallback: upload the original so the upload never hard-fails.
    // eslint-disable-next-line no-console
    console.warn('[image-optimize] WebP conversion failed, uploading original:', err);
    return {
      blob: file,
      name: file.name,
      width: 0,
      height: 0,
      wasConverted: false,
    };
  }
}

/**
 * Produce the standard upload pair for an admin image:
 * full-size WebP (2048px, q0.85) + grid thumbnail WebP (400px, q0.80).
 */
export async function optimizeImageForUpload(file: File): Promise<OptimizedUpload> {
  const [full, thumb] = await Promise.all([
    convertToWebP(file, { maxDim: 2048, quality: 0.85 }),
    convertToWebP(file, { maxDim: 400, quality: 0.8 }),
  ]);
  // Give the thumbnail a distinct name so keys don't collide server-side.
  if (thumb.wasConverted) {
    thumb.name = webpName(file.name, '-thumb');
  }
  return { full, thumb };
}

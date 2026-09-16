/**
 * YouTube URL helpers — used by the portfolio admin to accept YouTube links
 * for "motion" items and render their thumbnails.
 */

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?[^#]*v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/,
];

export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

/** Extract the 11-char video id from a YouTube URL, or null. */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  for (const re of YT_PATTERNS) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

type YtThumbQuality = 'default' | 'mq' | 'hq' | 'high' | 'sd' | 'max';

/** Public thumbnail URL for a YouTube video id. */
export function getYouTubeThumbnail(videoId: string, quality: YtThumbQuality = 'hq'): string {
  const q = quality === 'high' ? 'hqdefault' : quality === 'default' ? 'default' : `${quality}default`;
  return `https://i.ytimg.com/vi/${videoId}/${q}.jpg`;
}

/** Embed URL for a YouTube video id (for iframe players). */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

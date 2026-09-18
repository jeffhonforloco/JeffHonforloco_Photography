/**
 * Per-image focal points for journal imagery.
 *
 * Journal cards, heroes, and sliders crop photos into wide frames
 * (16:10 cards, full-bleed heroes). A single crop anchor cuts heads off
 * some photos while working fine for others, so each photo that needs it
 * gets its own object-position. Anything not listed keeps the default
 * center crop, which suits the wedding/engagement scenics.
 *
 * Keys are unique substrings of the image URL so encoding differences
 * (e.g. %2F vs /) don't matter.
 */
const FOCAL_POINTS: Array<[substring: string, position: string]> = [
  // Tight headshots — face fills the top of the frame
  ['f8neayar', '50% 0%'],
  ['headshot-client-1', '50% 0%'],
  ['headshot-client-2', '50% 0%'],
  ['headshot-client-3', '50% 0%'],
  ['IMG_7757', '50% 0%'],
  ['IMG_7794', '50% 0%'],
  // Sweet 16 portraits — celebrant's head near the top
  ['jailyn-sweet16-outdoor', '50% 0%'],
  ['jailyn-sweet16-indoor', '50% 0%'],
  // Bridge couple portrait — heads in the upper third
  ['i5vfbpg4', '50% 15%'],
];

/**
 * Returns the CSS object-position that keeps the subject's head in frame
 * for a journal image URL. Defaults to '50% 50%' (center).
 */
export function journalImagePosition(src: string | undefined | null): string {
  if (!src) return '50% 50%';
  for (const [substring, position] of FOCAL_POINTS) {
    if (src.includes(substring)) return position;
  }
  return '50% 50%';
}

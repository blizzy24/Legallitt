// Home video carousel (design/145 and design/146).
//
// ─────────────────────────────────────────────────────────────────────────────
// THESE ARE STATIC PLACEHOLDERS. There is no player, no video library and no
// content source — see the scope note at the top of components/VideoCarousel.tsx.
//
// REPORTED — THE DESIGN'S PAGER DRAWS FIVE DOTS on both design/145 and design/146,
// but only TWO thumbnails exist across the two files. Five dots implies five videos
// and nobody has said what the other three are. The carousel is built with the two
// drawn items and a pager that follows the real count, so the dots never promise
// content that is not there.
//
// REPORTED — design/145's thumbnail is The Law Society of New South Wales' "What is
// the Rule of Law?", an Australian bar association's video. It is placeholder art in
// a mock-up, but if it reached a build it would be another organisation's content
// and branding shipped inside the product. The real videos need to be Legalitt's own
// or properly licensed.
// ─────────────────────────────────────────────────────────────────────────────

export type HomeVideo = {
  id: string;
  /** Shown in the accessibility label; no title is drawn on the card. */
  title: string;
  /** Asset key — see ASSET_REQUESTS below. */
  thumbnail: string;
};

export const HOME_VIDEOS: HomeVideo[] = [
  { id: 'rule-of-law', title: 'What is the Rule of Law?', thumbnail: 'home-video-1' },
  { id: 'rule-by-law', title: 'Rule of Law vs Rule by Law', thumbnail: 'home-video-2' },
];

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * IMAGES THIS CAROUSEL NEEDS — neither exists, so both render as neutral blocks at
 * exactly the drawn size. Dropping real art in changes no layout.
 *
 *   home-video-1   350 x 165 pt   (700 x 330 at 2x, 1050 x 495 at 3x)
 *   home-video-2   350 x 165 pt   same
 *
 * The frame is 350 x 165, an aspect of about 2.12:1 — WIDER than the 16:9 the brief
 * assumed, so 16:9 source art will crop top and bottom. Supply at 2.12:1, or confirm
 * the frame should be 16:9 (350 x 197) instead.
 *
 * This adds to the eleven images already requested for onboarding
 * (data/onboarding.ts), bringing the outstanding list to thirteen.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const HOME_VIDEO_ASSETS = { width: 350, height: 165 };

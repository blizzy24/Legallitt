import { hcPalette } from './highCourt';

/** DEVELOPMENT ONLY — app/dev/index.tsx, the dev screen index. Shared palette only. */
export const devIndex = {
  title: 'Dev screen index',
  routesSuffix: 'routes',
  designPrefix: 'design/',
  bg: hcPalette.page,
  ink: hcPalette.ink,
  muted: hcPalette.inkMuted,
  rule: hcPalette.rail,
  pad: 16,
  groupGap: 20,
  rowGap: 8,
  rowPadY: 8,
  sectionSize: 11,
  sectionSpacing: 0.8,
  hrefSize: 13,
  designSize: 11,
};

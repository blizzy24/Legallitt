import { Platform } from 'react-native';

/**
 * Props that make a one-line Text shrink instead of ellipsizing.
 *
 * react-native-web ignores adjustsFontSizeToFit for sizing but still collapses the
 * Text's box height when it is set, which lets glyphs paint outside fixed-height
 * containers. So it is applied on native only; web relies on the text fitting at
 * its declared size, which every call site is measured to do.
 */
export const shrinkToFit = (minimumFontScale = 0.85) =>
  Platform.OS === 'web' ? {} : { adjustsFontSizeToFit: true as const, minimumFontScale };

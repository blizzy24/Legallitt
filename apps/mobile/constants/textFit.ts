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

/**
 * As shrinkToFit, but also pins the text to a single line. numberOfLines is applied
 * on native only for the same reason: on web the clamp collapses the Text's box.
 * Web instead relies on the declared size fitting, which call sites size for.
 */
export const shrinkToOneLine = (minimumFontScale = 0.85) =>
  Platform.OS === 'web'
    ? {}
    : { numberOfLines: 1, adjustsFontSizeToFit: true as const, minimumFontScale };

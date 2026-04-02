import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Base design width (iPhone 13 = 390)
const BASE_WIDTH = 390;

/**
 * Scale a size relative to screen width.
 * Clamps growth on tablets so things don't get too large.
 */
export const rw = (size) => {
  const scale = SCREEN_W / BASE_WIDTH;
  const scaled = size * Math.min(scale, 1.4);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * Scale font sizes — slightly tighter clamp than rw so fonts don't go huge on tablets.
 */
export const rf = (size) => {
  const scale = SCREEN_W / BASE_WIDTH;
  const scaled = size * Math.min(scale, 1.2);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

/**
 * True on "small" phones (< 360dp width, e.g. older Androids, iPhone SE)
 */
export const isSmallScreen = SCREEN_W < 360;

/**
 * True on tablet-sized screens
 */
export const isTablet = SCREEN_W >= 768;

/**
 * Horizontal padding for page content — tighter on small phones
 */
export const PAGE_PADDING = isSmallScreen ? 14 : 20;

/**
 * KeyboardAvoidingView behavior per platform
 */
export const KAV_BEHAVIOR = Platform.OS === 'ios' ? 'padding' : 'height';

export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;

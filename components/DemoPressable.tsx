import { Pressable, type PressableProps } from 'react-native';

import { useDemoAdvance } from '../hooks/useDemoAdvance';
import { previewNotice } from './PreviewNotice';

/**
 * DEMO ONLY (constants/dev.ts DEMO_AUTO_ADVANCE). A Pressable for a primary
 * control the designs draw without a destination: with no onPress of its own it
 * follows data/flowMap.ts (BUTTON_TARGETS first, by accessibilityLabel). It
 * renders exactly as the Pressable it replaces. With the flag off, or no next
 * screen, it shows the preview notice instead.
 */
export default function DemoPressable(props: PressableProps) {
  const { advance, can } = useDemoAdvance();
  const label = typeof props.accessibilityLabel === 'string' ? props.accessibilityLabel : undefined;
  if (props.onPress) return <Pressable {...props} />;
  // Demo mode follows the flow map; otherwise (or with no next screen) the
  // preview notice says the action is not available.
  if (!can(label)) return <Pressable {...props} disabled={false} onPress={() => previewNotice(label)} />;
  return <Pressable {...props} disabled={false} onPress={() => advance(label)} />;
}

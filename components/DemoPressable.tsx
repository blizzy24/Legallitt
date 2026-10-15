import { Pressable, type PressableProps } from 'react-native';

import { useDemoAdvance } from '../hooks/useDemoAdvance';

/**
 * DEMO ONLY (constants/dev.ts DEMO_AUTO_ADVANCE). A Pressable for a primary
 * control the designs draw without a destination: with no onPress of its own it
 * follows data/flowMap.ts (BUTTON_TARGETS first, by accessibilityLabel). It
 * renders exactly as the Pressable it replaces; with the flag off it is inert.
 */
export default function DemoPressable(props: PressableProps) {
  const { advance, can } = useDemoAdvance();
  const label = typeof props.accessibilityLabel === 'string' ? props.accessibilityLabel : undefined;
  if (props.onPress || !can(label)) return <Pressable {...props} />;
  return <Pressable {...props} disabled={false} onPress={() => advance(label)} />;
}

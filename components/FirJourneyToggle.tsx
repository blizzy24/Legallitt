import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DEV_PREVIEW_TOGGLES } from '../constants/dev';
import { colors, firResult as t, font } from '../constants/theme';
import SegmentedControl, { type Segment } from './SegmentedControl';

type FirJourneyState = 'status' | 'ready';

const SEGMENTS: Segment<FirJourneyState>[] = [
  { key: 'status', label: 'Under Review' },
  { key: 'ready', label: 'Draft Ready' },
];

// DEVELOPMENT ONLY — hidden by DEV_PREVIEW_TOGGLES in constants/dev.ts.
//
// app/fir/status.tsx (design/48) and app/fir/ready.tsx (design/49) are two states of
// one journey, but nothing in the prototype advances between them: submitted only
// ever routes to status. This control makes both reachable, the same way the legal
// notice tracking and identity screens expose their delivered states.
export default function FirJourneyToggle({ value }: { value: FirJourneyState }) {
  if (!DEV_PREVIEW_TOGGLES) return null;

  return (
    <View style={styles.toggle}>
      <Text style={styles.label}>Preview state</Text>
      <SegmentedControl
        segments={SEGMENTS}
        value={value}
        onChange={(key) => key !== value && router.replace(key === 'status' ? '/fir/status' : '/fir/ready')}
        style={styles.control}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    marginTop: t.toggleGap,
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: font.appBody,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textMuted,
  },
  control: {
    alignSelf: 'stretch',
  },
});

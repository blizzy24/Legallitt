import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { cases, colors, font, ink } from '../constants/theme';

export type Segment<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
};

// Active / Pending / Closed selector (design/14). The active segment is a filled brand
// pill; the track is a beige rounded container.
export default function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  style,
}: Props<T>) {
  return (
    <View style={[styles.track, style]} role="tablist">
      {segments.map((segment) => {
        const active = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            role="tab"
            aria-selected={active}
            onPress={() => onChange(segment.key)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: cases.segHeight,
    borderRadius: cases.segRadius,
    backgroundColor: cases.segTrack,
    padding: cases.segPad,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  segment: {
    flex: 1,
    minWidth: 0,
    borderRadius: cases.segRadius - cases.segPad,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.brand,
  },
  label: {
    fontFamily: font.appBody,
    fontSize: cases.segLabel,
    color: colors.textBody,
  },
  labelActive: {
    fontFamily: font.appSemi,
    color: ink.onBrand,
  },
});

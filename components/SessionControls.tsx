import { Camera, ChevronRight, Mic, PhoneOff, Video, Volume2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { colors, font, ink, laSession as t } from '../constants/theme';

// The info bar and control row shared by the video and voice consultation screens
// (design/114 and design/115).
//
// EVERY CONTROL IS INERT. These screens are static mock-ups: there is no calling
// SDK, no camera and no microphone anywhere in the app. End-call is the only one
// wired, and only to leave the screen.

type Props = {
  name: string;
  elapsed: string;
  onEnd: () => void;
};

const CONTROLS = [
  { icon: Camera, label: 'Camera' },
  { icon: Mic, label: 'Microphone' },
  { icon: Volume2, label: 'Speaker' },
  { icon: Video, label: 'Flip camera' },
];

export default function SessionControls({ name, elapsed, onEnd }: Props) {
  return (
    <>
      <View style={styles.info}>
        <Text style={styles.infoText} {...shrinkToFit(0.75)}>
          Advocate : {name}
        </Text>
        <View style={styles.recDot} />
        <Text style={styles.time} {...shrinkToFit(0.8)}>
          {elapsed}
        </Text>
        <ChevronRight size={t.infoChevron} color={colors.textPrimary} />
      </View>

      <View style={styles.controls}>
        {CONTROLS.slice(0, 2).map((c) => (
          <Pressable
            key={c.label}
            accessibilityRole="button"
            accessibilityLabel={c.label}
            style={styles.control}
          >
            <c.icon size={t.controlGlyph} color={t.controlGlyphColour} />
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End call"
          onPress={onEnd}
          style={styles.end}
        >
          <PhoneOff size={t.endGlyph} color={ink.onBrand} />
        </Pressable>

        {CONTROLS.slice(2).map((c) => (
          <Pressable
            key={c.label}
            accessibilityRole="button"
            accessibilityLabel={c.label}
            style={styles.control}
          >
            <c.icon size={t.controlGlyph} color={t.controlGlyphColour} />
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  info: {
    minHeight: t.infoHeight,
    borderRadius: t.infoRadius,
    paddingHorizontal: t.infoPadX,
    backgroundColor: t.infoBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.infoSize,
    color: colors.textPrimary,
  },
  recDot: {
    width: t.recDot,
    height: t.recDot,
    borderRadius: t.recDot / 2,
    marginRight: t.recGap,
    backgroundColor: t.recColour,
  },
  time: {
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.timeSize,
    color: colors.textPrimary,
  },
  controls: {
    marginTop: t.controlsGap,
    minHeight: t.controlsHeight,
    borderRadius: t.controlsRadius,
    paddingHorizontal: t.controlsPadX,
    backgroundColor: t.infoBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  control: {
    width: t.control,
    height: t.control,
    borderRadius: t.control / 2,
    backgroundColor: t.controlBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  end: {
    width: t.endCall,
    height: t.endCall,
    borderRadius: t.endCall / 2,
    backgroundColor: t.endBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

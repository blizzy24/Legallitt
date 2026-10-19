import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, payHeader as h, wizard as w } from '../constants/theme';

type Props = {
  title: string;
  subtitle: string;
  /** Centred line under the title block (design/29, 30). */
  intro?: string;
  onBack?: () => void;
  /** design/29 and 30 use 16pt margins; step 6 follows the shell. */
  padX?: number;
};

// Compact header shared by the payment screens (design/28, 29, 30): circular back
// button, left-aligned title and subtitle, optional intro line, full-bleed divider.
export default function PayHeader({ title, subtitle, intro, onBack, padX = w.padX }: Props) {
  const insets = useSafeAreaInsets();
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home')));

  return (
    <View style={[styles.header, { paddingTop: insets.top + h.top, paddingHorizontal: padX }]}>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} style={styles.button}>
          <ArrowLeft size={w.chevronSize - 2} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {intro && <Text style={styles.intro}>{intro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: h.bottom,
    borderBottomWidth: h.divider,
    borderBottomColor: h.dividerColor,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: h.button,
    height: h.button,
    borderRadius: h.button / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: h.buttonGap,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: h.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: font.appBody,
    fontSize: h.subtitleSize,
    color: colors.textBody,
  },
  intro: {
    marginTop: h.introGap,
    alignSelf: 'center',
    maxWidth: h.introMaxWidth,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: h.introSize,
    lineHeight: h.introLineHeight,
    color: colors.textBody,
  },
});

import { router } from 'expo-router';
import { ChevronLeft, CircleCheck, House } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, psChecking as t, psTrack as k } from '../../constants/theme';
import { PS_CHECKING, PS_CHECKING_NOTE } from '../../data/propertySearch';

// What We Are Checking (design/79).
//
// REPORTED — the checklist mixes two different things. "Ownership Verification" is a
// check being performed; the other four — Payment Received, Verification in Progress,
// Report Preparation, Report Delivered — are the tracking timeline's own stages,
// drawn as progress steps on design/78. They are not things being checked. Rendered
// as drawn under the file's heading; see data/propertySearch.ts.

export default function PropertySearchCheckingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + k.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/property-search/track'))}
        >
          <ChevronLeft size={k.backIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder — sized to design/79's artwork box. */}
        <View style={styles.art}>
          <House size={t.art / 3} color={ink.accent} strokeWidth={1.25} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What We Are Checking</Text>
          {PS_CHECKING.map((c) => (
            <View key={c} style={styles.tick}>
              <CircleCheck size={t.tickIcon} color={k.done} />
              <Text style={styles.tickText} {...shrinkToFit(0.8)}>
                {c}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>{PS_CHECKING_NOTE}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <House size={t.tickIcon} color={colors.card} />
          <Text style={styles.buttonLabel}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: t.padX,
  },
  art: {
    marginTop: t.artTop,
    alignSelf: 'center',
    width: t.art,
    height: t.art,
    borderRadius: t.artRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: '#FDF6F4',
    borderWidth: 1,
    borderColor: '#F2E4E0',
    padding: t.cardPad,
  },
  cardTitle: {
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  tick: {
    marginTop: t.tickGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickText: {
    marginLeft: t.tickIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.tickSize,
    color: colors.textPrimary,
  },
  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: '#FDF6F4',
    borderWidth: 1,
    borderColor: '#F2E4E0',
    padding: t.notePad,
  },
  noteText: {
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    marginLeft: t.noteIconGap,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: colors.card,
  },
});

import { useDemoWait } from '../../hooks/useDemoAdvance';
import { router } from 'expo-router';
import { Check, ChevronLeft, FileText, Headset } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, psTrack as t } from '../../constants/theme';
import { PS_REQUEST_ID, PS_STAGES, PS_TRACK_STATUS } from '../../data/propertySearch';

// Track Your Request (design/78).
//
// REPORTED — the file's timestamps read 22–23 May 2026, where every other dated
// screen in the app uses September 2026. Moved to September for consistency; the
// times and the day-apart spacing are kept. See data/propertySearch.ts.

export default function PropertySearchTrackScreen() {
  // DEMO: In Progress waits on the search; demo mode moves on to what we are checking (79).
  useDemoWait();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Track Your Request
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.idCard}>
          <FileText size={t.idValueSize} color={colors.brand} strokeWidth={1.5} />
          <View style={styles.idText}>
            <Text style={styles.idLabel} {...shrinkToFit(0.8)}>
              Request ID
            </Text>
            <Text style={styles.idValue} {...shrinkToFit(0.75)}>
              {PS_REQUEST_ID}
            </Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText} {...shrinkToFit(0.8)}>
              {PS_TRACK_STATUS}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Progress Timeline</Text>

        <View style={styles.timeline}>
          {PS_STAGES.map((s, i) => {
            const last = i === PS_STAGES.length - 1;
            const done = s.state === 'done';
            const active = s.state === 'active';
            return (
              <View key={s.title} style={styles.row}>
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.marker,
                      done && styles.markerDone,
                      active && styles.markerActive,
                    ]}
                  >
                    {done && <Check size={t.markerGlyph} color={ink.onBrand} strokeWidth={3} />}
                    {active && <View style={styles.markerCore} />}
                  </View>
                  {!last && <View style={[styles.line, done && styles.lineDone]} />}
                </View>
                <View style={[styles.body, !last && styles.bodyGap]}>
                  <Text style={styles.itemTitle} {...shrinkToFit(0.8)}>
                    {s.title}
                  </Text>
                  <Text
                    style={[styles.itemDetail, s.state === 'pending' && styles.itemPending]}
                    {...shrinkToFit(0.8)}
                  >
                    {s.detail}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Headset size={t.buttonIcon} color={ink.accent} />
          <Text style={styles.buttonLabel} {...shrinkToFit(0.8)}>
            Contact Support
          </Text>
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
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: t.backIcon,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  idCard: {
    marginTop: t.idGap,
    borderRadius: t.idRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.idPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  idLabel: {
    fontFamily: font.appBody,
    fontSize: t.idLabelSize,
    color: colors.textBody,
  },
  idValue: {
    marginTop: t.idValueGap,
    fontFamily: font.appHeading,
    fontSize: t.idValueSize,
    color: colors.textPrimary,
  },
  chip: {
    marginLeft: 10,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  chipText: {
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    color: t.chipText,
  },
  sectionTitle: {
    marginTop: t.sectionGap,
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  timeline: {
    marginTop: t.timelineTop,
  },
  row: {
    flexDirection: 'row',
  },
  rail: {
    alignItems: 'center',
  },
  marker: {
    width: t.marker,
    height: t.marker,
    borderRadius: t.marker / 2,
    borderWidth: 1.5,
    borderColor: t.pending,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: {
    backgroundColor: t.done,
    borderColor: t.done,
  },
  markerActive: {
    borderWidth: 4,
    borderColor: t.activeRing,
    backgroundColor: colors.card,
  },
  markerCore: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: t.active,
  },
  line: {
    flex: 1,
    width: t.line,
    marginVertical: t.lineGap,
    backgroundColor: t.pending,
  },
  lineDone: {
    backgroundColor: t.done,
  },
  body: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.markerGap,
  },
  bodyGap: {
    marginBottom: t.itemGap,
  },
  itemTitle: {
    fontFamily: font.appHeading,
    fontSize: t.itemTitleSize,
    color: colors.textPrimary,
  },
  itemDetail: {
    marginTop: t.itemTimeGap,
    fontFamily: font.appBody,
    fontSize: t.itemTimeSize,
    color: colors.textBody,
  },
  itemPending: {
    color: t.pendingText,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    borderWidth: 1,
    borderColor: t.buttonBorder,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    marginLeft: t.buttonIconGap,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.accent,
  },
});

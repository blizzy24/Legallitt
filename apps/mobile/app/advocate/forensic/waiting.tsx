import { router, useLocalSearchParams, type Href } from 'expo-router';
import { BadgeCheck, ChevronLeft, Copy, FileUp, FolderSearch, Hourglass, UserRound } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_WAITING } from '../../../data/advocateForensic';
import { advForensicWaiting as t, colors, font, ink } from '../../../constants/theme';

// Waiting for specialist report (design/225).
//
// ⚠ The illustration is a stock drawing (folders, a magnifier, an envelope) that
// is not in the repo and is not specified anywhere. Rendered as a tinted circle
// with a single icon — the same treatment the video screens use for photographs.
//
// ⚠ "Upload report must be filled along with affidavit" is the only statement
// anywhere that the report and affidavit are a required pair; nothing enforces it.

export default function AdvocateForensicWaitingScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const w = DF_WAITING;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.7)}>
          {w.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Placeholder for the drawn illustration — see the note above. */}
        <View style={styles.illo}>
          <FolderSearch size={t.illoGlyph} color={colors.brandDark} />
        </View>

        <View style={styles.chip}>
          <Hourglass size={t.chipIcon} color={t.chipColour} />
          <Text style={styles.chipText} {...shrinkToFit(0.75)}>
            {w.chip}
          </Text>
        </View>

        <Text style={styles.headline} {...shrinkToFit(0.75)}>
          {w.headline}
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.ref} {...shrinkToFit(0.75)}>
              {w.ref}
            </Text>
            <Copy size={t.refIcon} color={colors.textPrimary} style={styles.refIcon} />
            <View style={styles.state}>
              <Text style={styles.stateText} {...shrinkToFit(0.75)}>
                {w.state}
              </Text>
            </View>
          </View>

          <View style={styles.rule} />

          <View style={styles.grid}>
            {w.grid.map((cell) => (
              <View key={cell.label} style={styles.cell}>
                <Text style={styles.gridLabel} {...shrinkToFit(0.8)}>
                  {cell.label}
                </Text>
                <View style={styles.row}>
                  <Text style={styles.gridValue} {...shrinkToFit(0.7)}>
                    {cell.value}
                  </Text>
                  {'tick' in cell && cell.tick && (
                    <BadgeCheck size={t.tick} color={colors.brandDark} style={styles.tick} />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.hint} {...shrinkToFit(0.8)}>
          {w.hint}
        </Text>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/forensic/report?id=${id ?? ''}` as Href)}
          style={({ pressed }) => [styles.upload, pressed && styles.pressed]}
        >
          <FileUp size={t.uploadIcon} color={ink.onBrand} />
          <Text style={styles.uploadText} {...shrinkToFit(0.8)}>
            {w.upload}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/advocate/forensic/df-2026-1048' as Href)}
          style={({ pressed }) => [styles.view, pressed && styles.pressed]}
        >
          <Text style={styles.viewText} {...shrinkToFit(0.8)}>
            {w.view}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24, alignItems: 'stretch' },
  illo: {
    marginTop: t.illoGap,
    alignSelf: 'center',
    width: t.illo,
    height: t.illo,
    borderRadius: t.illo / 2,
    backgroundColor: t.illoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    marginTop: t.chipGap,
    alignSelf: 'center',
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    backgroundColor: t.chipBg,
    paddingHorizontal: t.chipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  chipText: {
    marginLeft: t.chipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    letterSpacing: t.chipSpacing,
    color: t.chipColour,
  },
  headline: { marginTop: t.headlineGap, textAlign: 'center', fontFamily: font.appHeading, fontSize: t.headlineSize, color: colors.textPrimary },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  row: { flexDirection: 'row', alignItems: 'center' },
  ref: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.refSize, color: colors.textPrimary },
  refIcon: { marginLeft: t.refIconGap },
  state: {
    marginLeft: 'auto',
    paddingLeft: 8,
    minHeight: t.stateHeight,
    borderRadius: t.stateRadius,
    backgroundColor: t.stateBg,
    paddingHorizontal: t.statePadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  stateText: { fontFamily: font.appSemi, fontSize: t.stateSize, color: t.stateColour },
  rule: { marginTop: t.ruleGap, height: 1, backgroundColor: t.ruleColour },

  grid: { marginTop: t.gridGap, flexDirection: 'row', flexWrap: 'wrap', rowGap: t.gridGapY },
  cell: { width: '50%' },
  gridLabel: { fontFamily: font.appBody, fontSize: t.gridLabelSize, color: t.gridLabelColour },
  gridValue: { marginTop: t.gridValueGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.gridValueSize, color: colors.textPrimary },
  tick: { marginTop: t.gridValueGap, marginLeft: t.tickGap },

  hint: { marginTop: t.hintGap, textAlign: 'center', fontFamily: font.appBody, fontSize: t.hintSize, color: t.hintColour },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  upload: {
    minHeight: t.uploadHeight,
    borderRadius: t.uploadRadius,
    backgroundColor: t.uploadBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: { marginLeft: t.uploadIconGap, fontFamily: font.appHeading, fontSize: t.uploadSize, color: ink.onBrand, flexShrink: 1 },
  view: {
    marginTop: t.viewGap,
    minHeight: t.viewHeight,
    borderRadius: t.viewRadius,
    backgroundColor: t.viewBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: { fontFamily: font.appHeading, fontSize: t.viewSize, color: colors.textPrimary },
  pressed: { opacity: 0.85 },
});

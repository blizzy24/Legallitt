import { router, type Href } from 'expo-router';
import { Check, ChevronLeft, Info, Lock, ShieldCheck, UserRound } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_REPORT } from '../../../../data/advocateSide';
import { advNoticeReport as t, colors, font, ink } from '../../../../constants/theme';

// Send report (design/203).
//
// ⚠ THE ADVOCATE IS SHOWN THE CLIENT'S PAYMENT AS THEIR PAYOUT. "Advocate Payout
// ₹3,500/-" is the GROSS client fee from design/185, whose own breakdown nets the
// advocate ₹3,087 after a ₹350 platform fee and ₹63 charges. The two screens are
// ₹413 apart on the same journey — and this is the figure the advocate sees last.
// Built as drawn; design/185 still computes the real net via advNoticeFee().

export default function AdvocateNoticeReportScreen() {
  const insets = useSafeAreaInsets();
  const r = ADV_NOTICE_REPORT;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <View style={styles.docChip}>
          <Lock size={t.docChipIcon} color={colors.textPrimary} />
          <Text style={styles.docChipText} {...shrinkToFit(0.8)}>
            {r.docChip}
          </Text>
        </View>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <Check size={t.badgeIcon} color={ink.onBrand} strokeWidth={3} />
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {r.summaryLabel}
            </Text>
            <View style={styles.escrow}>
              <ShieldCheck size={t.escrowIcon} color={t.escrowColour} />
              <Text style={styles.escrowText} {...shrinkToFit(0.75)}>
                {r.escrowChip}
              </Text>
            </View>
          </View>

          {/* ⚠ Gross client fee shown as the advocate's payout; see the note above. */}
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel} {...shrinkToFit(0.75)}>
              {r.payoutLabel}
            </Text>
            <Text style={styles.payout} {...shrinkToFit(0.7)}>
              {r.payout}
            </Text>
          </View>

          <View style={styles.note}>
            <Info size={t.noteIcon} color={colors.textBody} />
            <Text style={styles.noteText}>{r.note}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(advocate)/dashboard' as Href)}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText} {...shrinkToFit(0.8)}>
            {r.back}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  docChip: {
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: t.docChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  docChipText: {
    marginLeft: t.docChipIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.docChipSize,
    color: colors.textPrimary,
  },
  avatar: {
    marginLeft: t.docChipGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 28, alignItems: 'center' },
  badge: {
    marginTop: t.badgeTop,
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignSelf: 'stretch',
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textBody,
  },
  escrow: {
    minHeight: t.escrowHeight,
    borderRadius: t.escrowRadius,
    paddingHorizontal: t.escrowPadX,
    backgroundColor: t.escrowBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  escrowText: {
    marginLeft: t.escrowIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.escrowSize,
    color: t.escrowColour,
  },

  payoutRow: { marginTop: t.payoutGap, flexDirection: 'row', alignItems: 'center' },
  payoutLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.payoutLabelSize,
    color: colors.textPrimary,
  },
  payout: { fontFamily: font.appHeading, fontSize: t.payoutSize, color: colors.textPrimary },

  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
    flexDirection: 'row',
  },
  noteText: {
    marginLeft: t.noteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  back: {
    minHeight: t.backHeight,
    borderRadius: t.backRadius,
    backgroundColor: t.backBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontFamily: font.appHeading, fontSize: t.backSize, color: ink.onBrand },
  pressed: { opacity: 0.85 },
});

import { router, type Href } from 'expo-router';
import { Check, ChevronLeft, Info, Lock, ShieldCheck, UserRound } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import { advNoticeReport as t, colors, font, ink } from '../constants/theme';

// The payout-confirmation screen, shared by design/203 (Legal Notice) and
// design/212 (Property Search Report).
//
// ⚠ IT GENERALISES BECAUSE design/212 IS A COPY OF design/203. Differenced pixel
// by pixel, the two 780×1784 exports are identical except rows 677–715 — the
// payout figure. Same title, same DOC-742 chip, same green check, same PAYMENT
// SUMMARY card, same credit note, same Back To Home button.
//
// ⚠ AND THE COPY IS RIGHT WHERE THE ORIGINAL IS WRONG. design/212 shows ₹3,800,
// which is the payout design/206 states for the property search. design/203 shows
// ₹3,500, which is the GROSS CLIENT FEE from design/185 — whose own breakdown nets
// the advocate ₹3,087 after a ₹350 platform fee and ₹63 of charges. One component,
// two services, and only the Legal Notice one prints the client's money as the
// advocate's. See data/advocateSide.ts.

export type ReportSentCopy = {
  title: string;
  docChip: string;
  summaryLabel: string;
  escrowChip: string;
  payoutLabel: string;
  payout: string;
  note: string;
  back: string;
};

export default function ReportSentScreen({ r }: { r: ReportSentCopy }) {
  const insets = useSafeAreaInsets();

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

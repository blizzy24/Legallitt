import { router, type Href } from 'expo-router';
import {
  BadgeCheck,
  Check,
  FileText,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_ADMIN_SHARED, DF_PAID } from '../../../data/advocateForensic';
import { advForensicPaid as t, colors, font, ink } from '../../../constants/theme';

// Payment received (design/232).
//
// ⚠ THE WALLET IS AN UNSCOPED CAPABILITY THE DESIGNS NOW ASSUME TWICE.
// "₹4,500 added to your Legalitt wallet (WAL-7729)" here, and design/220 pays into
// the same WAL-7729. There is no wallet feature in this app — no balance, no
// ledger, no transactions screen, nothing in the tab bar. These are static
// strings; nothing is built and no balance is implied.
//
// ⚠ THE PAYOUT AGAINST THE FEE. ₹4,500 here; design/223 shows a ₹15,000 Service
// Fee for the same request. A 70% commission if they are the same transaction,
// against 6%, 10%, 14.286%, 15% and 15.56% elsewhere. Both stored as drawn,
// neither computed. See data/advocateForensic.ts.
//
// ⚠ Payment date 19 Oct 2026 is nine days ahead of the app's current date. Left
// visible, not normalised.
//
// The advocate's only affordance here is Back To Home.

export default function AdvocateForensicPaidScreen() {
  const insets = useSafeAreaInsets();
  const p = DF_PAID;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          onPress={() => router.replace('/(advocate)/dashboard' as Href)}
        >
          <X size={t.closeIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {p.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.markHalo}>
          <View style={styles.mark}>
            <Check size={t.markGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
        </View>
        <Text style={styles.headline} {...shrinkToFit(0.75)}>
          {p.headline}
        </Text>
        <Text style={styles.sub}>{p.sub}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.payLabel} {...shrinkToFit(0.8)}>
              {p.payLabel}
            </Text>
            <View style={styles.recv}>
              <Check size={t.recvIcon} color={t.recvColour} strokeWidth={3} />
              <Text style={styles.recvText} {...shrinkToFit(0.8)}>
                {p.recvChip}
              </Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amount} {...shrinkToFit(0.7)}>
              {p.amount}
            </Text>
            <Text style={styles.amountUnit} {...shrinkToFit(0.8)}>
              {p.unit}
            </Text>
          </View>

          {/* ⚠ Copy only — no wallet feature exists. */}
          <View style={styles.wallet}>
            <Wallet size={t.walletIcon} color={colors.textPrimary} style={styles.walletIcon} />
            <Text style={styles.walletText}>{p.wallet}</Text>
          </View>

          {p.payRows.map((r, i) => (
            <View key={r.label} style={[styles.payRow, i === 0 && styles.payRowFirst]}>
              <Text style={styles.payRowLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={styles.payRowValue} {...shrinkToFit(0.7)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cdTitle} {...shrinkToFit(0.8)}>
              {p.caseTitle}
            </Text>
            <View style={styles.done}>
              <Check size={t.doneIcon} color={t.doneColour} strokeWidth={3} />
              <Text style={styles.doneText} {...shrinkToFit(0.8)}>
                {p.doneChip}
              </Text>
            </View>
          </View>
          {p.caseRows.map((r, i) => (
            <View key={r.label} style={[styles.cdRow, i === 0 && styles.cdRowFirst]}>
              <Text style={styles.cdLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={styles.cdValue} {...shrinkToFit(0.7)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.rsTitle} {...shrinkToFit(0.8)}>
            {p.statusTitle}
          </Text>
          <View style={styles.rs}>
            {p.status.map((s, i) => (
              <View key={s} style={[styles.rsRow, i > 0 && styles.rsRowNext]}>
                <View style={styles.rsTick}>
                  <Check size={t.rsTickGlyph} color={t.rsTickColour} strokeWidth={3} />
                </View>
                <Text style={styles.rsText} {...shrinkToFit(0.8)}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.rsTitle} {...shrinkToFit(0.8)}>
            {p.sentTitle}
          </Text>
          {[DF_ADMIN_SHARED.report, DF_ADMIN_SHARED.affidavit].map((f, i) => (
            <View key={f.name} style={[styles.scFile, i === 0 && styles.scFileFirst]}>
              {i === 0 ? (
                <FileText size={t.scIcon} color={colors.textPrimary} />
              ) : (
                <BadgeCheck size={t.scIcon} color={colors.textPrimary} />
              )}
              <View style={styles.scText}>
                <Text style={styles.scName} {...shrinkToFit(0.7)}>
                  {f.name}
                </Text>
                <Text style={styles.scMeta} {...shrinkToFit(0.8)}>
                  {f.meta}
                </Text>
              </View>
              <View style={styles.scTag}>
                <Check size={t.scTagIcon} color={t.scTagColour} strokeWidth={3} />
                <Text style={styles.scTagText} {...shrinkToFit(0.8)}>
                  {p.sentTag}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.scBy}>
            <ShieldCheck size={t.scByIcon} color={t.scByColour} />
            <Text style={styles.scByText} {...shrinkToFit(0.8)}>
              {p.sentBy}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(advocate)/dashboard' as Href)}
          style={({ pressed }) => [styles.home, pressed && styles.pressed]}
        >
          <Text style={styles.homeText} {...shrinkToFit(0.8)}>
            {p.home}
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

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center' },

  markHalo: {
    marginTop: t.markGap,
    alignSelf: 'center',
    width: t.markHalo,
    height: t.markHalo,
    borderRadius: t.markHalo / 2,
    backgroundColor: t.markHaloBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: t.mark, height: t.mark, borderRadius: t.mark / 2, backgroundColor: t.markBg, alignItems: 'center', justifyContent: 'center' },
  headline: { marginTop: t.headlineGap, textAlign: 'center', fontFamily: font.appHeading, fontSize: t.headlineSize, color: colors.textPrimary },
  sub: { marginTop: t.subGap, textAlign: 'center', fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: t.subColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  payLabel: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.payLabelSize, color: colors.textPrimary },
  recv: {
    marginLeft: 'auto',
    minHeight: t.recvHeight,
    borderRadius: t.recvRadius,
    backgroundColor: t.recvBg,
    paddingHorizontal: t.recvPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  recvText: { marginLeft: t.recvIconGap, fontFamily: font.appHeading, fontSize: t.recvSize, color: t.recvColour },

  amountRow: { marginTop: t.amountGap, flexDirection: 'row', alignItems: 'baseline' },
  amount: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.amountSize, color: colors.textPrimary },
  amountUnit: { marginLeft: t.amountUnitGap, flexShrink: 1, fontFamily: font.appSemi, fontSize: t.amountUnitSize, color: t.amountUnitColour },

  wallet: { marginTop: t.walletGap, borderRadius: t.walletRadius, backgroundColor: t.walletBg, padding: t.walletPad, flexDirection: 'row', alignItems: 'flex-start' },
  walletIcon: { marginTop: 1 },
  walletText: { flex: 1, minWidth: 0, marginLeft: t.walletIconGap, fontFamily: font.appBody, fontSize: t.walletSize, lineHeight: t.walletLineHeight, color: colors.textPrimary },

  payRow: { marginTop: t.payRowGapY, flexDirection: 'row', alignItems: 'center' },
  payRowFirst: { marginTop: t.payRowGap },
  payRowLabel: { flexShrink: 1, marginRight: 12, fontFamily: font.appBody, fontSize: t.payRowLabelSize, color: t.payRowLabelColour },
  payRowValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.payRowValueSize, color: colors.textPrimary },

  cdTitle: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.cdTitleSize, color: colors.textPrimary },
  done: {
    marginLeft: 'auto',
    minHeight: t.doneHeight,
    borderRadius: t.doneRadius,
    backgroundColor: t.doneBg,
    paddingHorizontal: t.donePadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  doneText: { marginLeft: t.doneIconGap, fontFamily: font.appHeading, fontSize: t.doneSize, color: t.doneColour },
  cdRow: { marginTop: t.cdRowGapY, flexDirection: 'row', alignItems: 'center' },
  cdRowFirst: { marginTop: t.cdRowGap },
  cdLabel: { flexShrink: 1, marginRight: 12, fontFamily: font.appBody, fontSize: t.cdLabelSize, color: t.cdLabelColour },
  cdValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.cdValueSize, color: colors.textPrimary },

  rsTitle: { fontFamily: font.appHeading, fontSize: t.rsTitleSize, color: colors.textPrimary },
  rs: { marginTop: t.rsGap },
  rsRow: { flexDirection: 'row', alignItems: 'center' },
  rsRowNext: { marginTop: t.rsPitch - t.rsTick },
  rsTick: { width: t.rsTick, height: t.rsTick, borderRadius: t.rsTick / 2, backgroundColor: t.rsTickBg, alignItems: 'center', justifyContent: 'center' },
  rsText: { marginLeft: t.rsGapX, flexShrink: 1, fontFamily: font.appBody, fontSize: t.rsSize, color: colors.textPrimary },

  scFile: { marginTop: t.scFileGapY, borderRadius: t.scFileRadius, backgroundColor: t.scFileBg, padding: t.scFilePad, flexDirection: 'row', alignItems: 'center' },
  scFileFirst: { marginTop: t.scFileGap },
  scText: { flex: 1, minWidth: 0, marginHorizontal: t.scIconGap },
  scName: { fontFamily: font.appHeading, fontSize: t.scNameSize, color: colors.textPrimary },
  scMeta: { marginTop: t.scMetaGap, fontFamily: font.appBody, fontSize: t.scMetaSize, color: t.scMetaColour },
  scTag: {
    minHeight: t.scTagHeight,
    borderRadius: t.scTagRadius,
    backgroundColor: t.scTagBg,
    paddingHorizontal: t.scTagPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  scTagText: { marginLeft: t.scTagIconGap, fontFamily: font.appHeading, fontSize: t.scTagSize, color: t.scTagColour },
  scBy: { marginTop: t.scByGap, flexDirection: 'row', alignItems: 'center' },
  scByText: { marginLeft: t.scByIconGap, flexShrink: 1, fontFamily: font.appSemi, fontSize: t.scBySize, color: t.scByColour },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  home: {
    minHeight: t.homeHeight,
    borderRadius: t.homeRadius,
    backgroundColor: t.homeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeText: { fontFamily: font.appHeading, fontSize: t.homeSize, color: ink.onBrand },
  pressed: { opacity: 0.85 },
});

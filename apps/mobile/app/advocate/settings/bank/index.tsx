import { router, type Href } from 'expo-router';
import {
  BadgeCheck,
  Banknote,
  Check,
  ChevronLeft,
  IdCard,
  Landmark,
  Lock,
  ShieldCheck,
  SquarePen,
  UserRound,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BankCardArt from '../../../../components/BankCardArt';
import { shrinkToFit } from '../../../../constants/textFit';
import { AS_BANK } from '../../../../data/advocateSettings';
import { advBank as t, colors, font, ink, status } from '../../../../constants/theme';

// Advocate settings — bank account (design/257).
//
// ⚠ NOTE 3 — THE BANK CHANGES BETWEEN SCREENS. This screen and the three that
// follow say State Bank of India, Savings, ••••4821. design/256, one tap back,
// says HDFC Bank, Current Account, ••••4821 — same last four digits. Each is
// built as its own PNG draws it.
//
// STATIC, NOT WIRED. There is no penny drop and no payment rail anywhere in
// this project: "Matched" is a drawn label, not a result. Nothing settles,
// nothing is verified, and "Update Bank Account" only pushes to design/258.

const ICONS = { id: IdCard, bank: Landmark, cash: Banknote };

function AdvocateBankScreen() {
  const insets = useSafeAreaInsets();
  const d = AS_BANK;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.4} />
        </Pressable>
        <View style={styles.headCol}>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.title}
          </Text>
        </View>
        <ShieldCheck size={22} color="#4D463D" strokeWidth={1.8} style={styles.shield} />
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.art}>
          <BankCardArt width={190} height={t.artH} />
        </View>
        <View style={styles.pill}>
          <Landmark size={t.pillGlyph} color="#4D463D" strokeWidth={1.8} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            {d.pill}
          </Text>
        </View>
        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.banner}>
          <View style={styles.bannerTick}>
            <Check size={13} color="#FFFFFF" strokeWidth={3} />
          </View>
          <Text style={styles.bannerText} {...shrinkToFit(0.8)}>
            {d.banner}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.bankRow}>
            <View style={styles.bankTile}>
              <Landmark size={t.bankTileGlyph} color="#4D463D" strokeWidth={1.8} />
            </View>
            <View style={styles.bankCol}>
              <Text style={styles.bankName} {...shrinkToFit(0.8)}>
                {d.bank.name}
              </Text>
              <Text style={styles.bankSub} {...shrinkToFit(0.8)}>
                {d.bank.sub}
              </Text>
            </View>
            <View style={styles.primaryPill}>
              <Text style={styles.primaryPillText} {...shrinkToFit(0.8)}>
                {d.bank.pill}
              </Text>
            </View>
          </View>

          <View style={styles.details}>
            {d.details.map((r, i) => (
              <Fragment key={r.label}>
                {i > 0 ? <View style={styles.detailRule} /> : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel} {...shrinkToFit(0.8)}>
                    {r.label}
                  </Text>
                  <Text style={styles.detailValue} {...shrinkToFit(0.75)}>
                    {r.value}
                  </Text>
                  {r.verified ? (
                    <BadgeCheck size={18} color="#FFFFFF" fill={status.active} style={styles.detailTick} />
                  ) : null}
                </View>
              </Fragment>
            ))}
          </View>
        </View>

        <Text style={styles.section}>{d.payoutTitle}</Text>
        <View style={styles.card}>
          <Text style={styles.body}>{d.payoutBody}</Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            onPress={() => router.push('/advocate/settings/bank/update' as Href)}
          >
            <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
              {d.payoutCta}
            </Text>
            <SquarePen size={t.ctaGlyph} color={ink.onBrand} strokeWidth={1.8} />
          </Pressable>
        </View>

        <Text style={styles.section}>{d.verificationTitle}</Text>
        <View style={styles.card}>
          {d.verification.map((r, i) => {
            const Icon = ICONS[r.icon as keyof typeof ICONS];
            return (
              <Fragment key={r.title}>
                {i > 0 ? <View style={styles.statusRule} /> : null}
                <View style={[styles.statusRow, i > 0 && { marginTop: t.statusRowGap }]}>
                  <View style={styles.statusTile}>
                    <Icon size={t.statusGlyph} color="#4D463D" strokeWidth={1.8} />
                  </View>
                  <Text style={styles.statusTitle} {...shrinkToFit(0.8)}>
                    {r.title}
                  </Text>
                  <View style={styles.statusPill}>
                    <Check size={14} color={status.active} strokeWidth={3} />
                    <Text style={styles.statusPillText} {...shrinkToFit(0.8)}>
                      {r.pill}
                    </Text>
                  </View>
                </View>
              </Fragment>
            );
          })}
        </View>

        <View style={styles.note}>
          <View style={styles.noteTile}>
            <Lock size={t.noteGlyph} color="#4D463D" strokeWidth={1.8} />
          </View>
          <View style={styles.bankCol}>
            <Text style={styles.noteTitle}>{d.note.title}</Text>
            <Text style={styles.noteText}>{d.note.body}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
  },
  headCol: { flex: 1, marginLeft: 14 },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },
  shield: { marginRight: 16 },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#6C5C45',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 30, alignItems: 'center' },

  art: { height: t.artH, alignItems: 'center', justifyContent: 'center' },
  pill: {
    marginTop: t.pillTop,
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    marginLeft: t.pillGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillTrack,
    color: '#4D463D',
  },
  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, color: '#1B1C1C' },
  sub: {
    marginTop: t.subTop,
    marginHorizontal: t.padX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLine,
    color: '#4D463D',
  },

  banner: {
    marginTop: t.bannerTop,
    height: t.bannerH,
    borderRadius: t.bannerRadius,
    paddingHorizontal: 16,
    backgroundColor: status.activeBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.bannerGap,
  },
  bannerText: { fontFamily: font.appHeading, fontSize: t.bannerSize, color: '#0F7A4F' },

  card: {
    marginTop: t.cardTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  bankRow: { flexDirection: 'row', alignItems: 'center' },
  bankTile: {
    width: t.bankTile,
    height: t.bankTile,
    borderRadius: t.bankTile / 2,
    backgroundColor: '#F2EFEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.bankTileGap,
  },
  bankCol: { flex: 1 },
  bankName: { fontFamily: font.appHeading, fontSize: t.bankNameSize, color: '#1B1C1C' },
  bankSub: {
    marginTop: t.bankSubTop,
    fontFamily: font.appBody,
    fontSize: t.bankSubSize,
    color: '#4D463D',
  },
  primaryPill: {
    marginLeft: 8,
    height: t.primaryPillH,
    borderRadius: t.primaryPillRadius,
    paddingHorizontal: t.primaryPillPadX,
    backgroundColor: status.activeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPillText: { fontFamily: font.appSemi, fontSize: t.primaryPillSize, color: '#0F7A4F' },

  details: {
    marginTop: t.detailTop,
    backgroundColor: t.detailBg,
    borderRadius: t.detailRadius,
    paddingHorizontal: t.detailPadX,
  },
  detailRow: { minHeight: t.detailRowH, flexDirection: 'row', alignItems: 'center' },
  detailRule: { height: 1, backgroundColor: '#E6E0DE' },
  detailLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.detailLabelSize, color: '#4D463D' },
  detailValue: {
    flexShrink: 1,
    marginLeft: 10,
    textAlign: 'right',
    fontFamily: font.appHeading,
    fontSize: t.detailValueSize,
    color: '#1B1C1C',
  },
  detailTick: { marginLeft: 8 },

  section: {
    marginTop: t.sectionTop,
    marginBottom: -t.cardTop + t.sectionGap,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: '#6B6B6B',
  },
  body: {
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLine,
    color: '#1B1C1C',
  },
  cta: {
    marginTop: t.ctaTop,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    marginRight: 11,
    fontFamily: font.appHeading,
    fontSize: t.ctaLabelSize,
    color: ink.onBrand,
  },

  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusRule: { marginTop: t.statusRowGap, height: 1, backgroundColor: '#EFEBE8' },
  statusTile: {
    width: t.statusTile,
    height: t.statusTile,
    borderRadius: t.statusTileRadius,
    backgroundColor: '#F2EFEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.statusGap,
  },
  statusTitle: { flex: 1, fontFamily: font.appHeading, fontSize: t.statusTitleSize, color: '#1B1C1C' },
  statusPill: {
    height: t.statusPillH,
    borderRadius: t.statusPillRadius,
    paddingHorizontal: t.statusPillPadX,
    backgroundColor: status.activeBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPillText: {
    marginLeft: 5,
    fontFamily: font.appSemi,
    fontSize: t.statusPillSize,
    color: '#0F7A4F',
  },

  note: {
    marginTop: t.noteTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    padding: t.notePad,
  },
  noteTile: {
    width: t.noteTile,
    height: t.noteTile,
    borderRadius: t.noteTile / 2,
    backgroundColor: '#E6E2DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noteGap,
  },
  noteTitle: { fontFamily: font.appHeading, fontSize: t.noteTitleSize, color: '#1B1C1C' },
  noteText: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: '#4D463D',
  },
});

import {BankAccountScreen as LiveWalletScreen} from '../../../../features/wallet/Wallet';
import {DATA_SOURCE as WALLET_DATA_SOURCE} from '../../../../lib/data-source';
// D-36: API mode renders the real wallet; fixture mode keeps the design preview.
export default function WalletRoute() { return WALLET_DATA_SOURCE === 'api' ? <LiveWalletScreen/> : <AdvocateBankScreen/>; }

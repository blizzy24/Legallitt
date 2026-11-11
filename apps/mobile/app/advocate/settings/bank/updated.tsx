import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Landmark,
  SlidersHorizontal,
  UserRound,
  Wallet,
  X,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { AS_BANK_UPDATED } from '../../../../data/advocateSettings';
import { advBank as t, colors, font, ink, status } from '../../../../constants/theme';

// Advocate settings — bank account updated (design/260). Closes RUN C.
//
// ⚠ "Updated on 30 Sep 2026" is in the future, like every other date in this
// batch. Drawn as drawn.
//
// STATIC, NOT WIRED: nothing was updated. No account is stored, no payout is
// redirected, and "Done" simply returns to the settings root.

function AdvocateBankUpdatedScreen() {
  const insets = useSafeAreaInsets();
  const d = AS_BANK_UPDATED;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          onPress={() => router.replace('/advocate/settings/bank' as Href)}
        >
          <X size={t.backIcon} color="#1B1C1C" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.markOuter}>
          <View style={styles.markInner}>
            <Check size={24} color="#FFFFFF" strokeWidth={3} />
          </View>
          <View style={styles.markBadge}>
            <BadgeCheck size={13} color="#FFFFFF" fill="#0F7A4F" strokeWidth={1.6} />
          </View>
        </View>
        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.card}>
          <View style={styles.bankRow}>
            <View style={styles.bankTile}>
              <Landmark size={24} color="#4D463D" strokeWidth={1.8} />
            </View>
            <View style={styles.col}>
              <Text style={styles.bankName} {...shrinkToFit(0.8)}>
                {d.bank.name}
              </Text>
              <Text style={styles.bankSub} {...shrinkToFit(0.8)}>
                {d.bank.sub}
              </Text>
            </View>
            <View style={styles.verifiedPill}>
              <Check size={14} color={status.active} strokeWidth={3} />
              <Text style={styles.verifiedPillText} {...shrinkToFit(0.8)}>
                {d.bank.pill}
              </Text>
            </View>
          </View>
          <View style={styles.cardRule} />
          {d.details.map((r, i) => (
            <Fragment key={r.label}>
              <View style={[styles.detailRow, i === 0 && { marginTop: 4 }]}>
                <Text style={styles.detailLabel} {...shrinkToFit(0.8)}>
                  {r.label}
                </Text>
                <Text style={styles.detailValue} {...shrinkToFit(0.75)}>
                  {r.value}
                </Text>
              </View>
            </Fragment>
          ))}
        </View>

        <View style={styles.note}>
          <View style={styles.noteTile}>
            <Wallet size={t.noteGlyph} color="#8C6B3F" strokeWidth={1.8} />
          </View>
          <View style={styles.col}>
            <Text style={styles.noteTitle}>{d.note.title}</Text>
            <Text style={styles.noteText}>{d.note.body}</Text>
          </View>
        </View>

        <View style={styles.updatedRow}>
          <CalendarDays size={20} color="#4D463D" strokeWidth={1.8} />
          <Text style={styles.updatedText} {...shrinkToFit(0.8)}>
            {d.updated}
          </Text>
          <View style={styles.activeDot} />
          <Text style={styles.activeText} {...shrinkToFit(0.8)}>
            {d.active}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.replace('/advocate/settings' as Href)}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.secondaryRow}
          onPress={() => router.replace('/advocate/settings/payout' as Href)}
        >
          <SlidersHorizontal size={19} color="#4D463D" strokeWidth={1.8} />
          <Text style={styles.secondaryText} {...shrinkToFit(0.8)}>
            {d.secondary}
          </Text>
        </Pressable>
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
    borderBottomWidth: 1,
    borderBottomColor: '#EFEBE8',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.plainTitleSize,
    color: '#1B1C1C',
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#6C5C45',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 30, alignItems: 'center' },

  markOuter: {
    marginTop: 14,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#C8EFDA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markInner: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: { marginTop: 14, fontFamily: font.appHeading, fontSize: 21.5, color: '#1B1C1C' },
  sub: {
    marginTop: 9,
    marginHorizontal: t.padX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: 15,
    lineHeight: 21,
    color: '#4D463D',
  },

  card: {
    marginTop: 20,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  bankRow: { flexDirection: 'row', alignItems: 'center' },
  bankTile: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F2EFEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  col: { flex: 1 },
  bankName: { fontFamily: font.appHeading, fontSize: 20, color: '#1B1C1C' },
  bankSub: { marginTop: 2, fontFamily: font.appBody, fontSize: 15, color: '#4D463D' },
  verifiedPill: {
    marginLeft: 8,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: status.activeBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedPillText: {
    marginLeft: 5,
    fontFamily: font.appHeading,
    fontSize: 15,
    color: '#0F7A4F',
  },
  cardRule: { marginTop: 14, height: 1, backgroundColor: '#EFEBE8' },
  detailRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: { flex: 1, fontFamily: font.appBody, fontSize: 15, color: '#4D463D' },
  detailValue: {
    flexShrink: 1,
    marginLeft: 10,
    textAlign: 'right',
    fontFamily: font.appHeading,
    fontSize: 17,
    color: '#1B1C1C',
  },

  note: {
    marginTop: 16,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: '#F6F2EF',
    borderRadius: t.noteRadius,
    padding: t.notePad,
  },
  noteTile: {
    width: t.noteTile,
    height: t.noteTile,
    borderRadius: t.noteTile / 2,
    backgroundColor: '#F6E2C6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noteGap,
  },
  noteTitle: { fontFamily: font.appHeading, fontSize: t.noteTitleSize, color: '#1B1C1C' },
  noteText: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: 22,
    color: '#4D463D',
  },

  updatedRow: {
    marginTop: 14,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  updatedText: {
    flex: 1,
    marginLeft: 11,
    fontFamily: font.appSemi,
    fontSize: 16,
    color: '#1B1C1C',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: status.active,
    marginRight: 8,
  },
  activeText: { fontFamily: font.appHeading, fontSize: 16, color: '#1B1C1C' },

  cta: {
    marginTop: 18,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
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
  secondaryRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryText: {
    marginLeft: 10,
    fontFamily: font.appHeading,
    fontSize: 17,
    color: '#4D463D',
  },
});

import {BankAccountScreen as LiveWalletScreen} from '../../../../features/wallet/Wallet';
import {DATA_SOURCE as WALLET_DATA_SOURCE} from '../../../../lib/data-source';
// D-36: API mode renders the real wallet; fixture mode keeps the design preview.
export default function WalletRoute() { return WALLET_DATA_SOURCE === 'api' ? <LiveWalletScreen/> : <AdvocateBankUpdatedScreen/>; }

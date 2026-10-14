import { router, type Href } from 'expo-router';
import { ArrowLeft, BadgeCheck, CircleCheck, Gavel, Info, Landmark, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import {
  advWalletPalette,
  advWithdraw as t,
  advWithdrawPalette as p,
  colors,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../constants/theme';
import { formatINR, WALLET_WITHDRAW } from '../../../data/advocateWallet';

// Advocate — withdraw money (design/359). Measured at 2.000 px/pt.
//
// ⚠⚠ THE HEADER READS "Edit Clause" — a template leftover on a withdrawal
// screen, built as drawn. See WALLET_WITHDRAW for this screen's conflicts.
//
// The amount entry is live, client-side only: digits only; the quick-pick
// chips select; Use Max fills the field; anything above the drawn ₹24,850
// maximum is held at the maximum, and below the drawn ₹1,000 minimum the
// Confirm button is marked disabled (no error state is drawn, so none is
// added). No validation beyond what the design draws.
//
// ⚠⚠ STATIC, NOT WIRED — UNSCOPED: Confirm Withdrawal moves no money (there is
// no payout rail, no bank API, no NEFT/IMPS). Change opens bank account
// management (design/360); Cancel and Return to Wallet goes back.
//
// Reached from Withdraw Money on the wallet (designs 356-358).

const grey = advWalletPalette.text;

export default function AdvocateWithdrawScreen() {
  const insets = useSafeAreaInsets();
  const d = WALLET_WITHDRAW;
  const [amount, setAmount] = useState<number>(d.initial);
  const ok = amount >= d.min && amount <= d.max;
  const set = (n: number) => setAmount(Math.min(n, d.max));
  const onType = (s: string) => set(Number(s.replace(/\D/g, '')) || 0);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(advocate)/earnings' as Href));
  const shown = `${d.rupee}${formatINR(amount)}`;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/(advocate)/earnings' as Href} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.caps, styles.capsTop]}>{d.caps}</Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={[styles.card, styles.avail]}>
          <Text style={styles.caps}>{d.availCaps}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.rupee}>{d.rupee}</Text>
            <Text style={styles.amount}>{d.availAmount}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.enter}>{d.enterLabel}</Text>
            <Pressable accessibilityRole="button" onPress={() => set(d.max)} style={styles.max}>
              <Text style={styles.maxText} {...shrinkToFit(0.8)}>
                {d.useMax}
              </Text>
            </Pressable>
          </View>
          <View style={styles.input}>
            <Text style={styles.inputText}>{d.rupee} </Text>
            <TextInput
              value={amount ? formatINR(amount) : ''}
              onChangeText={onType}
              keyboardType="number-pad"
              accessibilityLabel={d.enterLabel}
              style={[styles.inputText, styles.inputField]}
            />
          </View>
          <View style={styles.chips}>
            {d.picks.map((n) => {
              const on = amount === n;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="radio"
                  aria-checked={on}
                  onPress={() => set(n)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.8)}>
                    {`${d.rupee}${formatINR(n)}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.limit}>
            <Info size={t.limitIcon} color={grey} strokeWidth={2} />
            <Text style={styles.limitText}>{d.limits}</Text>
          </View>
        </View>

        <View style={[styles.between, styles.toRow]}>
          <Text style={styles.caps}>{d.toCaps}</Text>
          <Pressable accessibilityRole="link" onPress={() => router.push('/advocate/wallet/bank' as Href)}>
            <Text style={styles.change}>{d.change}</Text>
          </Pressable>
        </View>
        <View style={[styles.card, styles.bank]}>
          <View style={styles.disc}>
            <Landmark size={t.discGlyph} color={c.ink} strokeWidth={1.8} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.bankName}>{d.bankName}</Text>
            <Text style={styles.bankSub}>{d.bankSub}</Text>
          </View>
          <View style={styles.ver}>
            <BadgeCheck size={t.verIcon} color={status.active} strokeWidth={2} />
            <Text style={styles.verText}>{d.verified}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{d.amountLabel}</Text>
            <Text style={styles.rowValue}>{`${shown}.00`}</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.lockRow}>
              <Text style={styles.rowLabel}>{d.feeLabel}</Text>
              <Lock size={t.lockIcon} color={grey} strokeWidth={2} />
            </View>
            <Text style={[styles.rowValue, styles.green]}>{d.fee}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{d.arrivalLabel}</Text>
            <Text style={[styles.rowValue, styles.right]}>
              {d.arrival}
              <Text style={styles.rail}>{d.arrivalRail}</Text>
            </Text>
          </View>
          <View style={styles.rule} />
          <View style={[styles.between, styles.recv]}>
            <View style={styles.flex}>
              <Text style={styles.recvLabel}>{d.recvLabel}</Text>
              <Text style={styles.recvSub}>{d.recvSub}</Text>
            </View>
            <View style={styles.recvValueRow}>
              <CircleCheck size={t.recvIcon} color={status.active} strokeWidth={2} />
              <Text style={styles.recvValue}>{`${shown}.00`}</Text>
            </View>
          </View>
        </View>

        <View style={styles.note}>
          <Gavel size={t.noteIcon} color={grey} strokeWidth={1.9} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>

        {/* ⚠ UNSCOPED — no payout rail. Draws only. */}
        <View accessibilityRole="button" aria-disabled={!ok} style={[styles.btn, styles.btnFirst]}>
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {`${d.confirm} (${shown})`}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={back} style={[styles.btn, styles.btnNext]}>
          <ArrowLeft size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          <Text style={styles.btnText}>{d.cancel}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  green: { color: status.active },
  right: { flexShrink: 1, textAlign: 'right' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.limitGap },

  caps: { fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: grey },
  capsTop: { marginTop: t.capsTop },
  sub: { marginTop: t.subTop, fontFamily: font.appBody, fontSize: t.subSize, color: c.inkWarm },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  avail: { marginTop: t.availTop },
  next: { marginTop: t.cardGap },
  amountRow: { marginTop: t.amountTop, flexDirection: 'row', alignItems: 'baseline', gap: t.rupeeGap },
  rupee: { fontFamily: font.appSemi, fontSize: t.rupeeSize, color: c.ink },
  amount: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.amountSize, color: c.ink },

  enter: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.enterSize, color: c.ink },
  max: {
    height: t.maxH,
    borderRadius: t.maxH / 2,
    paddingHorizontal: t.maxPadX,
    backgroundColor: c.peachNote,
    justifyContent: 'center',
    flexShrink: 1,
  },
  maxText: { fontFamily: font.appBody, fontSize: t.maxSize, color: c.brown },
  input: {
    marginTop: t.inputTop,
    height: t.inputH,
    borderRadius: t.inputRadius,
    paddingHorizontal: t.inputPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: { fontFamily: font.appHeading, fontSize: t.inputSize, color: c.ink },
  inputField: { flex: 1, minWidth: 0, alignSelf: 'stretch' },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.chipGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.brand },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: c.ink },
  chipTextOn: { color: ink.onBrand },
  limit: { marginTop: t.limitTop, flexDirection: 'row', alignItems: 'center', gap: t.limitGap },
  limitText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.limitSize, color: grey },

  toRow: { marginTop: t.toTop },
  change: { fontFamily: font.appBody, fontSize: t.changeSize, color: c.brown },
  bank: { marginTop: t.bankTop, flexDirection: 'row', alignItems: 'center', gap: t.bankGap },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    backgroundColor: p.discPeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: { fontFamily: font.appSemi, fontSize: t.bankNameSize, color: c.ink },
  bankSub: { fontFamily: font.appBody, fontSize: t.bankSubSize, color: grey },
  ver: {
    height: t.verH,
    borderRadius: t.verH / 2,
    paddingHorizontal: t.verPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.verGap,
  },
  verText: { fontFamily: font.appBody, fontSize: t.verSize, color: status.active },

  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.limitGap },
  lockRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.lockGap },
  rowLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.rowLabelSize, color: grey },
  rowValue: { fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },
  rail: { fontFamily: font.appBody, color: grey },
  rule: { marginTop: t.ruleTop, height: t.ruleH, backgroundColor: c.tileGrey },
  recv: { marginTop: t.recvTop },
  recvLabel: { fontFamily: font.appBody, fontSize: t.recvSize, color: c.ink },
  recvSub: { fontFamily: font.appBody, fontSize: t.recvSubSize, color: grey },
  recvValueRow: { flexDirection: 'row', alignItems: 'center', gap: t.recvGap },
  recvValue: { fontFamily: font.appHeading, fontSize: t.recvValueSize, color: c.ink },

  note: { marginTop: t.noteTop, flexDirection: 'row', gap: t.noteGap },
  noteText: { flex: 1, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: grey },

  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnFirst: { marginTop: t.btnTop },
  btnNext: { marginTop: t.btnGap },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
});

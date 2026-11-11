import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowLeftRight,
  BadgeCheck,
  Building,
  CreditCard,
  Download,
  Eye,
  Gavel,
  Headset,
  IdCard,
  Landmark,
  Pencil,
  Share2,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import {
  advWalletBank as t,
  advWalletBankPalette as p,
  advWalletPalette as w,
  colors,
  courierHeader as h,
  dcDocumentsPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../constants/theme';
import { WALLET_BANK } from '../../../data/advocateWallet';

// Advocate — manage bank account (design/360). Measured at 2.000 px/pt.
// Reached from Manage on the wallet (356–358) and Change on design/359.
//
// A separate screen from the settings bank flow (designs 257–260, at
// /advocate/settings/bank): different layout, holder and IFSC — see the
// conflicts on WALLET_BANK.
//
// ⚠⚠ STATIC, NOT WIRED — UNSCOPED: no bank API. Show, Edit Details, Set as
// Primary, Add New Bank Account, the share and download icons and the
// Advocate Support Desk link do nothing. Return to Wallet goes back.

function Account({ a }: { a: (typeof WALLET_BANK.accounts)[number] }) {
  const d = WALLET_BANK;
  const primary = a.kind === 'primary';
  return (
    <View style={[styles.card, styles.cardTop]}>
      <View style={styles.acctHead}>
        <View style={styles.tile}>
          {primary ? (
            <Landmark size={t.tileGlyph} color={c.ink} strokeWidth={1.8} />
          ) : (
            <Building size={t.tileGlyph} color={c.ink} strokeWidth={1.8} />
          )}
        </View>
        <View style={styles.flex}>
          <Text style={styles.name} {...shrinkToFit(0.75)}>
            {a.bank}
          </Text>
          <Text style={styles.type}>{a.type}</Text>
        </View>
      </View>
      <View style={styles.pills}>
        <View style={[styles.pill, primary ? styles.pillPeach : styles.pillGrey]}>
          {primary && <Star size={t.pillIcon} color={dcDocumentsPalette.shieldInk} strokeWidth={2} />}
          <Text style={[styles.pillText, primary ? styles.pillTextDark : styles.pillTextGrey]}>{a.pill}</Text>
        </View>
        <View style={[styles.pill, styles.pillGreen]}>
          <BadgeCheck size={t.pillIcon} color={c.card} fill={status.active} strokeWidth={2} />
          <Text style={[styles.pillText, styles.green]}>{d.verified}</Text>
        </View>
      </View>
      <View style={styles.box}>
        <View style={styles.between}>
          <Text style={styles.boxCaps}>{a.numberCaps}</Text>
          {primary ? (
            <View style={styles.show}>
              <Eye size={t.showIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.showText}>{d.show}</Text>
            </View>
          ) : (
            <Text style={[styles.mono, styles.numberSmall]}>{a.number}</Text>
          )}
        </View>
        {primary && <Text style={[styles.mono, styles.number]}>{a.number}</Text>}
        <View style={[styles.inner, !primary && styles.innerFlat]}>
          <View style={styles.cols}>
            {a.fields.map(([l, v], i) => (
              <View key={l} style={styles.flex}>
                <Text style={styles.fieldLabel}>{l}</Text>
                <Text style={[styles.fieldValue, i === 1 && styles.monoValue]}>{v}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.fieldLabel, styles.fieldNext]}>{a.branchLabel}</Text>
          <Text style={styles.branch}>{a.branch}</Text>
        </View>
      </View>
      <View style={[styles.between, styles.foot]}>
        <View style={styles.footLeft}>
          {primary && <Zap size={t.footIcon} color={status.active} strokeWidth={2} />}
          <Text style={styles.footText}>{a.foot}</Text>
        </View>
        {primary ? (
          <View style={styles.footLeft}>
            <Pencil size={t.footIcon} color={c.brown} strokeWidth={2} />
            <Text style={styles.edit}>{a.action}</Text>
          </View>
        ) : (
          <View style={styles.set}>
            <ArrowLeftRight size={t.setIcon} color={c.ink} strokeWidth={2} />
            <Text style={styles.setText}>{a.action}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function AdvocateWalletBankScreen() {
  const insets = useSafeAreaInsets();
  const d = WALLET_BANK;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(advocate)/earnings' as Href));

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        avatar={false}
        backHref={'/(advocate)/earnings' as Href}
        right={
          <View style={styles.hdrIcons}>
            <Share2 size={t.hdrIcon} color={h.ink} strokeWidth={1.9} />
            <Download size={t.hdrIcon} color={h.ink} strokeWidth={1.9} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rbi}>
          <View style={styles.rbiDisc}>
            <ShieldCheck size={t.rbiGlyph} color={c.brown} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.rbiTitle}>{d.rbiTitle}</Text>
            <Text style={styles.rbiBody}>{d.rbiBody}</Text>
          </View>
        </View>

        <View style={[styles.between, styles.capsRow]}>
          <Text style={styles.caps} {...shrinkToFit(0.8)}>
            {d.defaultCaps}
          </Text>
          <View style={styles.footLeft}>
            <View style={styles.dot} />
            <Text style={[styles.capsRight, styles.green]}>{d.direct}</Text>
          </View>
        </View>
        <Account a={d.accounts[0]} />

        <View style={[styles.between, styles.capsRow]}>
          <Text style={styles.caps} {...shrinkToFit(0.8)}>
            {d.secondaryCaps}
          </Text>
          <Text style={styles.capsRight}>{d.linked}</Text>
        </View>
        <Account a={d.accounts[1]} />

        <View style={[styles.card, styles.guide]}>
          <View style={styles.guideHead}>
            <View style={styles.guideDisc}>
              <Gavel size={t.guideGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <Text style={styles.guideTitle} {...shrinkToFit(0.8)}>
              {d.guideTitle}
            </Text>
          </View>
          <View style={styles.item}>
            <IdCard size={t.itemIcon} color={c.brown} strokeWidth={1.9} />
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>{d.guide1Title}</Text>
              <Text style={styles.itemBody}>
                {d.guide1Body}
                <Text style={styles.ink}>{d.guide1Name}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.item}>
            <Headset size={t.itemIcon} color={p.violet} strokeWidth={1.9} />
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>{d.guide2Title}</Text>
              <Text style={styles.itemBody}>
                {d.guide2Body[0]}
                <Text style={styles.brown}>{d.guide2Body[1]}</Text>
                {d.guide2Body[2]}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.enrol}>
          <View style={styles.rr}>
            <Text style={styles.rrText}>{d.enrolInitials}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.enrolTitle}>{d.enrolTitle}</Text>
            <Text style={[styles.mono, styles.enrolValue]}>{d.enrolValue}</Text>
          </View>
          <View style={styles.kyc}>
            <View style={styles.dot} />
            <Text style={styles.kycText}>{d.kyc}</Text>
          </View>
        </View>

        {/* ⚠ UNSCOPED — no bank API. Draws only. */}
        <View style={[styles.btn, styles.btnFirst]}>
          <CreditCard size={t.btnIcon} color={ink.onBrand} strokeWidth={1.9} />
          <Text style={styles.btnText}>{d.add}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={back} style={[styles.btn, styles.btnNext]}>
          <ArrowLeft size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          <Text style={styles.btnText}>{d.back}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: w.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  green: { color: status.active },
  brown: { color: c.brown },
  ink: { color: c.ink },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.pillGap },
  hdrIcons: { flexDirection: 'row', alignItems: 'center', gap: t.hdrIconGap, marginRight: t.hdrIconGap },
  mono: { fontFamily: font.mono, color: c.ink },

  rbi: { marginTop: t.rbiTop, borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.panel, flexDirection: 'row', gap: t.rbiGap },
  rbiDisc: {
    width: t.rbiDisc,
    height: t.rbiDisc,
    borderRadius: t.rbiDisc / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rbiTitle: { fontFamily: font.appSemi, fontSize: t.rbiTitleSize, color: c.ink },
  rbiBody: { fontFamily: font.appBody, fontSize: t.rbiBodySize, lineHeight: t.rbiBodyLineHeight, color: w.text },

  capsRow: { marginTop: t.capsTop },
  caps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: w.text },
  capsRight: { fontFamily: font.appBody, fontSize: t.capsRightSize, color: w.text },
  dot: { width: t.kycDot, height: t.kycDot, borderRadius: t.kycDot / 2, backgroundColor: status.active },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  cardTop: { marginTop: t.cardTop },
  acctHead: { flexDirection: 'row', alignItems: 'center', gap: t.tileGap },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  type: { fontFamily: font.appBody, fontSize: t.typeSize, color: w.text },
  pills: { marginTop: t.pillsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.pillsGap },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillPeach: { backgroundColor: c.peachDecide },
  pillGrey: { backgroundColor: c.tileGrey },
  pillGreen: { backgroundColor: status.activeBg },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize },
  pillTextDark: { color: dcDocumentsPalette.shieldInk },
  pillTextGrey: { fontFamily: font.appBody, color: w.text },

  box: { marginTop: t.boxTop, borderRadius: t.boxRadius, padding: t.boxPad, backgroundColor: w.page },
  boxCaps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.boxCapsSize, letterSpacing: t.capsSpacing, color: w.text },
  show: { flexDirection: 'row', alignItems: 'center', gap: t.pillGap },
  showText: { fontFamily: font.appSemi, fontSize: t.showSize, color: c.brown },
  number: { marginTop: t.numberTop, fontSize: t.numberSize, letterSpacing: t.numberSpacing, fontWeight: '700' },
  numberSmall: { fontSize: t.fieldValueSize, letterSpacing: t.numberSpacing },
  inner: { marginTop: t.innerTop, borderRadius: t.innerRadius, padding: t.innerPad, backgroundColor: p.box },
  innerFlat: { marginTop: t.innerFlatTop, backgroundColor: w.page, padding: t.noPad },
  cols: { flexDirection: 'row', gap: t.colGap },
  fieldLabel: { fontFamily: font.appBody, fontSize: t.fieldLabelSize, color: w.text },
  fieldNext: { marginTop: t.fieldGap },
  fieldValue: { marginTop: t.fieldValueTop, fontFamily: font.appSemi, fontSize: t.fieldValueSize, color: c.ink },
  monoValue: { fontFamily: font.mono, fontWeight: '700' },
  branch: { marginTop: t.fieldValueTop, fontFamily: font.appBody, fontSize: t.footSize, color: c.ink },

  foot: { marginTop: t.footTop },
  footLeft: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.footGap },
  footText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.footSize, color: w.text },
  edit: { fontFamily: font.appSemi, fontSize: t.footSize, color: c.brown },
  set: {
    height: t.setH,
    borderRadius: t.setRadius,
    paddingHorizontal: t.setPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.footGap,
  },
  setText: { fontFamily: font.appSemi, fontSize: t.footSize, color: c.ink },

  guide: { marginTop: t.guideTop },
  guideHead: { flexDirection: 'row', alignItems: 'center', gap: t.guideGap },
  guideDisc: {
    width: t.guideDisc,
    height: t.guideDisc,
    borderRadius: t.guideDisc / 2,
    backgroundColor: w.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.guideTitleSize, color: c.ink },
  item: { marginTop: t.itemTop, flexDirection: 'row', gap: t.itemGap },
  itemTitle: { fontFamily: font.appSemi, fontSize: t.itemTitleSize, color: c.ink },
  itemBody: { marginTop: t.itemBodyTop, fontFamily: font.appBody, fontSize: t.itemBodySize, lineHeight: t.itemBodyLineHeight, color: w.text },

  enrol: {
    marginTop: t.enrolTop,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPad,
    paddingVertical: t.enrolPadY,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.enrolGap,
  },
  rr: { width: t.rr, height: t.rr, borderRadius: t.rr / 2, backgroundColor: p.rrDisc, alignItems: 'center', justifyContent: 'center' },
  rrText: { fontFamily: font.appSemi, fontSize: t.rrSize, color: c.brown },
  enrolTitle: { fontFamily: font.appSemi, fontSize: t.enrolTitleSize, color: c.ink },
  enrolValue: { fontSize: t.enrolValueSize, lineHeight: t.enrolValueLineHeight, color: w.text },
  kyc: {
    borderRadius: t.kycRadius,
    paddingHorizontal: t.kycPadX,
    paddingVertical: t.kycPadY,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  kycText: { fontFamily: font.appSemi, fontSize: t.kycSize, lineHeight: t.kycLineHeight, color: status.active },

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
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
});

import {BankAccountScreen as LiveWalletScreen} from '../../../features/wallet/Wallet';
import {DATA_SOURCE as WALLET_DATA_SOURCE} from '../../../lib/data-source';
// D-36: API mode renders the real wallet; fixture mode keeps the design preview.
export default function WalletRoute() { return WALLET_DATA_SOURCE === 'api' ? <LiveWalletScreen/> : <AdvocateWalletBankScreen/>; }

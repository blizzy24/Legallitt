import { router, type Href } from 'expo-router';
import { ArrowRight, Info, Landmark, LockKeyhole, MessageSquareText, Phone, TrendingUp } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcCourtFee as t, font, hcPalette as c, ink, shadow } from '../../../constants/theme';
import { DC_COURT_FEE } from '../../../data/districtCourt';

// District Court — court fee (design/314). Measured at 2.000 px/pt.
//
// Conflicts 1 and 2 are commented on DC_COURT_FEE: "Pay Court Fee (₹3,500)"
// opens the shared ₹40,680 payment (designs 315–317 = 296–298).
//
// Chat opens the advocate chat (design/301, cross-service); Call dials nothing.

export default function DistrictCourtCourtFeeScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_COURT_FEE;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/case-preparation' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.7)}>
            {d.pill}
          </Text>
        </View>

        <View style={[styles.card, styles.req]}>
          <View style={styles.reqTop}>
            <View style={styles.disc}>
              <Landmark size={t.discGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{d.reqTitle}</Text>
              <Text style={styles.body}>{d.reqBody}</Text>
            </View>
          </View>
          <View style={styles.info}>
            <Info size={t.infoIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.infoText}>{d.reqInfo}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.amt]}>
          <View style={styles.between}>
            <Text style={styles.amtTitle}>{d.amtTitle}</Text>
            <View style={styles.tag}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>{d.amtTag}</Text>
            </View>
          </View>
          <View style={styles.amtRow}>
            <Text style={styles.amount}>{d.amount}</Text>
            <Text style={styles.unit}>{d.unit}</Text>
          </View>
          <Text style={styles.amtDesc}>{d.amtDesc}</Text>
          <View style={styles.box}>
            {d.boxRows.map(([l, v], i) => (
              <View key={l} style={[styles.between, i > 0 && styles.boxRowGap]}>
                <Text style={i === 0 ? styles.boxLabel : styles.boxSub}>{l}</Text>
                <Text style={i === 0 ? styles.boxValue : styles.boxSubValue} {...shrinkToFit(0.8)}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.infoCard]}>
          <View style={styles.between}>
            <Text style={[styles.title, styles.infoTitle]}>{d.infoTitle}</Text>
            <View style={[styles.tag, styles.tagGreen]}>
              <Text style={[styles.tagText, styles.tagTextGreen]}>{d.infoTag}</Text>
            </View>
          </View>
          <Text style={[styles.label, styles.labelFirst]}>{d.parties[0]}</Text>
          <Text style={styles.value}>{d.parties[1]}</Text>
          <View style={styles.facts}>
            {d.facts.map(([l, v]) => (
              <View key={l} style={styles.flex}>
                <Text style={styles.label}>{l}</Text>
                <Text style={styles.value}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.adv]}>
          <View style={styles.advRow}>
            <View style={styles.advDisc}>
              <Text style={styles.advInitials}>{d.initials}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.advName}>{d.adv}</Text>
              <Text style={styles.advRole}>{d.advRole}</Text>
            </View>
          </View>
          <Text style={styles.ask}>{d.ask}</Text>
          <View style={styles.btns}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.btn}
            >
              <MessageSquareText size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.btnText}>{d.chat}</Text>
            </Pressable>
            {/* Static — no call is placed. */}
            <View style={styles.btn}>
              <Phone size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.btnText}>{d.call}</Text>
            </View>
          </View>
        </View>

        <View style={styles.next}>
          <View style={styles.nextHead}>
            <TrendingUp size={t.nextIcon} color={c.brown} strokeWidth={2.2} />
            <Text style={[styles.title, styles.nextTitle]}>{d.nextTitle}</Text>
          </View>
          <View style={styles.items}>
            {d.next.map((n, i) => (
              <View key={n} style={styles.item}>
                <View style={styles.num}>
                  <Text style={styles.numText}>{i + 1}</Text>
                </View>
                <Text style={styles.itemText}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/district-court/court-fee-payment' as Href)}
          style={styles.cta}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.foot}>
          <LockKeyhole size={t.footIcon} color={c.greenInk} strokeWidth={2.4} />
          <Text style={styles.footText}>{d.foot}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.infoGap },
  hdrSub: { fontSize: t.hdrSubSize },

  pill: {
    marginTop: t.pillTop,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peachDecide,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brown },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.brownInk },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  req: { marginTop: t.reqTop, paddingTop: t.reqPadTop, paddingBottom: t.reqPadBottom },
  reqTop: { flexDirection: 'row', alignItems: 'center', gap: t.discGap },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, backgroundColor: c.selectTile, alignItems: 'center', justifyContent: 'center' },
  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  infoTitle: { fontSize: t.infoTitleSize },
  nextTitle: { fontSize: t.nextTitleSize },
  body: { fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: c.inkWarm },
  info: {
    marginTop: t.infoTop,
    borderRadius: t.infoRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.infoPadX,
    paddingVertical: t.infoPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.infoGap,
  },
  infoText: { flex: 1, fontFamily: font.appBody, fontSize: t.infoSize, lineHeight: t.infoLineHeight, color: c.inkWarm },

  amt: { paddingTop: t.amtPadTop, paddingBottom: t.amtPadBottom },
  amtTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.amtTitleSize, color: c.ink },
  tag: {
    height: t.tagH,
    borderRadius: t.tagH / 2,
    paddingHorizontal: t.tagPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  tagGreen: { backgroundColor: c.greenBanner },
  tagDot: { width: t.tagDot, height: t.tagDot, borderRadius: t.tagDot / 2, backgroundColor: c.brown },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.brownInk },
  tagTextGreen: { color: c.greenInk },
  amtRow: { marginTop: t.amtTop, flexDirection: 'row', alignItems: 'baseline', gap: t.amtUnitGap },
  amount: { fontFamily: font.appHeading, fontSize: t.amtSize, lineHeight: t.amtLineHeight, color: c.ink },
  unit: { fontFamily: font.appBody, fontSize: t.amtUnitSize, color: c.inkWarm },
  amtDesc: { marginTop: t.amtDescTop, fontFamily: font.appBody, fontSize: t.amtDescSize, lineHeight: t.amtDescLineHeight, color: c.inkWarm },
  box: {
    marginTop: t.boxTop,
    borderRadius: t.boxRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.boxPadX,
    paddingVertical: t.boxPadY,
  },
  boxRowGap: { marginTop: t.boxRowGap },
  boxLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.boxLabelSize, lineHeight: t.boxLineHeight, color: c.ink },
  boxValue: { fontFamily: font.appSemi, fontSize: t.boxValueSize, lineHeight: t.boxLineHeight, color: c.ink },
  boxSub: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.boxSubSize, lineHeight: t.boxLineHeight, color: c.inkWarm },
  boxSubValue: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.boxSubValueSize, lineHeight: t.boxLineHeight, color: c.brownLift },

  infoCard: { paddingTop: t.infoCardPadTop, paddingBottom: t.infoCardPadBottom },
  label: { fontFamily: font.appBody, fontSize: t.labelSize, lineHeight: t.labelLineHeight, color: c.inkWarm },
  labelFirst: { marginTop: t.labelTop },
  value: { fontFamily: font.appSemi, fontSize: t.valueSize, lineHeight: t.valueLineHeight, color: c.ink },
  facts: { marginTop: t.rowGap, flexDirection: 'row', gap: t.infoGap },

  adv: { paddingTop: t.advPadTop, paddingBottom: t.advPadBottom },
  advRow: { flexDirection: 'row', alignItems: 'center', gap: t.advGap },
  advDisc: { width: t.advDisc, height: t.advDisc, borderRadius: t.advDisc / 2, backgroundColor: c.avatarTan, alignItems: 'center', justifyContent: 'center' },
  advInitials: { fontFamily: font.appSemi, fontSize: t.advInitials, color: ink.onBrand },
  advName: { fontFamily: font.appSemi, fontSize: t.advNameSize, lineHeight: t.advNameLineHeight, color: c.ink },
  advRole: { fontFamily: font.appBody, fontSize: t.advRoleSize, lineHeight: t.advRoleLineHeight, color: c.inkWarm },
  ask: { marginTop: t.askTop, fontFamily: font.appBody, fontSize: t.askSize, lineHeight: t.askLineHeight, color: c.inkWarm },
  btns: { marginTop: t.btnsTop, flexDirection: 'row', gap: t.btnGap },
  btn: {
    flex: 1,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: c.ink },

  next: {
    marginTop: t.cardGap,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachSoft,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.nextPadTop,
    paddingBottom: t.nextPadBottom,
  },
  nextHead: { flexDirection: 'row', alignItems: 'center', gap: t.nextIconGap },
  items: { marginTop: t.itemsTop, gap: t.itemGap },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: t.numGap },
  num: {
    marginTop: (t.itemLineHeight - t.num) / 2,
    width: t.num,
    height: t.num,
    borderRadius: t.num / 2,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontFamily: font.appSemi, fontSize: t.numSize, color: ink.onBrand },
  itemText: { flex: 1, fontFamily: font.appBody, fontSize: t.itemSize, lineHeight: t.itemLineHeight, color: c.ink },

  bar: { backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.tileGrey, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  cta: {
    ...shadow,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.ctaGap,
  },
  ctaText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', gap: t.infoGap },
  footText: { flex: 1, textAlign: 'center', fontFamily: font.appBody, fontSize: t.footSize, lineHeight: t.footLineHeight, color: c.inkWarm },
});

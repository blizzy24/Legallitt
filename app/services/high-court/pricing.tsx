import { router, type Href } from 'expo-router';
import { BadgeCheck, Check, CircleCheck, Clock, Landmark, LockKeyhole, ShieldCheck, Timer, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hcServicePay } from '../../../data/courtFees';
import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { HC_PRICING } from '../../../data/highCourt';
import { colors, font, hcPricing as t, hcPalette as c, ink, wizardCardShadow } from '../../../constants/theme';

// High Court — choose service & price (design/295). Measured at 2.000 px/pt.
//
// The two tiers are a real local choice (design/295 draws Urgent selected) and
// the fee summary follows it. Continue opens the shared payment screen.
//
// ⚠⚠ CONFLICT 2 — whichever tier is chosen, the payment screen that follows
// charges ₹34,999 + ₹379 = ₹40,680 (see HC_PAYMENT in data/highCourt.ts).
// ⚠ CONFLICT 1 — ₹24,999 / ₹34,999 here; design/289 says ₹18,500 / ₹28,500.
// ⚠ CONFLICT 6 — "Step 2 of 6", after design/294's "Step 3 of 4".

type TierId = (typeof HC_PRICING.tiers)[number]['id'];

export default function HighCourtPricingScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_PRICING;
  const [tier, setTier] = useState<TierId>(d.initial);
  const payment = hcServicePay(tier);
  const chosen = d.tiers.find((x) => x.id === tier)!;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/services/high-court/documents' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.step}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>{d.step}</Text>
          </View>
          <View style={styles.segs}>
            {Array.from({ length: t.segCount }, (_, i) => (
              <View key={i} style={[styles.seg, i < t.segOn && styles.segOn]} />
            ))}
          </View>
        </View>
        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.body}>{d.body}</Text>

        <View style={[styles.card, styles.matter]}>
          <View style={styles.row}>
            <Landmark size={t.mIcon} color={c.brown} strokeWidth={1.8} />
            <Text style={styles.mLbl} {...shrinkToFit(0.8)}>
              {d.matterLabel}
            </Text>
            <View style={styles.mPill}>
              <Text style={styles.mPillText}>{d.matterPill}</Text>
            </View>
          </View>
          <View style={[styles.row, styles.mTitleRow]}>
            <Text style={styles.mTitle} {...shrinkToFit(0.75)}>
              {d.matterTitle}
            </Text>
            <Text style={styles.mNew} {...shrinkToFit(0.8)}>
              {d.matterNew}
            </Text>
          </View>
          <View style={[styles.row, styles.mChk]}>
            <BadgeCheck size={t.mChkIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.mChkText} {...shrinkToFit(0.75)}>
              {d.matterCheck}
            </Text>
          </View>
        </View>

        <View style={styles.headRow}>
          <Text style={styles.head} {...shrinkToFit(0.8)}>
            {d.speedHead}
          </Text>
          <Text style={styles.headMeta} {...shrinkToFit(0.8)}>
            {d.speedMeta}
          </Text>
        </View>
        <Text style={styles.headSub}>{d.speedSub}</Text>

        {d.tiers.map((x, i) => {
          const on = tier === x.id;
          const urgent = x.id === 'urgent';
          return (
            <Pressable
              key={x.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setTier(x.id)}
              style={[styles.card, styles.tier, i > 0 && styles.tierNext, on && styles.tierOn]}
            >
              {urgent && (
                <View style={styles.rec}>
                  <Zap size={t.recIcon} color={ink.onBrand} strokeWidth={2.2} />
                  <Text style={styles.recText}>{d.recommended}</Text>
                </View>
              )}
              <View style={styles.tierHead}>
                <View style={[styles.radio, on && styles.radioOn]}>
                  {on && <Check size={t.radioGlyph} color={ink.onBrand} strokeWidth={3} />}
                </View>
                <View style={styles.flex}>
                  <View style={styles.tierTitleRow}>
                    <Text style={styles.tierTitle}>{x.title}</Text>
                    <View style={[styles.tierPill, urgent && styles.tierPillPeach]}>
                      <Text style={[styles.tierPillText, urgent && styles.tierPillTextBrown]}>{x.pill}</Text>
                    </View>
                  </View>
                  <Text style={styles.tierDesc}>{x.desc}</Text>
                </View>
                {!urgent && (
                  <Text style={styles.price} {...shrinkToFit(0.8)}>
                    {x.price}
                  </Text>
                )}
              </View>
              <View style={styles.timeRow}>
                <View style={[styles.time, urgent && styles.timeSage]}>
                  {urgent ? (
                    <Timer size={t.timeIcon} color={c.greenInk} strokeWidth={2} />
                  ) : (
                    <Clock size={t.timeIcon} color={c.inkWarm} strokeWidth={2} />
                  )}
                  <Text style={[styles.timeText, urgent && styles.timeTextGreen]}>{x.time}</Text>
                </View>
                {urgent && (
                  <Text style={styles.price} {...shrinkToFit(0.8)}>
                    {x.price}
                  </Text>
                )}
              </View>
              <View style={styles.bullets}>
                {x.bullets.map((b) => (
                  <View key={b} style={styles.bullet}>
                    <CircleCheck size={t.bulletIcon} color={c.greenInk} strokeWidth={2} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}

        <Text style={[styles.head, styles.feeHead]}>{d.feeHead}</Text>
        <Text style={styles.headSub}>{d.feeSub}</Text>
        <View style={[styles.card, styles.fee]}>
          {[d.feeRows.service, d.feeRows.category].map(([l, v]) => (
            <View key={l} style={styles.feeRow}>
              <Text style={styles.feeLabel}>{l}</Text>
              <Text style={styles.feeValue} {...shrinkToFit(0.8)}>
                {v}
              </Text>
            </View>
          ))}
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{d.feeRows.speed}</Text>
            <View style={styles.feePill}>
              <Text style={styles.feePillText}>{chosen.speed}</Text>
            </View>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{d.feeRows.base}</Text>
            <Text style={styles.feeValue}>{chosen.price}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>GST (18%)</Text>
            <Text style={styles.feeValue}>{payment.lines[1].value}</Text>
          </View>
          <View style={styles.rule} />
          <View style={styles.totalRow}>
            <View style={styles.flex}>
              <Text style={styles.totalLbl}>{d.totalLabel}</Text>
              <Text style={styles.totalSub}>{d.totalSub}</Text>
            </View>
            <Text style={styles.total} {...shrinkToFit(0.75)}>
              {payment.total}
            </Text>
          </View>
        </View>

        <View style={styles.z}>
          <View style={styles.zDisc}>
            <ShieldCheck size={t.zGlyph} color={c.brown} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.zTitle}>{d.zTitle}</Text>
            <Text style={styles.zBody}>{d.zBody}</Text>
            <View style={styles.zGreenRow}>
              <Check size={t.zGreenIcon} color={c.greenInk} strokeWidth={2.4} />
              <Text style={styles.zGreen}>{d.zGreen}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.footPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/services/high-court/payment?tier=${tier}` as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
        </Pressable>
        <View style={styles.foot}>
          <LockKeyhole size={t.footIcon} color={c.greenInk} strokeWidth={2.2} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            {d.foot}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center' },

  topRow: { marginTop: t.topTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: {
    flexShrink: 1,
    maxWidth: t.stepW,
    marginRight: t.segGap,
    borderRadius: t.stepRadius,
    paddingHorizontal: t.stepPadX,
    paddingVertical: t.stepPadY,
    backgroundColor: c.peachStep,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stepDotGap,
  },
  stepDot: { width: t.stepDot, height: t.stepDot, borderRadius: t.stepDot / 2, backgroundColor: c.brown },
  stepText: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.stepSize,
    lineHeight: t.stepLineHeight,
    letterSpacing: t.stepSpacing,
    color: c.brownInk,
  },
  segs: { flexShrink: 0, flexDirection: 'row', gap: t.segGap },
  seg: { width: t.segW, height: t.segH, borderRadius: t.segH / 2, backgroundColor: c.radioGrey },
  segOn: { backgroundColor: c.brown },
  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, color: c.ink },
  body: {
    marginTop: t.bodyTop,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: c.inkWarm,
  },

  card: {
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPad,
  },
  matter: { marginTop: t.cardTop },
  mLbl: {
    flex: 1,
    marginLeft: t.mIconGap,
    fontFamily: font.appSemi,
    fontSize: t.mLblSize,
    letterSpacing: t.mLblSpacing,
    color: c.brownInk,
  },
  mPill: { height: t.mPillH, borderRadius: t.mPillRadius, paddingHorizontal: t.mPillPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  mPillText: { fontFamily: font.appSemi, fontSize: t.mPillSize, color: c.inkWarm },
  mTitleRow: { marginTop: t.mTitleTop, justifyContent: 'space-between' },
  mTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.mTitleSize, color: c.ink },
  mNew: { marginLeft: t.mChkGap, fontFamily: font.appSemi, fontSize: t.mNewSize, color: c.greenInk },
  mChk: { marginTop: t.mChkTop, gap: t.mChkGap },
  mChkText: { flex: 1, fontFamily: font.appBody, fontSize: t.mChkSize, color: c.inkWarm },

  headRow: { marginTop: t.headTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  head: { fontFamily: font.appSemi, fontSize: t.headSize, color: c.ink },
  headMeta: { fontFamily: font.appBody, fontSize: t.headMetaSize, color: c.inkWarm },
  headSub: { marginTop: t.headSubTop, fontFamily: font.appBody, fontSize: t.headSubSize, color: c.inkWarm },

  tier: { marginTop: t.tierTop, paddingTop: t.tierPadTop },
  tierNext: { marginTop: t.tierGap },
  tierOn: { backgroundColor: c.peachSoft, ...wizardCardShadow },
  rec: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: t.recH,
    paddingHorizontal: t.recPadX,
    borderTopRightRadius: t.cardRadius,
    borderBottomLeftRadius: t.recRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.recGap,
  },
  recText: { fontFamily: font.appSemi, fontSize: t.recSize, color: ink.onBrand },
  tierHead: { flexDirection: 'row', alignItems: 'flex-start' },
  radio: {
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    marginRight: t.radioGap,
    backgroundColor: c.radioGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: c.greenInk },
  tierTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.tierPillGap },
  tierTitle: { fontFamily: font.appSemi, fontSize: t.tierTitleSize, color: c.ink },
  tierPill: { height: t.tierPillH, borderRadius: t.tierPillRadius, paddingHorizontal: t.tierPillPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  tierPillPeach: { backgroundColor: c.peachStep },
  tierPillText: { fontFamily: font.appSemi, fontSize: t.tierPillSize, color: c.inkWarm },
  tierPillTextBrown: { color: c.brownInk },
  tierDesc: { marginTop: t.tierDescTop, fontFamily: font.appBody, fontSize: t.tierDescSize, color: c.inkWarm },
  price: { marginLeft: t.radioGap, fontFamily: font.appHeading, fontSize: t.tierPriceSize, color: c.ink },
  timeRow: { marginTop: t.timeTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: {
    flexShrink: 1,
    minHeight: t.timeH,
    borderRadius: t.timeRadius,
    paddingHorizontal: t.timePadX,
    paddingVertical: t.stepPadY / 2,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.timeGap,
  },
  timeSage: { backgroundColor: c.sage, maxWidth: t.timeMaxW },
  timeText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.timeSize, lineHeight: t.timeLineHeight, color: c.inkWarm },
  timeTextGreen: { color: c.greenInk },
  bullets: { marginTop: t.bulletsTop, gap: t.bulletPitch },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: t.bulletGap },
  bulletText: { flex: 1, fontFamily: font.appBody, fontSize: t.bulletSize, color: c.ink },

  feeHead: { marginTop: t.feeTop },
  fee: { marginTop: t.feeRows, gap: t.feeRowGap },
  feeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feeLabel: { fontFamily: font.appBody, fontSize: t.feeLabelSize, color: c.inkWarm },
  feeValue: { flexShrink: 1, marginLeft: t.radioGap, fontFamily: font.appBody, fontSize: t.feeValueSize, color: c.ink },
  feePill: { height: t.feePillH, borderRadius: t.feePillRadius, paddingHorizontal: t.feePillPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  feePillText: { fontFamily: font.appBody, fontSize: t.feeValueSize, color: c.inkWarm },
  rule: { marginTop: t.feeRuleTop - t.feeRowGap, height: 1, backgroundColor: c.radioGrey },
  totalRow: { marginTop: t.feeTotalTop - t.feeRowGap, flexDirection: 'row', alignItems: 'center' },
  totalLbl: { fontFamily: font.appSemi, fontSize: t.feeTotalLblSize, letterSpacing: t.feeTotalLblSpacing, color: c.inkWarm },
  totalSub: { fontFamily: font.appBody, fontSize: t.feeTotalSubSize, color: c.inkWarm },
  total: { marginLeft: t.radioGap, fontFamily: font.appHeading, fontSize: t.feeTotalSize, color: c.ink },

  z: {
    marginTop: t.zTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    padding: t.zPad,
    paddingTop: t.zPadTop,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  zDisc: {
    width: t.zDisc,
    height: t.zDisc,
    borderRadius: t.zDisc / 2,
    marginRight: t.zGap,
    backgroundColor: c.radioGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zTitle: { fontFamily: font.appSemi, fontSize: t.zTitleSize, color: c.ink },
  zBody: { marginTop: t.zBodyTop, fontFamily: font.appBody, fontSize: t.zBodySize, lineHeight: t.zBodyLineHeight, color: c.inkWarm },
  zGreenRow: { marginTop: t.zGreenTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.footGap },
  zGreen: { flex: 1, fontFamily: font.appSemi, fontSize: t.zGreenSize, lineHeight: t.zGreenLineHeight, color: c.greenInk },

  bar: { backgroundColor: c.card, paddingHorizontal: t.padX, paddingTop: t.barPadTop },
  btn: { height: t.btnH, borderRadius: t.btnRadius, backgroundColor: c.brown, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.footSize, color: colors.textBody },
});

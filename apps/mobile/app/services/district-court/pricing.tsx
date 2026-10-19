import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  CircleCheck,
  ClipboardCheck,
  Clock,
  FoldHorizontal,
  Gavel,
  Info,
  Landmark,
  ShieldCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import DistrictStepper from '../../../components/DistrictStepper';
import { shrinkToFit } from '../../../constants/textFit';
import {
  dcPricing as t,
  dcPricingPalette as p,
  font,
  hcPalette as c,
  ink,
  shadow,
} from '../../../constants/theme';
import { DC_PRICING } from '../../../data/districtCourt';

// District Court — choose service & price (design/343). Measured at 2.000 px/pt.
// Reached from Continue to Submission on design/342; the button opens the
// review (design/344) — see the "Proceed to Pay" note in data/districtCourt.ts.
//
// The two service cards are a real local choice (Ordinary is drawn selected);
// "Service Selected" and "Total Price" in the summary follow it. The summary's
// other rows are the drawn values.

const CHIP_ICON = { gavel: Gavel, court: Landmark } as const;

type TierId = (typeof DC_PRICING.tiers)[number]['id'];

export default function DistrictPricingScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_PRICING;
  const [tier, setTier] = useState<TierId>('ordinary');
  const chosen = d.tiers.find((x) => x.id === tier) ?? d.tiers[0];

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        plainChevron
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        backHref={'/services/district-court/documents' as Href}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.steps}>
          <View style={styles.between}>
            <View style={styles.pill}>
              <Text style={styles.pillText} {...shrinkToFit(0.8)}>
                {d.step}
              </Text>
            </View>
            <Text style={styles.final} {...shrinkToFit(0.8)}>
              {d.final}
            </Text>
          </View>
          <View style={styles.stepper}>
            <DistrictStepper labels={d.steps} done={3} current={3} compact />
          </View>
          <View style={styles.chips}>
            {d.chips.map((ch) => {
              const Icon = CHIP_ICON[ch.icon];
              return (
                <View key={ch.label} style={styles.chip}>
                  <Icon size={t.chipIcon} color={c.inkWarm} strokeWidth={2} />
                  <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                    {ch.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.lead}>{d.lead}</Text>
        <View style={styles.info}>
          <Info size={t.infoIcon} color={c.inkWarm} strokeWidth={1.9} />
          <Text style={styles.infoText}>{d.info}</Text>
        </View>

        {d.tiers.map((x, i) => {
          const on = tier === x.id;
          return (
            <Pressable
              key={x.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setTier(x.id)}
              style={[styles.tier, i === 0 ? styles.tierFirst : styles.tierNext, on ? styles.tierOn : styles.tierOff]}
            >
              <View style={styles.tierHead}>
                <View style={styles.flex}>
                  <View style={styles.tierTitleRow}>
                    <Text style={styles.tierTitle} {...shrinkToFit(0.8)}>
                      {x.title}
                    </Text>
                    <View style={[styles.tierChip, x.id === 'urgent' && styles.tierChipPeach]}>
                      <Text style={[styles.tierChipText, x.id === 'urgent' && styles.tierChipTextPeach]}>{x.chip}</Text>
                    </View>
                  </View>
                  <Text style={styles.tierSub}>{x.sub}</Text>
                </View>
                <View style={[styles.radio, on && styles.radioOn]} />
              </View>
              <Text style={styles.price} {...shrinkToFit(0.8)}>
                {x.price}
              </Text>
              <View style={styles.feats}>
                {x.feats.map((f) => (
                  <View key={f} style={styles.feat}>
                    <CircleCheck size={t.featIcon} color={c.greenInk} strokeWidth={2} />
                    <Text style={styles.featText} {...shrinkToFit(0.8)}>
                      {f}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.foot}>{d.tierFoot}</Text>
            </Pressable>
          );
        })}

        <View style={styles.diff}>
          <View style={styles.diffHead}>
            <FoldHorizontal size={t.diffIcon} color={c.brown} strokeWidth={2} />
            <Text style={styles.diffTitle} {...shrinkToFit(0.8)}>
              {d.diffTitle}
            </Text>
          </View>
          <View style={styles.diffTiles}>
            {d.diff.map(([title, body]) => (
              <View key={title} style={styles.diffTile}>
                <Text style={styles.diffTileTitle}>{title}</Text>
                <Text style={styles.diffTileBody}>{body}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.diffNote}>{d.diffNote}</Text>
        </View>

        <View style={styles.sum}>
          <View style={styles.between}>
            <Text style={styles.sumTitle} {...shrinkToFit(0.8)}>
              {d.sumTitle}
            </Text>
            <View style={styles.sumChip}>
              <Text style={styles.sumChipText}>{d.sumChip}</Text>
            </View>
          </View>
          <View style={styles.rows}>
            {d.rows.map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
                  {value}
                </Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.selectedLabel}</Text>
              <Text style={styles.rowAccent}>{chosen.title}</Text>
            </View>
          </View>
          <View style={styles.total}>
            <Text style={styles.totalLabel}>{d.totalLabel}</Text>
            <Text style={styles.totalValue}>{chosen.price}</Text>
          </View>
          <Text style={styles.sumNote}>{d.sumNote}</Text>
        </View>

        <View style={[styles.note, styles.before]}>
          <ClipboardCheck size={t.noteIcon} color={c.brownInk} strokeWidth={2} />
          <View style={styles.flex}>
            <Text style={[styles.noteTitle, styles.beforeInk]}>{d.beforeTitle}</Text>
            <Text style={[styles.noteBody, styles.beforeInk]}>{d.beforeBody}</Text>
          </View>
        </View>

        <View style={[styles.note, styles.support]}>
          <ShieldCheck size={t.noteIcon} color={c.greenInk} strokeWidth={2} />
          <View style={styles.flex}>
            <Text style={styles.noteTitle}>{d.supportTitle}</Text>
            <Text style={[styles.noteBody, styles.supportBody]}>{d.supportBody}</Text>
            <Text style={[styles.noteBody, styles.supportNote]}>{d.supportNote}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/services/district-court/review' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.cap}>
          <Clock size={t.capIcon} color={c.inkWarm} strokeWidth={2} />
          <Text style={styles.capText} {...shrinkToFit(0.75)}>
            {d.caption}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.chipGap },

  steps: {
    marginTop: t.stepsTop,
    borderRadius: t.stepsRadius,
    padding: t.stepsPad,
    backgroundColor: c.card,
    ...shadow,
  },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peach,
    justifyContent: 'center',
    flexShrink: 1,
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.brownInk },
  final: { fontFamily: font.appBody, fontSize: t.finalSize, color: c.inkWarm },
  stepper: { marginTop: t.stepperTop, marginHorizontal: t.stepperInset },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.chipGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipGap,
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.inkWarm },

  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  lead: {
    marginTop: t.leadTop,
    fontFamily: font.appBody,
    fontSize: t.leadSize,
    lineHeight: t.leadLineHeight,
    color: c.inkWarm,
  },
  info: {
    marginTop: t.infoTop,
    borderRadius: t.infoRadius,
    paddingHorizontal: t.infoPadX,
    paddingVertical: t.infoPadY,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.infoGap,
  },
  infoText: { flex: 1, fontFamily: font.appBody, fontSize: t.infoSize, lineHeight: t.infoLineHeight, color: c.inkWarm },

  tier: { borderRadius: t.tierRadius, padding: t.tierPad },
  tierFirst: { marginTop: t.tierTop },
  tierNext: { marginTop: t.tierGap },
  tierOn: { backgroundColor: p.tierOn, ...shadow },
  tierOff: { backgroundColor: c.card, ...shadow },
  tierHead: { flexDirection: 'row', alignItems: 'flex-start', gap: t.tierChipGap },
  tierTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.tierChipGap },
  tierTitle: { fontFamily: font.appSemi, fontSize: t.tierTitleSize, lineHeight: t.tierTitleLineHeight, color: c.ink },
  tierChip: {
    height: t.tierChipH,
    borderRadius: t.tierChipH / 2,
    paddingHorizontal: t.tierChipPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  tierChipPeach: { backgroundColor: c.peach },
  tierChipText: { fontFamily: font.appSemi, fontSize: t.tierChipSize, letterSpacing: t.tierChipSpacing, color: c.inkWarm },
  tierChipTextPeach: { color: c.brownInk },
  tierSub: { fontFamily: font.appBody, fontSize: t.tierSubSize, lineHeight: t.tierSubLineHeight, color: c.inkWarm },
  radio: { width: t.radio, height: t.radio, borderRadius: t.radio / 2, backgroundColor: c.tileGrey },
  radioOn: { backgroundColor: c.card, borderWidth: t.radioRing, borderColor: c.brown },
  price: { marginTop: t.priceTop, fontFamily: font.appHeading, fontSize: t.priceSize, lineHeight: t.priceLineHeight, color: c.ink },
  feats: { marginTop: t.featsTop },
  feat: { minHeight: t.featH, flexDirection: 'row', alignItems: 'center', gap: t.featGap },
  featText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.featSize, color: c.ink },
  foot: { marginTop: t.footTop, fontFamily: font.appBody, fontSize: t.footSize, lineHeight: t.footLineHeight, color: c.inkWarm },

  diff: { marginTop: t.diffTop, borderRadius: t.diffRadius, padding: t.diffPad, backgroundColor: c.tileGrey },
  diffHead: { flexDirection: 'row', alignItems: 'center', gap: t.diffGap },
  diffTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.diffTitleSize, lineHeight: t.diffTitleLineHeight, color: c.ink },
  diffTiles: { marginTop: t.diffTilesTop, flexDirection: 'row', gap: t.diffTileGap },
  diffTile: { flex: 1, minWidth: 0, borderRadius: t.diffTileRadius, padding: t.diffTilePad, backgroundColor: c.card },
  diffTileTitle: {
    fontFamily: font.appSemi,
    fontSize: t.diffTileTitleSize,
    lineHeight: t.diffTileTitleLineHeight,
    color: c.ink,
  },
  diffTileBody: {
    marginTop: t.diffTileBodyTop,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    lineHeight: t.footLineHeight,
    color: c.inkWarm,
  },
  diffNote: {
    marginTop: t.diffNoteTop,
    fontFamily: font.appBody,
    fontSize: t.diffNoteSize,
    lineHeight: t.diffNoteLineHeight,
    color: c.inkWarm,
  },

  sum: { marginTop: t.sumTop, borderRadius: t.tierRadius, padding: t.tierPad, backgroundColor: c.card, ...shadow },
  sumTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.sumTitleSize, lineHeight: t.sumTitleLineHeight, color: c.ink },
  sumChip: {
    height: t.sumChipH,
    borderRadius: t.sumChipH / 2,
    paddingHorizontal: t.sumChipPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  sumChipText: { fontFamily: font.appSemi, fontSize: t.sumChipSize, letterSpacing: t.sumChipSpacing, color: c.inkWarm },
  rows: { marginTop: t.rowsTop },
  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.chipGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.inkWarm },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    letterSpacing: t.rowValueSpacing,
    color: c.ink,
  },
  rowAccent: { fontFamily: font.appSemi, fontSize: t.rowAccentSize, color: c.brown },
  total: {
    marginTop: t.totalTop,
    minHeight: t.totalH,
    borderRadius: t.totalRadius,
    paddingHorizontal: t.totalPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { fontFamily: font.appSemi, fontSize: t.totalLabelSize, color: c.ink },
  totalValue: { fontFamily: font.appSemi, fontSize: t.totalValueSize, color: c.brown },
  sumNote: {
    marginTop: t.sumNoteTop,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    lineHeight: t.sumNoteLineHeight,
    color: c.inkWarm,
  },

  note: { borderRadius: t.tierRadius, padding: t.tierPad, flexDirection: 'row', gap: t.noteGap },
  before: { marginTop: t.beforeTop, backgroundColor: c.peachDecide },
  beforeInk: { color: c.brownInk },
  support: { marginTop: t.supportTop, backgroundColor: c.card, ...shadow },
  noteTitle: { fontFamily: font.appSemi, fontSize: t.noteTitleSize, lineHeight: t.noteTitleLineHeight, color: c.ink },
  noteBody: {
    marginTop: t.noteBodyTop,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLineHeight,
    color: c.inkWarm,
  },
  supportBody: { paddingRight: t.supportPadRight, lineHeight: t.supportBodyLineHeight },
  supportNote: { marginTop: t.supportNoteTop, color: p.noteInk },

  btn: {
    marginTop: t.btnTop,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
    ...shadow,
  },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  cap: { marginTop: t.capTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.capGap },
  capText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.inkWarm },
});

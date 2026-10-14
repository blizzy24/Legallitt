import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  DoorOpen,
  FileText,
  FolderOpen,
  Gavel,
  Hourglass,
  IdCard,
  Info,
  LockKeyhole,
  Paperclip,
  Truck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import { font, hcDelivered as t, hcPalette as c, ink, shadow } from '../../../../constants/theme';
import { HC_DELIVERED } from '../../../../data/highCourt';

// High Court courier — documents delivered (design/312). Measured at 2.000 px/pt.
//
// ⚠ UNREACHABLE BY DESIGN — no drawn control on design/311 leads here (Refresh
// Tracking is static). It is linked as a development preview state on Home.
//
// Conflicts 4, 5 and 6 are commented on HC_DELIVERED.
//
// STATIC: nothing was delivered; Copy copies nothing; the docket is a drawing.
// The waiting card's decorative cut-out at its right edge is not drawn here —
// no asset. Back to Home and Close return Home; the help link opens support chat.

const CHIP_ICON = { file: FileText, id: IdCard, gavel: Gavel, clip: Paperclip } as const;

export default function HighCourtDeliveredScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_DELIVERED;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} close center backHref={'/(tabs)/home' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ring}>
          <View style={styles.ringCore}>
            <Check size={t.ringGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.sub}>{d.sub}</Text>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            {d.pill}
          </Text>
        </View>

        <View style={[styles.card, styles.det]}>
          <View style={styles.strip}>
            <Truck size={t.stripIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.detTitle}
            </Text>
            <View style={styles.signed}>
              <Check size={t.signedIcon} color={c.greenInk} strokeWidth={2.4} />
              <Text style={styles.signedText}>{d.signed}</Text>
            </View>
          </View>
          <View style={styles.detBody}>
            <View style={styles.grid}>
              {d.grid.map(([label, value], i) => (
                <View key={label} style={styles.cell}>
                  <Text style={styles.label}>{label}</Text>
                  <View style={styles.valueRow}>
                    <Text style={[styles.value, i === 1 && styles.underline]} {...shrinkToFit(0.75)}>
                      {value}
                    </Text>
                    {/* Inert — nothing is copied. */}
                    {i === 1 && <Copy size={t.copyIcon} color={c.ink} strokeWidth={1.9} />}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.box}>
              <DoorOpen size={t.boxIcon} color={c.inkWarm} strokeWidth={1.9} />
              <View style={styles.flex}>
                <Text style={[styles.label, styles.brownText]}>{d.toLabel}</Text>
                <Text style={styles.boxName}>{d.toName}</Text>
                <Text style={styles.boxAddr}>{d.toAddr}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.docs]}>
          <View style={styles.head}>
            <FolderOpen size={t.stripIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.title}>{d.docsTitle}</Text>
            <View style={styles.count}>
              <Text style={styles.countText}>{d.count}</Text>
            </View>
          </View>
          <View style={styles.chips}>
            {d.chips.map((ch) => {
              const Icon = CHIP_ICON[ch.icon];
              return (
                <View key={ch.label} style={styles.chip}>
                  <Icon size={t.chipIcon} color={c.ink} strokeWidth={1.8} />
                  <Text style={styles.chipText}>{ch.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.sec}>
            <View style={styles.between}>
              <Text style={styles.secLabel} {...shrinkToFit(0.75)}>
                {d.secLabel}
              </Text>
              <View style={styles.secState}>
                <BadgeCheck size={t.signedIcon + 2} color={c.greenInk} strokeWidth={2} />
                <Text style={styles.signedText}>{d.secState}</Text>
              </View>
            </View>
            <View style={styles.secRow}>
              <LockKeyhole size={t.secIcon} color={c.inkWarm} strokeWidth={2} />
              <Text style={styles.secText}>{d.sec}</Text>
            </View>
          </View>
        </View>

        <View style={styles.wait}>
          <View style={styles.waitDisc}>
            <Hourglass size={t.waitGlyph} color={c.brownInk} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <View style={styles.waitHead}>
              <Text style={styles.waitTitle} {...shrinkToFit(0.8)}>
                {d.waitTitle}
              </Text>
              <View style={styles.waitDot} />
            </View>
            <Text style={styles.waitBody}>{d.waitBody}</Text>
            <View style={styles.waitPill}>
              <Info size={t.waitPillIcon} color={c.ink} strokeWidth={2} />
              <Text style={styles.waitPillText} {...shrinkToFit(0.75)}>
                {d.waitPill}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.docket]}>
          <View style={styles.between}>
            <Text style={styles.title}>{d.docketTitle}</Text>
            <Text style={styles.docketMeta}>{d.docketStep}</Text>
          </View>
          <View style={styles.steps}>
            {d.steps.map((s, i) => {
              const last = i === d.steps.length - 1;
              return (
                <View key={s.title} style={[styles.step, !last && styles.stepSpaced]}>
                  <View style={styles.railCol}>
                    {s.state === 'done' && (
                      <View style={[styles.disc, styles.discDone]}>
                        <Check size={t.discGlyph} color={ink.onBrand} strokeWidth={3} />
                      </View>
                    )}
                    {s.state === 'active' && <View style={styles.discActive} />}
                    {s.state === 'next' && (
                      <View style={[styles.disc, styles.discNext]}>
                        <View style={styles.nextDot} />
                      </View>
                    )}
                    {!last && <View style={styles.rail} />}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.stepHead}>
                      <Text
                        style={[
                          styles.stepTitle,
                          s.state === 'active' && styles.brownText,
                          s.state === 'next' && styles.mutedText,
                        ]}
                        {...shrinkToFit(0.8)}
                      >
                        {s.title}
                      </Text>
                      {'chip' in s && (
                        <View style={styles.chipTag}>
                          <Text style={styles.chipTagText}>{s.chip}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.stepDesc, s.state === 'next' && styles.mutedText]}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home' as Href)} style={styles.btn}>
          <Text style={styles.btnText}>{d.cta}</Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.help}>
          {d.help}
          <Text style={styles.helpLink} onPress={() => router.push('/support-chat' as Href)}>
            {d.helpLink}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.stripGap },
  brownText: { color: c.brownInk },
  mutedText: { color: c.inkMuted },

  ring: {
    marginTop: t.ringTop,
    alignSelf: 'center',
    width: t.ring,
    height: t.ring,
    borderRadius: t.ring / 2,
    borderWidth: t.ringBorder,
    borderColor: c.greenTile,
    backgroundColor: c.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCore: {
    width: t.ringCore,
    height: t.ringCore,
    borderRadius: t.ringCore / 2,
    backgroundColor: c.greenInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: { marginTop: t.h1Top, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  sub: { marginTop: t.subTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.inkWarm },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'center',
    maxWidth: '100%',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.greenInk },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, color: c.inkWarm },

  card: { ...shadow, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card },
  det: { marginTop: t.detTop, overflow: 'hidden', paddingBottom: t.detPadBottom },
  strip: { height: t.stripH, backgroundColor: c.page, paddingHorizontal: t.cardPadX, flexDirection: 'row', alignItems: 'center', gap: t.stripGap },
  title: { flex: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  signed: {
    height: t.signedH,
    borderRadius: t.signedH / 2,
    paddingHorizontal: t.signedPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.signedGap,
  },
  signedText: { fontFamily: font.appSemi, fontSize: t.signedSize, color: c.greenInk },
  detBody: { paddingHorizontal: t.cardPadX },
  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap', rowGap: t.gridRowGap },
  cell: { width: '50%', minWidth: 0 },
  label: { fontFamily: font.appBody, fontSize: t.labelSize, lineHeight: t.labelLineHeight, color: c.inkWarm },
  valueRow: { marginTop: t.valueTop, flexDirection: 'row', alignItems: 'center', gap: t.signedGap },
  value: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.valueSize, lineHeight: t.valueLineHeight, color: c.ink },
  underline: { textDecorationLine: 'underline' },
  box: {
    marginTop: t.boxTop,
    borderRadius: t.boxRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.boxPadX,
    paddingTop: t.boxPadTop,
    paddingBottom: t.boxPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.boxGap,
  },
  boxName: { fontFamily: font.appSemi, fontSize: t.boxNameSize, lineHeight: t.boxNameLineHeight, color: c.ink },
  boxAddr: { fontFamily: font.appBody, fontSize: t.boxAddrSize, lineHeight: t.boxAddrLineHeight, color: c.inkWarm },

  docs: { paddingHorizontal: t.cardPadX, paddingTop: t.docsPadTop, paddingBottom: t.docsPadBottom },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.stripGap },
  count: { height: t.countH, borderRadius: t.countH / 2, paddingHorizontal: t.countPadX, backgroundColor: c.panel, justifyContent: 'center' },
  countText: { fontFamily: font.appSemi, fontSize: t.countSize, color: c.inkWarm },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', columnGap: t.chipGap, rowGap: t.chipRowGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipIconGap,
  },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: c.ink },
  sec: {
    marginTop: t.secTop,
    borderRadius: t.boxRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.secPadX,
    paddingTop: t.secPadTop,
    paddingBottom: t.secPadBottom,
  },
  secLabel: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.secLabelSize, lineHeight: t.secLabelLineHeight, color: c.inkWarm },
  secState: { flexDirection: 'row', alignItems: 'center', gap: t.signedGap },
  secRow: { marginTop: t.secRowTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.secGap },
  secText: { flex: 1, fontFamily: font.appBody, fontSize: t.secSize, lineHeight: t.secLineHeight, color: c.inkWarm },

  wait: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingLeft: t.waitPadL,
    paddingRight: t.waitPadR,
    paddingTop: t.waitPadTop,
    paddingBottom: t.waitPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.waitGap,
  },
  waitDisc: {
    marginTop: t.waitDiscTop,
    width: t.waitDisc,
    height: t.waitDisc,
    borderRadius: t.waitDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitHead: { flexDirection: 'row', alignItems: 'center', gap: t.stripGap },
  waitTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.waitTitleSize, lineHeight: t.waitTitleLineHeight, color: c.ink },
  waitDot: { width: t.waitDot, height: t.waitDot, borderRadius: t.waitDot / 2, backgroundColor: c.brown },
  waitBody: { marginTop: t.waitBodyTop, fontFamily: font.appBody, fontSize: t.waitBodySize, lineHeight: t.waitBodyLineHeight, color: c.inkWarm },
  waitPill: {
    marginTop: t.waitPillTop,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: t.waitPillH,
    borderRadius: t.waitPillH / 2,
    paddingHorizontal: t.waitPillPadX,
    backgroundColor: c.radioGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.signedGap + 2,
  },
  waitPillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.waitPillSize, color: c.ink },

  docket: { paddingHorizontal: t.cardPadX, paddingTop: t.docketPadTop, paddingBottom: t.docketPadBottom },
  docketMeta: { fontFamily: font.appBody, fontSize: t.docketMetaSize, color: c.inkWarm },
  steps: { marginTop: t.stepsTop },
  step: { flexDirection: 'row', gap: t.stepGap },
  stepSpaced: { minHeight: t.stepPitch },
  railCol: { width: t.activeRing, alignItems: 'center', paddingTop: (t.stepTitleLineHeight - t.disc) / 2 },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center' },
  discDone: { backgroundColor: c.greenInk },
  discActive: {
    marginTop: (t.disc - t.activeRing) / 2,
    marginBottom: (t.disc - t.activeRing) / 2,
    width: t.activeRing,
    height: t.activeRing,
    borderRadius: t.activeRing / 2,
    borderWidth: t.activeBorder,
    borderColor: c.brown,
    backgroundColor: c.card,
  },
  discNext: { borderWidth: t.nextBorder, borderColor: c.radioGrey, backgroundColor: c.card },
  nextDot: { width: t.nextDot, height: t.nextDot, borderRadius: t.nextDot / 2, backgroundColor: c.radioGrey },
  rail: { flex: 1, width: 2, backgroundColor: c.radioGrey },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: t.stripGap },
  stepTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  stepDesc: { fontFamily: font.appBody, fontSize: t.stepDescSize, lineHeight: t.stepDescLineHeight, color: c.inkWarm },
  chipTag: { height: t.chipTagH, borderRadius: t.chipTagRadius, paddingHorizontal: t.chipTagPadX, backgroundColor: c.peach, justifyContent: 'center' },
  chipTagText: { fontFamily: font.appSemi, fontSize: t.chipTagSize, color: c.brownInk },

  bar: { backgroundColor: c.page, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  help: { marginTop: t.helpTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.helpSize, lineHeight: t.helpLineHeight, color: c.inkWarm },
  helpLink: { fontFamily: font.appSemi, color: c.brownInk, textDecorationLine: 'underline' },
});

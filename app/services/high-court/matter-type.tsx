import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Building2,
  Check,
  CircleHelp,
  Contact,
  Ellipsis,
  FileText,
  Gavel,
  LockKeyhole,
  LockOpen,
  Scale,
  ShieldCheck,
  Upload,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { HC_MATTER_TYPE } from '../../../data/highCourt';
import { font, hcMatterType as t, hcPalette as c, ink, status } from '../../../constants/theme';

// High Court — matter type, headed "Case Verification" (design/292). Measured
// at 2.000 px/pt.
//
// The eight cards are a real local choice; design/292 draws Civil selected
// (peach fill, brown tile with a white glyph, green tick). Each card's text sits
// at the foot of the card, so one-line and two-line descriptions end level.
// Continue opens Case Details (design/293).
//
// ⚠ CONFLICT 6 — "Step 1 • High Court", one screen after design/291's "Step 1
// of 4 • Intake". Both as drawn.

type MatterId = (typeof HC_MATTER_TYPE.matters)[number]['id'];
const ICONS: Record<MatterId, LucideIcon> = {
  writ: FileText,
  civil: Scale,
  criminal: Gavel,
  bail: LockOpen,
  appeal: Upload,
  service: Contact,
  property: Building2,
  other: Ellipsis,
};

export default function HighCourtMatterTypeScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_MATTER_TYPE;
  const [matter, setMatter] = useState<MatterId>(d.initial);

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/services/high-court/case-type' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.step}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText} {...shrinkToFit(0.8)}>
              {d.step}
            </Text>
          </View>
          <View style={styles.verified}>
            <ShieldCheck size={t.verifiedIcon} color={ink.onBrand} fill={status.active} strokeWidth={2} />
            <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
              {d.verified}
            </Text>
          </View>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.body}>{d.body}</Text>

        <View style={styles.secRow}>
          <Text style={styles.secTitle} {...shrinkToFit(0.8)}>
            {d.secTitle}
          </Text>
          <Text style={styles.secMeta} {...shrinkToFit(0.8)}>
            {d.secMeta}
          </Text>
        </View>

        <View style={styles.grid}>
          {d.matters.map((m) => {
            const on = matter === m.id;
            const Icon = ICONS[m.id];
            return (
              <Pressable
                key={m.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setMatter(m.id)}
                style={[styles.card, on && styles.cardOn]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.tile, on && styles.tileOn]}>
                    <Icon size={t.tileIcon} color={on ? ink.onBrand : c.brown} strokeWidth={1.9} />
                  </View>
                  <View style={[styles.mark, on && styles.markOn]}>
                    {on && <Check size={t.markGlyph} color={ink.onBrand} strokeWidth={3} />}
                  </View>
                </View>
                <Text style={styles.title} {...shrinkToFit(0.8)}>
                  {m.title}
                </Text>
                <Text style={styles.desc}>{m.desc}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.note}>
          <View style={styles.noteIcon}>
            <CircleHelp size={t.noteIconGlyph} color={c.brown} strokeWidth={2} />
          </View>
          <View style={styles.noteCol}>
            <Text style={styles.noteTitle}>{d.noteTitle}</Text>
            <Text style={styles.noteBody}>
              {d.noteLines.map((line, i) => (
                <Text key={i}>
                  {i > 0 ? '\n' : ''}
                  {line.map((part, j) =>
                    part === 'Other' ? (
                      <Text key={j} style={styles.noteStrong}>
                        {part}
                      </Text>
                    ) : (
                      part
                    ),
                  )}
                </Text>
              ))}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.footPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/case-details' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.foot}>
          <LockKeyhole size={t.footIcon} color={c.greenInk} strokeWidth={2.2} />
          <Text style={styles.footText} {...shrinkToFit(0.8)}>
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

  topRow: { marginTop: t.stepTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: {
    height: t.stepH,
    borderRadius: t.stepRadius,
    paddingHorizontal: t.stepPadX,
    backgroundColor: c.peachPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stepDotGap,
  },
  stepDot: { width: t.stepDot, height: t.stepDot, borderRadius: t.stepDot / 2, backgroundColor: c.brown },
  stepText: { fontFamily: font.appSemi, fontSize: t.stepSize, letterSpacing: t.stepSpacing, color: c.brownInk },
  verified: { flexDirection: 'row', alignItems: 'center', gap: t.verifiedGap },
  verifiedText: { fontFamily: font.appSemi, fontSize: t.verifiedSize, color: c.inkWarm },

  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, color: c.ink },
  body: {
    marginTop: t.bodyTop,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: c.inkWarm,
  },

  secRow: { marginTop: t.secTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secTitle: { fontFamily: font.appSemi, fontSize: t.secSize, color: c.ink },
  secMeta: { fontFamily: font.appBody, fontSize: t.secMetaSize, color: c.inkWarm },

  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.gridGap },
  card: {
    flexBasis: t.basis,
    flexGrow: 1,
    height: t.cardH,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    padding: t.cardPad,
    justifyContent: 'flex-end',
  },
  cardOn: { backgroundColor: c.peachSoft },
  cardTop: {
    position: 'absolute',
    top: t.cardPad,
    left: t.cardPad,
    right: t.cardPad,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileOn: { backgroundColor: c.brown },
  mark: {
    width: t.mark,
    height: t.mark,
    borderRadius: t.mark / 2,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOn: { backgroundColor: status.active },
  title: { fontFamily: font.appSemi, fontSize: t.titleSize, color: c.ink },
  desc: {
    marginTop: t.descTop,
    fontFamily: font.appBody,
    fontSize: t.descSize,
    lineHeight: t.descLineHeight,
    color: c.inkWarm,
  },

  note: {
    marginTop: t.noteTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    padding: t.notePad,
    paddingTop: t.notePadTop,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteIcon: {
    width: t.noteIcon,
    height: t.noteIcon,
    borderRadius: t.noteIcon / 2,
    marginRight: t.noteIconGap,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCol: { flex: 1 },
  noteTitle: { fontFamily: font.appSemi, fontSize: t.noteTitleSize, color: c.ink },
  noteBody: {
    marginTop: t.noteBodyTop,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLineHeight,
    color: c.inkWarm,
  },
  noteStrong: { color: c.ink },

  bar: { backgroundColor: c.card, paddingHorizontal: t.padX, paddingTop: t.barPadTop },
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
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { fontFamily: font.appSemi, fontSize: t.footSize, color: c.inkWarm },
});

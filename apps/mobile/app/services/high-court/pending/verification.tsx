import { router, type Href } from 'expo-router';
import { ArrowRight, BellRing, Check, FileText, Hash, Landmark, Lightbulb } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import { font, hcPalette as c, hcVerification as t, ink, shadow, status } from '../../../../constants/theme';
import { HC_VERIFICATION } from '../../../../data/highCourt';

// High Court pending case — case sent for verification (design/334; design/337
// matches it within re-encoding noise and is not a second route). Measured at
// 2.000 px/pt. Reached from the pending-case payment success (design/333).
//
// Conflicts 5 and 9 are commented on HC_VERIFICATION.
//
// STATIC, NOT WIRED: the verification status is a drawing; no SMS or app
// notification is sent. Go to Home returns Home — the pending-case branch ends
// here; no screen after verification is drawn.

export default function HighCourtPendingVerificationScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_VERIFICATION;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/(tabs)/home' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.halo}>
          <View style={styles.core}>
            <Check size={t.coreGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
        </View>
        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>
        <View style={styles.pill}>
          <Hash size={t.pillIcon} color={c.inkWarm} strokeWidth={2.2} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            {d.ref}
          </Text>
        </View>

        <View style={[styles.card, styles.info]}>
          <View style={styles.between}>
            <View style={styles.head}>
              <View style={styles.tile}>
                <Landmark size={t.tileGlyph} color={c.brown} strokeWidth={1.9} />
              </View>
              <Text style={styles.headText}>{d.infoTitle}</Text>
            </View>
            <View style={styles.tag}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>{d.submitted}</Text>
            </View>
          </View>
          <View style={styles.rows}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.typeLabel}</Text>
              <Text style={styles.rowValue}>{d.type}</Text>
            </View>
            <View style={[styles.row, styles.court]}>
              <Text style={styles.rowLabel}>{d.courtLabel}</Text>
              <Text style={[styles.rowValue, styles.courtValue]}>{d.court}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.numberLabel}</Text>
              <Text style={[styles.rowValue, styles.brownValue]} {...shrinkToFit(0.75)}>
                {d.number}
              </Text>
            </View>
          </View>
          <View style={styles.file}>
            <View style={styles.fileTile}>
              <FileText size={t.fileGlyph} color={c.ink} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.fileName}>{d.file}</Text>
              <Text style={styles.fileMeta}>{d.fileMeta}</Text>
            </View>
            <View style={styles.up}>
              <Check size={t.upIcon} color={c.greenInk} strokeWidth={2.6} />
              <Text style={styles.upText}>{d.uploaded}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.stat]}>
          <View style={styles.between}>
            <Text style={styles.statTitle}>{d.statTitle}</Text>
            <View style={[styles.tag, styles.tagPeach]}>
              <View style={[styles.tagDot, styles.tagDotBrown]} />
              <Text style={[styles.tagText, styles.tagTextBrown]}>{d.review}</Text>
            </View>
          </View>
          <Text style={styles.statSub}>{d.statSub}</Text>
          <View style={styles.steps}>
            {d.steps.map((s, i) => {
              const last = i === d.steps.length - 1;
              const nextState = !last ? d.steps[i + 1].state : undefined;
              return (
                <View key={s.title} style={styles.step}>
                  <View style={styles.railCol}>
                    {s.state === 'done' && (
                      <View style={[styles.disc, styles.discDone]}>
                        <Check size={t.discGlyph} color={ink.onBrand} strokeWidth={3} />
                      </View>
                    )}
                    {s.state === 'current' && (
                      <View style={styles.ring}>
                        <View style={[styles.disc, styles.discCurrent]}>
                          <View style={styles.ringDot} />
                        </View>
                      </View>
                    )}
                    {s.state === 'waiting' && (
                      <View style={[styles.disc, styles.discWait]}>
                        <View style={styles.waitDot} />
                      </View>
                    )}
                    {!last && (
                      <View
                        style={[
                          styles.rail,
                          nextState === 'done' && styles.railDone,
                          nextState === 'current' && styles.railCurrent,
                        ]}
                      />
                    )}
                  </View>
                  <View style={[styles.flex, !last && styles.stepSpaced]}>
                    <Text style={[styles.stepTitle, s.state === 'waiting' && styles.waitTitle]}>{s.title}</Text>
                    <Text style={[styles.stepDesc, s.state === 'waiting' && styles.waitDesc]}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.next}>
          <View style={styles.nextDisc}>
            <Lightbulb size={t.nextGlyph} color={c.ink} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.nextTitle}>{d.nextTitle}</Text>
            <Text style={styles.nextBody}>{d.next}</Text>
            <View style={styles.notify}>
              <BellRing size={t.notifyIcon} color={c.inkWarm} strokeWidth={1.9} />
              <Text style={styles.notifyText}>{d.notify}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home' as Href)} style={styles.cta}>
          <Text style={styles.ctaText}>{d.cta}</Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.tileGap },
  head: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.tileGap },

  halo: {
    marginTop: t.haloTop,
    alignSelf: 'center',
    width: t.halo,
    height: t.halo,
    borderRadius: t.halo / 2,
    backgroundColor: c.greenHalo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: { width: t.core, height: t.core, borderRadius: t.core / 2, backgroundColor: status.active, alignItems: 'center', justifyContent: 'center' },
  h1: { marginTop: t.h1Top, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  sub: { marginTop: t.subTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.inkWarm },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'center',
    maxWidth: '100%',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, color: c.inkWarm },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  info: { marginTop: t.infoTop, paddingTop: t.infoPadTop, paddingBottom: t.infoPadBottom },
  tile: { width: t.tile, height: t.tile, borderRadius: t.tileRadius, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  headText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.headSize, lineHeight: t.headLineHeight, color: c.ink },
  tag: {
    height: t.tagH,
    borderRadius: t.tagH / 2,
    paddingHorizontal: t.tagPadX,
    backgroundColor: c.greenBanner,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap - 1,
  },
  tagPeach: { backgroundColor: c.peach },
  tagDot: { width: t.tagDot, height: t.tagDot, borderRadius: t.tagDot / 2, backgroundColor: c.greenInk },
  tagDotBrown: { backgroundColor: c.brown },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.greenInk },
  tagTextBrown: { color: c.brownInk },
  rows: { marginTop: t.rowsTop, gap: t.rowGap },
  row: {
    minHeight: t.rowH,
    borderRadius: t.rowRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.rowPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.tileGap,
  },
  court: { flexDirection: 'column', alignItems: 'stretch', paddingVertical: t.courtPadY },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.inkWarm },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.rowValueSize, lineHeight: t.rowValueLineHeight, color: c.ink },
  courtValue: { marginTop: t.courtValueTop, textAlign: 'left' },
  brownValue: { fontFamily: font.appHeading, color: c.brownLift },
  file: {
    marginTop: t.fileTop,
    borderRadius: t.fileRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.filePadX,
    paddingVertical: t.filePadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.fileGap,
  },
  fileTile: { width: t.fileTile, height: t.fileTile, borderRadius: t.fileTileRadius, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  fileName: { fontFamily: font.appSemi, fontSize: t.fileNameSize, lineHeight: t.fileNameLineHeight, color: c.ink },
  fileMeta: { fontFamily: font.appBody, fontSize: t.fileMetaSize, lineHeight: t.fileMetaLineHeight, color: c.inkWarm },
  up: {
    height: t.upH,
    borderRadius: t.upH / 2,
    paddingHorizontal: t.upPadX,
    backgroundColor: c.greenTile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.upGap,
  },
  upText: { fontFamily: font.appSemi, fontSize: t.upSize, color: c.greenInk },

  stat: { paddingTop: t.statPadTop, paddingBottom: t.statPadBottom },
  statTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.statTitleSize, lineHeight: t.statTitleLineHeight, color: c.ink },
  statSub: { fontFamily: font.appBody, fontSize: t.statSubSize, lineHeight: t.statSubLineHeight, color: c.inkWarm },
  steps: { marginTop: t.stepsTop },
  step: { flexDirection: 'row', gap: t.stepGap },
  stepSpaced: { paddingBottom: t.stepPitch },
  railCol: { width: t.ring, alignItems: 'center' },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center' },
  discDone: { backgroundColor: status.active },
  ring: {
    marginVertical: (t.disc - t.ring) / 2,
    width: t.ring,
    height: t.ring,
    borderRadius: t.ring / 2,
    backgroundColor: c.peachSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discCurrent: { backgroundColor: c.peach },
  ringDot: { width: t.ringDot, height: t.ringDot, borderRadius: t.ringDot / 2, backgroundColor: c.brown },
  discWait: { backgroundColor: c.tileGrey },
  waitDot: { width: t.waitDot, height: t.waitDot, borderRadius: t.waitDot / 2, backgroundColor: c.tagMuted },
  rail: { flex: 1, width: t.rail, backgroundColor: c.helpGrey },
  railDone: { backgroundColor: status.active },
  railCurrent: { backgroundColor: c.avatarTan },
  stepTitle: { fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  waitTitle: { color: c.inkMuted },
  stepDesc: { fontFamily: font.appBody, fontSize: t.stepDescSize, lineHeight: t.stepDescLineHeight, color: c.inkWarm },
  waitDesc: { color: c.tagMuted },

  next: {
    marginTop: t.cardGap,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.nextPadTop,
    paddingBottom: t.nextPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.nextGap,
  },
  nextDisc: { width: t.nextDisc, height: t.nextDisc, borderRadius: t.nextDisc / 2, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  nextTitle: { fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBody: { marginTop: t.nextBodyTop, fontFamily: font.appBody, fontSize: t.nextBodySize, lineHeight: t.nextBodyLineHeight, color: c.inkWarm },
  notify: { marginTop: t.notifyTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.notifyGap },
  notifyText: { flex: 1, fontFamily: font.appSemi, fontSize: t.notifySize, lineHeight: t.notifyLineHeight, color: c.inkWarm },

  bar: { backgroundColor: c.page, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
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
  ctaText: { fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
});

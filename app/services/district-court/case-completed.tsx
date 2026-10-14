import { router, type Href } from 'expo-router';
import { ArrowRight, Check, ChevronRight, CircleCheck, Copy, FolderOpen, MessageSquare, RotateCcw } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcCompleted as t, font, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { DC_COMPLETED } from '../../../data/districtCourt';

// District Court — case completed (design/335). Measured at 2.000 px/pt.
//
// Conflict 5 and the "Closed"-while-a-hearing-was-pending note are commented on
// DC_COMPLETED.
//
// Wiring: View Case opens design/327 (Case Overview); Case Documents opens the
// client's documents list; Case History opens Case Overview too (no history
// screen is drawn — flagged); Need Help opens support chat; Back to Home returns
// Home. STATIC: Copy copies nothing.

export default function DistrictCourtCaseCompletedScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_COMPLETED;
  const toOverview = () => router.push('/services/district-court/case-overview' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        subStyle={styles.hdrSub}
        backHref={'/(tabs)/home' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroDisc}>
            <Check size={t.heroGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.heroTitle}>{d.heroTitle}</Text>
            <Text style={styles.heroBody}>{d.heroBody}</Text>
            <Text style={styles.heroSub}>{d.heroSub}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.ms]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.msLabel}</Text>
            <View style={styles.all}>
              <View style={styles.allDot} />
              <Text style={styles.allText}>{d.msAll}</Text>
            </View>
          </View>
          <View style={styles.bar} />
          <View style={styles.chips}>
            {d.milestones.map((m, i) => (
              <Fragment key={m}>
                {i > 0 && <ChevronRight size={t.sep} color={c.tagMuted} strokeWidth={2} />}
                <View style={styles.chip}>
                  <CircleCheck size={t.chipIcon} color={c.card} fill={c.greenInk} strokeWidth={2.4} />
                  <Text style={[styles.chipText, i === d.milestones.length - 1 && styles.chipTextLast]} {...shrinkToFit(0.7)}>
                    {m}
                  </Text>
                </View>
              </Fragment>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.caseCard]}>
          <View style={styles.tags}>
            {d.tags.map((tg) => (
              <View key={tg} style={styles.tag}>
                <Text style={styles.tagText}>{tg}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.parties} {...shrinkToFit(0.8)}>
            {d.parties}
          </Text>
          <View style={styles.num}>
            <Text style={styles.numText} {...shrinkToFit(0.75)}>
              {d.numLabel}
              {d.num}
            </Text>
            {/* Inert — nothing is copied. */}
            <View style={styles.copy}>
              <Copy size={t.copyIcon} color={c.inkWarm} strokeWidth={1.9} />
              <Text style={styles.copyText}>{d.copy}</Text>
            </View>
          </View>
          <View style={styles.adv}>
            <View style={styles.advPhoto}>
              <Text style={styles.advInitials}>{d.initials}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.advName}>{d.adv}</Text>
              <Text style={styles.advSub}>{d.advSub}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.stat]}>
          <View style={styles.between}>
            <Text style={styles.statLabel}>{d.statLabel}</Text>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{d.statPill}</Text>
            </View>
          </View>
          <Text style={styles.updLabel}>{d.updLabel}</Text>
          <Text style={styles.upd}>{d.upd}</Text>
          <Text style={styles.updDate}>{d.updDate}</Text>
        </View>

        <View style={[styles.card, styles.links]}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/documents' as Href)} style={styles.row}>
            <View style={styles.rowDisc}>
              <FolderOpen size={t.rowGlyph} color={c.inkWarm} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{d.docsTitle}</Text>
              <Text style={styles.rowSub}>{d.docsSub}</Text>
            </View>
            <View style={styles.rowLink}>
              <Text style={styles.rowLinkText}>{d.docsLink}</Text>
              <ChevronRight size={t.rowLinkIcon} color={c.inkWarm} strokeWidth={2} />
            </View>
          </Pressable>
          <View style={styles.divider} />
          <Pressable accessibilityRole="button" onPress={toOverview} style={styles.row}>
            <View style={styles.rowDisc}>
              <RotateCcw size={t.rowGlyph} color={c.inkWarm} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{d.histTitle}</Text>
              <Text style={styles.rowSub}>{d.histSub}</Text>
            </View>
            <ArrowRight size={t.rowArrow} color={c.ink} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={[styles.card, styles.sum]}>
          <Text style={styles.caps}>{d.sumLabel}</Text>
          <View style={[styles.between, styles.sumRow]}>
            <Text style={styles.sumLabel}>{d.plan[0]}</Text>
            <Text style={styles.sumValue} {...shrinkToFit(0.75)}>
              {d.plan[1]}
            </Text>
          </View>
          <View style={[styles.between, styles.sumRow]}>
            <Text style={styles.sumLabel}>{d.tier[0]}</Text>
            <Text style={styles.sumValue2} {...shrinkToFit(0.75)}>
              {d.tier[1]}
            </Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/support-chat' as Href)} style={styles.help}>
          <MessageSquare size={t.helpIcon} color={c.ink} strokeWidth={1.9} />
          <Text style={styles.helpText}>{d.help}</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.barWrap, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={toOverview} style={styles.cta}>
          <Text style={styles.ctaText}>{d.cta}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home' as Href)}>
          <Text style={styles.home}>{d.home}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.sumGap },
  hdrSub: { fontSize: t.hdrSubSize },
  caps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.ink },

  hero: {
    marginTop: t.heroTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.heroPadTop,
    paddingBottom: t.heroPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.heroGap,
  },
  heroDisc: { width: t.heroDisc, height: t.heroDisc, borderRadius: t.heroDisc / 2, backgroundColor: status.active, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: font.appSemi, fontSize: t.heroTitleSize, lineHeight: t.heroTitleLineHeight, color: c.ink },
  heroBody: { marginTop: t.heroBodyTop, fontFamily: font.appBody, fontSize: t.heroBodySize, lineHeight: t.heroBodyLineHeight, color: c.ink },
  heroSub: { marginTop: t.heroSubTop, fontFamily: font.appBody, fontSize: t.heroSubSize, lineHeight: t.heroSubLineHeight, color: c.inkWarm },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  ms: { paddingTop: t.msPadTop, paddingBottom: t.msPadBottom },
  all: { flexDirection: 'row', alignItems: 'center', gap: t.chipGap + 1 },
  allDot: { width: t.allDot, height: t.allDot, borderRadius: t.allDot / 2, backgroundColor: status.active },
  allText: { fontFamily: font.appSemi, fontSize: t.allSize, color: c.greenInk },
  bar: { marginTop: t.barTop, height: t.barH, borderRadius: t.barH / 2, backgroundColor: status.active },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.chipGap },
  chipText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.chipSize, color: c.ink },
  chipTextLast: { color: c.greenInk },

  caseCard: { paddingTop: t.casePadTop, paddingBottom: t.casePadBottom },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: t.tagGap },
  tag: { height: t.tagsH, borderRadius: t.tagsH / 2, paddingHorizontal: t.tagPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.inkWarm },
  parties: { marginTop: t.partiesTop, fontFamily: font.appSemi, fontSize: t.partiesSize, lineHeight: t.partiesLineHeight, color: c.ink },
  num: {
    marginTop: t.numTop,
    minHeight: t.numH,
    borderRadius: t.numRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.numPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.sumGap,
  },
  numText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.numSize, color: c.ink },
  copy: { flexDirection: 'row', alignItems: 'center', gap: t.copyGap },
  copyText: { fontFamily: font.appBody, fontSize: t.copySize, color: c.inkWarm },
  adv: {
    marginTop: t.advTop,
    borderRadius: t.advRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.advPadX,
    paddingVertical: t.advPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.advGap,
  },
  advPhoto: { width: t.advPhoto, height: t.advPhoto, borderRadius: t.advPhoto / 2, backgroundColor: c.avatarTan, alignItems: 'center', justifyContent: 'center' },
  advInitials: { fontFamily: font.appSemi, fontSize: t.advInitials, color: ink.onBrand },
  advName: { fontFamily: font.appSemi, fontSize: t.advNameSize, lineHeight: t.advNameLineHeight, color: c.ink },
  advSub: { fontFamily: font.appBody, fontSize: t.advSubSize, lineHeight: t.advSubLineHeight, color: c.inkWarm },

  stat: { paddingTop: t.statPadTop, paddingBottom: t.statPadBottom },
  statLabel: { fontFamily: font.appBody, fontSize: t.statLabelSize, color: c.inkWarm },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.greenBanner,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: status.active },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.greenInk },
  updLabel: { marginTop: t.updTop, fontFamily: font.appBody, fontSize: t.updLabelSize, lineHeight: t.updLabelLineHeight, color: c.inkWarm },
  upd: { fontFamily: font.appBody, fontSize: t.updSize, lineHeight: t.updLineHeight, color: c.ink },
  updDate: { marginTop: t.updDateTop, fontFamily: font.appBody, fontSize: t.updDateSize, lineHeight: t.updDateLineHeight, color: c.inkWarm },

  links: { paddingHorizontal: 0 },
  row: { paddingHorizontal: t.cardPadX, paddingVertical: t.rowPadY, flexDirection: 'row', alignItems: 'center', gap: t.rowGap },
  rowDisc: { width: t.rowDisc, height: t.rowDisc, borderRadius: t.rowDisc / 2, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: font.appSemi, fontSize: t.rowTitleSize, lineHeight: t.rowTitleLineHeight, color: c.ink },
  rowSub: { fontFamily: font.appBody, fontSize: t.rowSubSize, lineHeight: t.rowSubLineHeight, color: c.inkWarm },
  rowLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rowLinkText: { fontFamily: font.appSemi, fontSize: t.rowLinkSize, color: c.inkWarm },
  divider: { height: 1, backgroundColor: c.panel },

  sum: { paddingTop: t.sumPadTop, paddingBottom: t.sumPadBottom },
  sumRow: { marginTop: t.sumRowTop },
  sumLabel: { fontFamily: font.appBody, fontSize: t.sumLabelSize, color: c.inkWarm },
  sumValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.sumValueSize, color: c.ink },
  sumValue2: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.sumValue2Size, color: c.ink },

  help: { marginTop: t.helpTop, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: t.helpGap },
  helpText: { fontFamily: font.appBody, fontSize: t.helpSize, color: c.ink },

  barWrap: { backgroundColor: c.card, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  cta: {
    ...shadow,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  home: { marginTop: t.homeTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.homeSize, lineHeight: t.homeLineHeight, color: c.ink },
});

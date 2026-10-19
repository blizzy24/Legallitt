import { router, type Href } from 'expo-router';
import { ArrowRight, Check, ChevronLeft, FileWarning, ShieldCheck, Upload } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifyIncompleteArt from '../../../components/VerifyIncompleteArt';
import { shrinkToFit } from '../../../constants/textFit';
import { AV_NEEDS_UPDATE } from '../../../data/advocateVerify';
import {
  advVerifyAmber as amber,
  advVerifyNeedsUpdate as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — needs update (design/243).
//
// ⚠ A SECOND AMBER SET. This screen is drawn in Tailwind's amber-50 / 200 /
// 500 / 700, while the project already carries an amber set in the shared theme
// (status.pending and friends, sampled from designs 14–21). They are close but
// not equal. Built as drawn and quarantined in constants/tokens/advVerify.ts as
// advVerifyAmber rather than reconciled with the shared one.
//
// The illustration reuses components/VerifyReviewArt with tone="amber" — it is
// design/240's scene with the two marks swapped for a warning.
//
// STATIC, NOT WIRED: "Replace Document" opens nothing, and nothing is
// resubmitted. There is still no upload anywhere in this project.

export default function AdvocateVerifyNeedsUpdateScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_NEEDS_UPDATE;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={styles.back}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#222222" strokeWidth={2.4} />
        </Pressable>
        <View style={styles.headCol}>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.title}
          </Text>
        </View>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroPanel}>
            <VerifyIncompleteArt width={t.artW} height={t.artH} mark="rosette" />
          </View>
        </View>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.pill}
            </Text>
          </View>
        </View>

        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.quote}>{d.quote}</Text>

        <View style={styles.issue}>
          <View style={styles.accent} />
          <View style={styles.issueBody}>
            <View style={styles.issueHead}>
              <View style={styles.issueTile}>
                <FileWarning size={t.issueTileGlyph} color={amber.accent} strokeWidth={1.8} />
              </View>
              <View style={styles.issueCol}>
                <Text style={styles.issueEyebrow} {...shrinkToFit(0.8)}>
                  {d.issue.eyebrow}
                </Text>
                <Text style={styles.issueTitle} {...shrinkToFit(0.8)}>
                  {d.issue.title}
                </Text>
              </View>
              <View style={styles.actionPill}>
                <Text style={styles.actionPillText} {...shrinkToFit(0.8)}>
                  {d.issue.pill}
                </Text>
              </View>
            </View>
            <Text style={styles.issueText}>{d.issue.body}</Text>
            <View style={styles.replace}>
              <Upload size={t.replaceGlyph} color="#4A4A4A" strokeWidth={1.8} />
              <Text style={styles.replaceText} {...shrinkToFit(0.8)}>
                {d.issue.action}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.other}>
          <View style={styles.otherHead}>
            <Text style={styles.otherTitle}>{d.other.title}</Text>
            <Check size={t.otherDotGlyph} color={status.active} strokeWidth={3} />
            <Text style={styles.otherMeta} {...shrinkToFit(0.8)}>
              {d.other.meta}
            </Text>
          </View>
          {d.other.rows.map((r, i) => (
            <Fragment key={r}>
              <View style={styles.otherRule} />
              <View style={[styles.otherRow, { marginTop: i === 0 ? 0 : 0 }]}>
                <View style={styles.otherDot}>
                  <Check size={t.otherDotGlyph} color={status.active} strokeWidth={3} />
                </View>
                <Text style={styles.otherName} {...shrinkToFit(0.8)}>
                  {r}
                </Text>
                <Text style={styles.otherStatus}>{d.other.status}</Text>
              </View>
            </Fragment>
          ))}
        </View>

        <View style={styles.note}>
          <ShieldCheck size={t.noteGlyph} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/verify/documents' as Href)}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={s.ctaArrow} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/advocate/notifications' as Href)}>
          <Text style={styles.support}>{d.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: s.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: s.rule,
  },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { width: t.backBtn, height: t.backBtn },
  headCol: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#222222',
  },

  content: { paddingBottom: 24 },

  hero: {
    marginTop: t.heroTop,
    marginHorizontal: t.padX,
    height: t.heroH,
    borderRadius: t.heroRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    padding: t.heroInset,
  },
  heroPanel: {
    flex: 1,
    borderRadius: t.heroPanelRadius,
    backgroundColor: t.heroPanelBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  pillRow: { marginTop: t.pillTop, alignItems: 'center' },
  pill: {
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: amber.surface,
    borderWidth: 1,
    borderColor: amber.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    backgroundColor: amber.accent,
    marginRight: 8,
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: amber.ink },

  h1: {
    marginTop: t.h1Top,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.h1Size,
    color: '#222222',
  },
  quote: {
    marginTop: t.quoteTop,
    marginHorizontal: t.padX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.quoteSize,
    lineHeight: t.quoteLine,
    color: colors.textBody,
  },

  issue: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: amber.border,
    overflow: 'hidden',
  },
  accent: { width: t.accentW, backgroundColor: amber.accent },
  issueBody: { flex: 1, paddingHorizontal: t.cardPadX, paddingVertical: t.cardPadY },
  issueHead: { flexDirection: 'row', alignItems: 'flex-start' },
  issueTile: {
    width: t.issueTile,
    height: t.issueTile,
    borderRadius: t.issueTileRadius,
    backgroundColor: amber.surface,
    borderWidth: 1,
    borderColor: amber.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.issueTileGap,
  },
  issueCol: { flex: 1 },
  issueEyebrow: {
    fontFamily: font.appHeading,
    fontSize: t.issueEyebrowSize,
    letterSpacing: t.issueEyebrowTrack,
    color: '#C2410C',
  },
  issueTitle: {
    marginTop: t.issueTitleTop,
    fontFamily: font.appHeading,
    fontSize: t.issueTitleSize,
    color: '#222222',
  },
  actionPill: {
    marginLeft: 8,
    height: t.actionPillH,
    borderRadius: t.actionPillRadius,
    paddingHorizontal: t.actionPillPadX,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: { fontFamily: font.appSemi, fontSize: t.actionPillSize, color: amber.ink },
  issueText: {
    marginTop: t.issueBodyTop,
    fontFamily: font.appBody,
    fontSize: t.issueBodySize,
    lineHeight: t.issueBodyLine,
    color: colors.textBody,
  },
  replace: {
    marginTop: t.replaceTop,
    height: t.replaceH,
    borderRadius: t.replaceRadius,
    backgroundColor: t.replaceBg,
    borderWidth: 1,
    borderColor: s.backBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceText: {
    marginLeft: 9,
    fontFamily: font.appHeading,
    fontSize: t.replaceSize,
    color: '#222222',
  },

  other: {
    marginTop: t.otherTop,
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  otherHead: { flexDirection: 'row', alignItems: 'center' },
  otherTitle: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.otherHeadSize,
    letterSpacing: t.otherHeadTrack,
    color: ink.accent,
  },
  otherMeta: {
    marginLeft: 5,
    fontFamily: font.appSemi,
    fontSize: t.otherMetaSize,
    color: status.active,
  },
  otherRule: { marginTop: t.otherRule, height: 1, backgroundColor: s.rule },
  otherRow: { marginTop: t.otherRowTop, flexDirection: 'row', alignItems: 'center' },
  otherDot: {
    width: t.otherDot,
    height: t.otherDot,
    borderRadius: t.otherDot / 2,
    backgroundColor: t.otherDotBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.otherGapX,
  },
  otherName: { flex: 1, fontFamily: font.appBody, fontSize: t.otherNameSize, color: '#222222' },
  otherStatus: { fontFamily: font.appSemi, fontSize: t.otherStatusSize, color: status.active },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: colors.textBody,
  },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.padX,
    borderTopWidth: 1,
    borderTopColor: s.rule,
    backgroundColor: s.bg,
  },
  cta: {
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: ink.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    fontFamily: font.appHeading,
    fontSize: t.ctaLabelSize,
    color: ink.onBrand,
    marginRight: 10,
  },
  support: {
    marginTop: t.supportTop,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.supportSize,
    color: ink.accent,
  },
});

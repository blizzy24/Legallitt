import DemoPressable from '../../../components/DemoPressable';
import { router, type Href } from 'expo-router';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NoticeDraftSections from '../../../components/NoticeDraftSections';
import { shrinkToFit } from '../../../constants/textFit';
import { ADV_NOTICE_DRAFT } from '../../../data/advocateSide';
import { AT_DRAFT_EDITOR } from '../../../data/advocateTools';
import {
  advDraftEditor as t,
  advNoticeDraft as n,
  colors,
  font,
  ink,
} from '../../../constants/theme';

// Advocate — legal notice draft editor (design/266).
//
// ⚠ WHY THIS IS A SECOND ROUTE. design/188's draft screen is already built at
// app/advocate/notice/[id]/draft.tsx. A pixel diff of 266 against 188 found the
// six section cards identical — same copy, same card geometry — and three real
// differences:
//   · 188's AI pill is the purple "Legalitt AI" flower mark; 266's is a warm
//     "AI Assist" pill with a sparkle
//   · 188 ends with a full Legalitt AI panel ("What would you like to change?",
//     prompt box, Make more Formal / Fix Grammer chips) and a Generate Draft
//     button. 266 HAS NO AI PANEL AT ALL.
//   · 266 ends with Save Draft / Preview / Continue to Review, which 188 does
//     not draw
// 266 is 1177pt tall against 188's 1490pt. Two screens, not one.
//
// REUSE: the six section cards are components/NoticeDraftSections, extracted
// from design/188's screen so both routes render one copy. That extraction was
// verified pixel-identical on the existing route.
//
// ⚠ TENTH AI SURFACE IN THIS APP. "AI Assist" is drawn and does nothing — no
// model, no request, no generated text. Every section below is a fixed string.
//
// STATIC, NOT WIRED: the edit pencils open no editor, Save Draft saves nothing,
// Preview previews nothing, and Continue to Review only navigates.

export default function AdvocateNoticeDraftEditorScreen() {
  const insets = useSafeAreaInsets();
  const d = ADV_NOTICE_DRAFT;
  const e = AT_DRAFT_EDITOR;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + n.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.backBtn}
        >
          <ArrowLeft size={n.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} {...shrinkToFit(0.75)}>
            {d.title}
          </Text>
          <Text style={styles.step} {...shrinkToFit(0.7)}>
            {d.step}
          </Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText} {...shrinkToFit(0.8)}>
            {d.statusChip}
          </Text>
        </View>
      </View>

      <View style={styles.party}>
        <Text style={styles.partyText} {...shrinkToFit(0.7)}>
          {d.parties.client} <Text style={styles.partyVs}>vs</Text> {d.parties.opponent}
        </Text>
        {/* Inert — tenth AI surface, nothing behind it. */}
        <View style={styles.pill}>
          <Sparkles size={t.pillGlyph} color={ink.accent} strokeWidth={2} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            {d.assistChip}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NoticeDraftSections />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.btnRow}>
          <DemoPressable accessibilityRole="button" style={styles.btn}>
            <Text style={styles.btnText} {...shrinkToFit(0.8)}>
              {e.saveDraft}
            </Text>
          </DemoPressable>
          <DemoPressable accessibilityRole="button" style={[styles.btn, { marginLeft: t.btnGap }]}>
            <Text style={styles.btnText} {...shrinkToFit(0.8)}>
              {e.preview}
            </Text>
          </DemoPressable>
        </View>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/notice/ln-2026-1048/review' as Href)}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {e.cta}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: n.padX,
    paddingBottom: n.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.rule,
  },
  backBtn: {
    width: n.backBtn,
    height: n.backBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginLeft: n.backGap },
  title: { fontFamily: font.appHeading, fontSize: n.titleSize, color: colors.textPrimary },
  step: { marginTop: n.stepGap, fontFamily: font.appBody, fontSize: n.stepSize, color: colors.textBody },
  status: {
    height: n.statusHeight,
    borderRadius: n.statusRadius,
    paddingHorizontal: n.statusPadX,
    backgroundColor: n.statusBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { fontFamily: font.appSemi, fontSize: n.statusSize, color: n.statusColour },

  party: {
    height: t.partyH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.partyPadX,
    backgroundColor: t.partyBg,
    borderBottomWidth: 1,
    borderBottomColor: t.rule,
  },
  partyText: { flex: 1, fontFamily: font.appHeading, fontSize: t.partySize, color: colors.textPrimary },
  partyVs: { fontFamily: font.appBody, color: colors.textBody },
  pill: {
    width: t.pillW,
    height: t.pillH,
    borderRadius: t.pillRadius,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    marginLeft: t.pillGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    color: ink.accent,
  },

  content: { paddingHorizontal: n.padX, paddingTop: n.cardGap, paddingBottom: 24 },

  footer: {
    paddingHorizontal: t.footerPadX,
    paddingTop: t.footerPadTop,
    backgroundColor: t.footerBg,
    borderTopWidth: 1,
    borderTopColor: t.rule,
  },
  btnRow: { flexDirection: 'row' },
  btn: {
    flex: 1,
    height: t.btnH,
    borderRadius: t.btnRadius,
    borderWidth: 1,
    borderColor: t.rule,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: colors.textPrimary },
  cta: {
    marginTop: t.ctaTop,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaText: { fontFamily: font.appHeading, fontSize: t.ctaSize, color: ink.onBrand },
});

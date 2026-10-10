import { router, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, PenLine, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifyIncompleteArt from '../../../components/VerifyIncompleteArt';
import { shrinkToFit } from '../../../constants/textFit';
import { AV_INCOMPLETE } from '../../../data/advocateVerify';
import {
  advVerifyIncomplete as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
} from '../../../constants/theme';

// Advocate verification — incomplete (design/241).
//
// ⚠ FOREIGN CHROME NOT BUILT, same call as design/236. This export draws a
// "Requests" app header above the screen and a FIVE-tab bottom bar below it
// (Dashboard, Requests, Schedule, Messages, Profile). This is a pushed wizard
// screen: it has no app header and no tab bar, and three of those five tabs do
// not exist anywhere in this app. Reported rather than reproduced.
//
// ⚠ design/242 was a byte-different re-encode of this exact screen: 56
// differing pixels out of 2,106,432 (0.0027%), all on anti-aliased text edges,
// max channel delta 23/255. One route, not two. 242 is archived.
//
// ⚠ "Step 3 of 4" — the THIRD screen in this batch to claim it (design/236 and
// design/238 are the others), on a screen that is not a wizard step at all.
//
// ⚠ "2 actions pending" is drawn against four rows, two of them complete.
//
// ⚠ The primary button here is #6C5C45, much darker than the #B09C82 every
// other screen in this flow uses. Built as drawn; kept local, not promoted.
//
// ⚠ NEVER ELLIPSIZE. The export clips two item subtitles mid-word ("or V(" and
// "& pr"). Both are stored and rendered whole.
//
// STATIC, NOT WIRED: no upload, no progress, no draft being saved anywhere.

export default function AdvocateVerifyIncompleteScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_INCOMPLETE;

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
          <ArrowLeft size={t.backIcon} color="#4D463D" strokeWidth={2.2} />
        </Pressable>
        <View style={styles.headCol}>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.title}
          </Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            {d.step}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroPanel}>
            <VerifyIncompleteArt width={390 - t.padX * 2 - t.heroInset * 2} height={t.heroH - t.heroInset * 2} />
          </View>
        </View>

        <View style={styles.badge}>
          <PenLine size={t.badgeGlyph} color={ink.accent} strokeWidth={1.8} />
        </View>

        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.card}>
          <View style={styles.progRow}>
            <Text style={styles.progLabel} {...shrinkToFit(0.8)}>
              {d.progressLabel}
            </Text>
            <Text style={styles.progValue} {...shrinkToFit(0.8)}>
              {d.progressValue}
            </Text>
          </View>
          <View style={styles.progBar}>
            <View style={[styles.progFill, { width: `${d.progress * 100}%` }]} />
          </View>
          <View style={styles.progCaptionRow}>
            <Text style={styles.progCaption} {...shrinkToFit(0.8)}>
              {d.progressCaption}
            </Text>
            <Text style={[styles.progCaption, styles.progLeft]} {...shrinkToFit(0.8)}>
              {d.progressLeft}
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>{d.section}</Text>
          <Text style={styles.sectionMeta} {...shrinkToFit(0.8)}>
            {d.sectionMeta}
          </Text>
        </View>

        {d.items.map((it, i) => (
          <View key={it.title} style={[styles.item, { marginTop: i === 0 ? t.itemTop : t.itemGap }]}>
            <View style={[styles.itemDot, it.state === 'done' && styles.itemDotDone]}>
              {it.state === 'done' ? (
                <Check size={t.itemDotGlyph} color={ink.onBrand} strokeWidth={3} />
              ) : null}
            </View>
            <View style={styles.itemCol}>
              <Text style={styles.itemTitle} {...shrinkToFit(0.8)}>
                {it.title}
              </Text>
              <Text style={styles.itemSub} {...shrinkToFit(0.8)}>
                {it.sub}
              </Text>
            </View>
            {it.state === 'todo' ? (
              <View style={styles.itemBtn}>
                <Text style={styles.itemBtnText} {...shrinkToFit(0.8)}>
                  {it.action}
                </Text>
                <ArrowRight size={14} color="#6C5C45" strokeWidth={2.2} />
              </View>
            ) : (
              <View style={styles.itemPill}>
                <Text style={styles.itemPillText} {...shrinkToFit(0.8)}>
                  {it.action}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.draft}>
          <View style={styles.draftTile}>
            <ShieldCheck size={t.draftGlyph} color="#4D463D" strokeWidth={1.8} />
          </View>
          <View style={styles.itemCol}>
            <Text style={styles.draftTitle} {...shrinkToFit(0.8)}>
              {d.draft.title}
            </Text>
            <Text style={styles.draftBody}>{d.draft.body}</Text>
          </View>
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
          <ArrowRight size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <Text style={styles.secondary}>{d.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: s.bg },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.padX },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headCol: { flex: 1, marginLeft: t.headGap },
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
    color: '#1B1C1C',
  },
  pill: {
    width: t.pillW,
    height: t.pillH,
    borderRadius: t.pillRadius,
    backgroundColor: t.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: '#6C5C45' },

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
    overflow: 'hidden',
  },
  badge: {
    marginTop: t.badgeTop,
    alignSelf: 'center',
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    marginTop: t.h1Top,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.h1Size,
    color: '#1B1C1C',
  },
  sub: {
    marginTop: t.subTop,
    marginHorizontal: t.padX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLine,
    color: colors.textBody,
  },

  card: {
    marginTop: t.progressTop,
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  progRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progLabel: { fontFamily: font.appBody, fontSize: t.progLabelSize, color: '#1B1C1C' },
  progValue: { fontFamily: font.appHeading, fontSize: t.progValueSize, color: '#6C5C45' },
  progBar: {
    marginTop: t.progBarTop,
    height: t.progBarH,
    borderRadius: t.progBarH / 2,
    backgroundColor: t.progBarBg,
    overflow: 'hidden',
  },
  progFill: { height: '100%', borderRadius: t.progBarH / 2, backgroundColor: colors.brand },
  progCaptionRow: {
    marginTop: t.progCaptionTop,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progCaption: { fontFamily: font.appBody, fontSize: t.progCaptionSize, color: colors.textBody },
  progLeft: { fontFamily: font.appSemi, color: '#6C5C45' },

  sectionRow: {
    marginTop: t.sectionTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: '#6C5C45',
  },
  sectionMeta: { fontFamily: font.appBody, fontSize: t.sectionMetaSize, color: colors.textBody },

  item: {
    marginHorizontal: t.padX,
    minHeight: t.itemH,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDot: {
    width: t.itemDot,
    height: t.itemDot,
    borderRadius: t.itemDot / 2,
    borderWidth: 2,
    borderColor: '#E0CDB4',
    backgroundColor: '#FBF4EC',
    marginRight: t.itemGapX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDotDone: { borderWidth: 0, backgroundColor: '#4D463D' },
  itemCol: { flex: 1 },
  itemTitle: { fontFamily: font.appHeading, fontSize: t.itemTitleSize, color: '#1B1C1C' },
  itemSub: {
    marginTop: t.itemSubTop,
    fontFamily: font.appBody,
    fontSize: t.itemSubSize,
    color: colors.textBody,
  },
  itemBtn: {
    marginLeft: 10,
    width: t.itemBtnW,
    height: t.itemBtnH,
    borderRadius: t.itemBtnRadius,
    backgroundColor: t.itemBtnBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBtnText: {
    marginRight: 5,
    fontFamily: font.appSemi,
    fontSize: t.itemBtnSize,
    color: '#6C5C45',
  },
  itemPill: {
    marginLeft: 10,
    height: t.itemPillH,
    borderRadius: t.itemPillRadius,
    paddingHorizontal: t.itemPillPadX,
    backgroundColor: t.itemPillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPillText: { fontFamily: font.appSemi, fontSize: t.itemPillSize, color: '#6C5C45' },

  draft: {
    marginTop: t.draftTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.draftBg,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  draftTile: {
    width: t.draftTile,
    height: t.draftTile,
    borderRadius: t.draftTileRadius,
    backgroundColor: t.draftTileBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.draftGapX,
  },
  draftTitle: { fontFamily: font.appHeading, fontSize: t.draftTitleSize, color: '#1B1C1C' },
  draftBody: {
    marginTop: t.draftBodyTop,
    fontFamily: font.appBody,
    fontSize: t.draftBodySize,
    lineHeight: t.draftBodyLine,
    color: colors.textBody,
  },

  footer: { paddingTop: t.footerPadTop, paddingHorizontal: t.padX, backgroundColor: s.bg },
  cta: {
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
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
  secondary: {
    marginTop: t.secondaryTop,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.secondarySize,
    color: '#4D463D',
  },
});

import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  FileSignature,
  PencilLine,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiMark } from '../../../../components/AiFlowerMark';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_DRAFTING } from '../../../../data/advocateSide';
import {
  advNoticeDrafting as t,
  legalittAi as ai,
  colors,
  font,
  ink,
} from '../../../../constants/theme';

// Choose drafting method (design/187).
//
// ⚠ SEVENTH AI SURFACE, second of three in this flow. "AI Generate Draft" promises a
// draft "synthesized automatically from client records, uploaded annexures, and
// statutory citations" in ~8 seconds. NOTHING IS SYNTHESISED — it leads to
// design/188's editor, whose content is a static string.
//
// ⚠ design/187 draws only the AI variant of the primary button. The label here
// follows the selection rather than inventing a second drawn state.
//
// "Create Draft Manually" leads to design/266's editor (app/advocate/notice/
// draft-editor.tsx), which is design/188's editor without the AI panel; "AI
// Generate Draft" leads to design/188's.
//
// The purple is the quarantined Legalitt AI palette (constants/tokens/legalittAi.ts).

export default function AdvocateNoticeDraftingScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = ADV_NOTICE_DRAFTING;
  const [method, setMethod] = useState<'ai' | 'manual'>('ai');
  const chosen = d.methods.find((m) => m.id === method) ?? d.methods[0];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} {...shrinkToFit(0.7)}>
            {d.title}
          </Text>
          {/* design/187 clips this line behind the avatar; it wraps here. */}
          <Text style={styles.sub} {...shrinkToFit(0.75)}>
            {d.sub}
          </Text>
        </View>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.docket}>
          <View style={styles.docketDot} />
          <Text style={styles.docketText} {...shrinkToFit(0.75)}>
            {d.docket}
          </Text>
        </View>

        {/* Neutral placeholder — design/187's hero photograph, at the drawn size. */}
        <View style={styles.hero}>
          <View style={styles.heroLabel}>
            <ShieldCheck size={t.heroLabelIcon} color={ink.onBrand} />
            <Text style={styles.heroLabelText} {...shrinkToFit(0.75)}>
              {d.heroLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.heading} {...shrinkToFit(0.75)}>
          {d.heading}
        </Text>
        <Text style={styles.headingSub}>{d.headingSub}</Text>

        {d.methods.map((m) => {
          const selected = method === m.id;
          const isAi = m.id === 'ai';
          return (
            <Pressable
              key={m.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setMethod(m.id)}
              style={[
                styles.card,
                selected && (isAi ? styles.cardSelAi : styles.cardSel),
              ]}
            >
              <View style={styles.cardHead}>
                <View style={[styles.badge, !isAi && styles.badgeStd]}>
                  {isAi ? (
                    <Sparkles size={t.badgeIcon} color={ai.purple} />
                  ) : (
                    <FileSignature size={t.badgeIcon} color={t.badgeStdColour} />
                  )}
                  <Text
                    style={[styles.badgeText, !isAi && styles.badgeTextStd]}
                    {...shrinkToFit(0.75)}
                  >
                    {m.badge}
                  </Text>
                </View>
                <View
                  style={[
                    styles.pick,
                    selected && (isAi ? styles.pickOnAi : styles.pickOn),
                  ]}
                >
                  {selected && <Check size={t.pickIcon} color={ink.onBrand} />}
                </View>
              </View>

              <View style={styles.mRow}>
                <View style={[styles.tile, !isAi && styles.tileStd]}>
                  {isAi ? (
                    <AiMark size={t.tileIcon} />
                  ) : (
                    <PencilLine size={t.tileIcon} color={colors.brandDark} />
                  )}
                </View>
                <View style={styles.mText}>
                  <View style={styles.mTitleRow}>
                    <Text style={styles.mTitle} {...shrinkToFit(0.7)}>
                      {m.title}
                    </Text>
                    {m.chip && (
                      <View style={styles.mChip}>
                        <Text style={styles.mChipText} {...shrinkToFit(0.8)}>
                          {m.chip}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.mBody}>{m.body}</Text>
                </View>
              </View>

              <View style={styles.mFoot}>
                {isAi ? (
                  <Zap size={t.mFootIcon} color={ai.purple} />
                ) : (
                  <FileSignature size={t.mFootIcon} color={colors.textBody} />
                )}
                <Text style={styles.mFootText}>{m.footnote}</Text>
              </View>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push(
              (method === 'manual' ? '/advocate/notice/draft-editor' : `/advocate/notice/${id}/draft`) as Href,
            )
          }
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.7)}>
            {chosen.action}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} style={styles.btnIcon} />
        </Pressable>

        <Text style={styles.conf}>{d.confidentiality}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap, marginRight: 10 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 36 },

  docket: {
    marginTop: t.docketGap,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.docketHeight,
    borderRadius: t.docketRadius,
    paddingHorizontal: t.docketPadX,
    backgroundColor: t.docketBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docketDot: {
    width: t.docketDot,
    height: t.docketDot,
    borderRadius: t.docketDot / 2,
    marginRight: t.docketDotGap,
    backgroundColor: colors.brandDark,
  },
  docketText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.docketSize,
    letterSpacing: t.docketSpacing,
    color: colors.textPrimary,
  },

  hero: {
    marginTop: t.heroGap,
    height: t.heroHeight,
    borderRadius: t.heroRadius,
    backgroundColor: t.heroBg,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: t.heroLabelInset,
  },
  heroLabel: {
    minHeight: t.heroLabelHeight,
    borderRadius: t.heroLabelRadius,
    paddingHorizontal: t.heroLabelPadX,
    backgroundColor: t.heroLabelBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLabelText: {
    marginLeft: t.heroLabelIconGap,
    fontFamily: font.appSemi,
    fontSize: t.heroLabelSize,
    color: ink.onBrand,
  },

  heading: {
    marginTop: t.headingGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.textPrimary,
  },
  headingSub: {
    marginTop: t.headingSubGap,
    fontFamily: font.appBody,
    fontSize: t.headingSubSize,
    lineHeight: t.headingSubLineHeight,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    borderWidth: t.cardBorderW,
    borderColor: 'transparent',
    backgroundColor: t.cardBg,
    padding: t.cardPad,
  },
  cardSel: { borderColor: colors.brand },
  cardSelAi: { borderColor: ai.purple, backgroundColor: t.cardSelBg },

  cardHead: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    minHeight: t.badgeHeight,
    borderRadius: t.badgeRadius,
    paddingHorizontal: t.badgePadX,
    backgroundColor: t.badgeBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  badgeStd: { backgroundColor: t.badgeStdBg },
  badgeText: {
    marginLeft: t.badgeIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.badgeSize,
    letterSpacing: t.badgeSpacing,
    color: ai.purple,
  },
  badgeTextStd: { color: t.badgeStdColour },
  pick: {
    marginLeft: 'auto',
    width: t.pickCircle,
    height: t.pickCircle,
    borderRadius: t.pickCircle / 2,
    backgroundColor: t.pickEmptyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickOn: { backgroundColor: colors.brand },
  pickOnAi: { backgroundColor: ai.purpleDeep },

  mRow: { marginTop: t.tileGap, flexDirection: 'row' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileStd: { backgroundColor: t.tileStdBg },
  mText: { flex: 1, minWidth: 0, marginLeft: t.tileGapX },
  mTitleRow: { flexDirection: 'row', alignItems: 'center' },
  mTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.mTitleSize, color: colors.textPrimary },
  mChip: {
    marginLeft: t.mChipGap,
    minHeight: t.mChipHeight,
    borderRadius: t.mChipRadius,
    paddingHorizontal: t.mChipPadX,
    backgroundColor: t.mChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  mChipText: { fontFamily: font.appBody, fontSize: t.mChipSize, color: colors.textBody },
  mBody: {
    marginTop: t.mBodyGap,
    fontFamily: font.appBody,
    fontSize: t.mBodySize,
    lineHeight: t.mBodyLineHeight,
    color: colors.textPrimary,
  },
  mFoot: { marginTop: t.mFootGap, flexDirection: 'row' },
  mFootText: {
    marginLeft: t.mFootIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appSemi,
    fontSize: t.mFootSize,
    lineHeight: t.mFootLineHeight,
    color: colors.textPrimary,
  },

  btn: {
    marginTop: t.btnGap,
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  btnText: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand },
  btnIcon: { marginLeft: t.btnIconGap },
  conf: {
    marginTop: t.confGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.confSize,
    lineHeight: t.confLineHeight,
    color: colors.textPrimary,
  },
  pressed: { opacity: 0.85 },
});

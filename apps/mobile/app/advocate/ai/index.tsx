import { previewNotice } from '../../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Paperclip,
  UploadCloud,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiMark } from '../../../components/AiFlowerMark';
import { DEV_PREVIEW_TOGGLES } from '../../../constants/dev';
import { shrinkToFit } from '../../../constants/textFit';
import { ADV_AI_CHAT } from '../../../data/advocateSide';
import { legalittAi as t, colors, font, ink } from '../../../constants/theme';

// Legalitt AI (designs 170 and 171).
//
// ⚠ STATIC MOCK-UP. The answer below is a string from data/advocateSide.ts.
// Typing appends the advocate's message and NO RESPONSE IS GENERATED — there is no
// model provider, no document ingestion and no retrieval.
//
// ⚠ This screen has its own palette (near-black header, purple mark), quarantined
// in constants/tokens/legalittAi.ts. It must not leak into the shared theme.
//
// design/171 is the empty state and design/170 the state with content. Both come
// from this component: the screen opens on design/170, and the empty state is
// reachable behind DEV_PREVIEW_TOGGLES, since nothing in the prototype can clear a
// conversation. The upload card, Copy and the attach button are inert.

export default function LegalittAiScreen() {
  const insets = useSafeAreaInsets();
  const a = ADV_AI_CHAT;
  const [draft, setDraft] = useState('');
  const [asked, setAsked] = useState<string[]>([]);
  const [empty, setEmpty] = useState(false);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setAsked((s) => [...s, text]);
    setDraft('');
    setEmpty(false);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.backBtn}
        >
          <ChevronLeft size={t.backBtnIcon} color={t.titleColour} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {a.title}
          </Text>
          <Text style={styles.sub} {...shrinkToFit(0.7)}>
            {a.subtitle}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.empty}>
          <AiMark size={t.flower} colors={[t.purple, t.purpleDeep]} />
          <Text style={styles.greet} {...shrinkToFit(0.75)}>
            {a.greeting}
          </Text>
          <Text style={styles.greetSub} {...shrinkToFit(0.75)}>
            {a.greetingSub}
          </Text>
        </View>

        {empty ? (
          /* Development only — design/171, otherwise unreachable. */
          DEV_PREVIEW_TOGGLES && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setEmpty(false)}
              style={styles.devLink}
            >
              <Text style={styles.devLinkText}>Preview state: with conversation</Text>
            </Pressable>
          )
        ) : (
          <>
        {/* Inert — no upload flow is designed anywhere in the app. */}
        <Pressable onPress={() => previewNotice(a.upload.title)} accessibilityRole="button" style={styles.card}>
          <View style={styles.tile}>
            <UploadCloud size={t.tileIcon} color={t.purple} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle} {...shrinkToFit(0.75)}>
              {a.upload.title}
            </Text>
            <Text style={styles.cardSub} {...shrinkToFit(0.75)}>
              {a.upload.sub}
            </Text>
          </View>
          <ChevronRight size={t.cardChevron} color={t.purple} />
        </Pressable>

        <View style={styles.msgRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{a.question.initials}</Text>
          </View>
          <View style={styles.bubble}>
            <Text style={styles.sender} {...shrinkToFit(0.75)}>
              {a.question.sender}
            </Text>
            <Text style={styles.msg}>{a.question.text}</Text>
          </View>
        </View>
        <Text style={styles.time}>{a.question.time}</Text>

        <View style={styles.msgRow}>
          <View style={styles.aiMark}>
            <AiMark size={t.aiMark} colors={[t.purple, t.purpleDeep]} />
          </View>
          <View style={styles.bubble}>
            <Text style={styles.sender} {...shrinkToFit(0.75)}>
              {a.answer.label}
            </Text>
            <Text style={styles.msg}>{a.answer.text}</Text>
            {/* Inert — Copy has no designed destination. */}
            <Pressable onPress={() => previewNotice(a.answer.copy)} accessibilityRole="button" style={styles.copy}>
              <Copy size={t.copyIcon} color={colors.textPrimary} />
              <Text style={styles.copyText} {...shrinkToFit(0.8)}>
                {a.answer.copy}
              </Text>
            </Pressable>
          </View>
        </View>

        {asked.map((q, i) => (
          <View key={`${q}-${i}`} style={styles.msgRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AC</Text>
            </View>
            <View style={styles.bubble}>
              <Text style={styles.msg}>{q}</Text>
            </View>
          </View>
        ))}

        {/* Development only — design/171 has no path back from a conversation. */}
        {DEV_PREVIEW_TOGGLES && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setEmpty(true)}
            style={styles.devLink}
          >
            <Text style={styles.devLinkText}>Preview state: empty</Text>
          </Pressable>
        )}
          </>
        )}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + t.composerPadTop }]}>
        <View style={styles.bar}>
          {/* Inert — no upload flow is designed. */}
          <Pressable onPress={() => previewNotice("Attach")} accessibilityRole="button" accessibilityLabel="Attach">
            <Paperclip size={t.attachIcon} color={colors.textBody} />
          </Pressable>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={a.placeholder}
            placeholderTextColor={colors.textBody}
            onSubmitEditing={send}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            onPress={send}
            style={styles.send}
          >
            <ArrowRight size={t.sendBtnIcon} color={ink.onBrand} />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>{a.disclaimer}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    paddingHorizontal: t.headerPadX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: t.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: t.titleColour },
  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: t.subColour },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },
  empty: { marginTop: t.emptyTop, alignItems: 'center' },
  greet: {
    marginTop: t.greetGap,
    fontFamily: font.appHeading,
    fontSize: t.greetSize,
    color: colors.textPrimary,
  },
  greetSub: {
    marginTop: t.greetSubGap,
    fontFamily: font.appBody,
    fontSize: t.greetSubSize,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    padding: t.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    borderWidth: 1,
    borderColor: t.tileBorder,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, minWidth: 0, marginLeft: t.tileGap, marginRight: 8 },
  cardTitle: { fontFamily: font.appHeading, fontSize: t.cardTitleSize, color: colors.textPrimary },
  cardSub: { marginTop: t.cardSubGap, fontFamily: font.appBody, fontSize: t.cardSubSize, color: colors.textBody },

  msgRow: { marginTop: t.msgGap, flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarText, color: colors.brandDark },
  aiMark: { width: t.avatar, alignItems: 'center' },
  bubble: {
    flexShrink: 1,
    maxWidth: t.bubbleMaxW,
    marginLeft: t.avatarGap,
    borderRadius: t.bubbleRadius,
    backgroundColor: t.bubbleBg,
    padding: t.bubblePad,
  },
  sender: { marginBottom: t.senderGap, fontFamily: font.appBody, fontSize: t.senderSize, color: colors.textBody },
  msg: {
    fontFamily: font.appBody,
    fontSize: t.msgSize,
    lineHeight: t.msgLineHeight,
    color: colors.textPrimary,
  },
  time: {
    marginTop: t.timeGap,
    marginLeft: t.avatar + t.avatarGap,
    fontFamily: font.appBody,
    fontSize: t.timeSize,
    color: colors.textBody,
  },
  copy: {
    marginTop: t.copyGap,
    alignSelf: 'flex-end',
    minHeight: t.copyHeight,
    borderRadius: t.copyRadius,
    paddingHorizontal: t.copyPadX,
    backgroundColor: t.copyBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: { marginLeft: t.copyIconGap, fontFamily: font.appBody, fontSize: t.copySize, color: colors.textPrimary },

  composer: {
    paddingHorizontal: t.composerPadX,
    paddingTop: t.composerPadTop,
    backgroundColor: t.composerBg,
    borderTopWidth: 1,
    borderTopColor: t.composerBorder,
  },
  bar: {
    minHeight: t.barHeight,
    borderRadius: t.barRadius,
    backgroundColor: t.barBg,
    paddingLeft: t.barPadLeft,
    paddingRight: t.barPadRight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.attachGap,
    marginRight: 8,
    paddingVertical: 12,
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  send: {
    width: t.sendBtn,
    height: t.sendBtn,
    borderRadius: t.sendBtn / 2,
    backgroundColor: t.sendBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devLink: { marginTop: 24, alignItems: 'center' },
  devLinkText: { fontFamily: font.appBody, fontSize: 12, color: colors.textBody },
  disclaimer: {
    marginTop: t.discGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.discSize,
    lineHeight: t.discLineHeight,
    color: t.discColour,
  },
});

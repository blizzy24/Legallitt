import DemoPressable from '../../../components/DemoPressable';
import { router } from 'expo-router';
import { BadgeCheck, ChevronLeft, Clock, Mic, Plus, Send } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { LA_ADVOCATE } from '../../../data/legalAdvice';
import { colors, font, ink, laChat as t } from '../../../constants/theme';

// Chat consultation (design/113-la-session-video.png — the file name is wrong; the
// batch's numbering is shifted by one).
//
// ─────────────────────────────────────────────────────────────────────────────
// STATIC MOCK-UP. Nothing is sent, received or stored. The composer accepts text but
// the send control is inert, and the typing indicator is decoration, not state.
//
// SCOPE, NOT UI: a real consultation needs a calling and messaging vendor — message
// delivery and ordering, attachments, retention and the seven-day validity window
// this screen advertises, plus whatever recording the profession requires. None of
// that is a design question and none of it can be inferred from these screens.
//
// REPORTED — THE BUBBLE STYLING CONFLICTS WITH THE APP'S OTHER CHAT. These flat grey
// bubbles on a cool grey page are the same treatment as design/33-chat-advocate.png,
// which was blocked earlier as inconsistent with the app's language. It now appears
// twice, so it may well be deliberate — but app/support-chat.tsx (design/35) styles
// the same component in the beige palette with branded outgoing bubbles. Two chat
// screens in one app, two unrelated looks. Built as drawn; the client picks one.
//
// Also drawn as-is: both advocate messages carry the same copy with "relevent"
// misspelled, and the user's second reply reads "Yes ia can easily send message".
// ─────────────────────────────────────────────────────────────────────────────

const MESSAGES = [
  {
    mine: false,
    text: 'Hello you can now message me with any case concerns or upload any relevent documents here…',
  },
  { mine: true, text: 'Yes I can Easily send message and upload documents easily' },
  {
    mine: false,
    text: 'Hello you can now message me with any case concerns or upload any relevent documents here…',
  },
  { mine: true, text: 'Yes ia can easily send message' },
];

export default function LegalAdviceChatSessionScreen() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/legal-advice/track'))}
        >
          <ChevronLeft size={t.backIcon} color={ink.onBrand} />
        </Pressable>

        <View style={styles.avatarWrap}>
          {/* Placeholder for design/113's photograph, sized to its circle. */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{LA_ADVOCATE.initials}</Text>
          </View>
          <View style={styles.dot} />
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {LA_ADVOCATE.name}
        </Text>
        <BadgeCheck size={t.verified} color={t.headerBg} fill={ink.onBrand} style={styles.verified} />
      </View>

      <View style={styles.strip}>
        <Clock size={t.stripIcon} color={t.stripColour} />
        <Text style={styles.stripText} {...shrinkToFit(0.75)}>
          Chat Valid Upto 7 Days From Now
        </Text>
        <Text style={styles.stripTime} {...shrinkToFit(0.8)}>
          00:59 min
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {MESSAGES.map((m, i) => (
          <View key={i} style={[styles.row, m.mine && styles.rowMine]}>
            {!m.mine && (
              <View style={styles.bubbleAvatar}>
                <Text style={styles.bubbleAvatarText}>{LA_ADVOCATE.initials}</Text>
              </View>
            )}
            <View style={[styles.bubble, m.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={styles.bubbleText}>{m.text}</Text>
            </View>
          </View>
        ))}

        <View style={styles.typing}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </ScrollView>

      <View style={[styles.composerWrap, { paddingBottom: insets.bottom + t.composerGap }]}>
        <View style={styles.composer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Attach" style={styles.plus}>
            <Plus size={t.plusGlyph} color={ink.onBrand} />
          </Pressable>
          <View style={styles.divider} />
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Voice message" hitSlop={6}>
            <Mic size={t.micSize} color={colors.textPrimary} />
          </Pressable>
          <DemoPressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            hitSlop={6}
            style={styles.send}
          >
            <Send size={t.sendSize} color={colors.brand} fill={colors.brand} />
          </DemoPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.pageBg },
  header: {
    minHeight: t.headerHeight,
    backgroundColor: t.headerBg,
    paddingHorizontal: t.padX,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: { marginLeft: t.backGap },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatarRadius,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarText, color: colors.brandDark },
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: t.dot,
    height: t.dot,
    borderRadius: t.dot / 2,
    backgroundColor: '#1FC41F',
  },
  name: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.nameGap,
    fontFamily: font.appBody,
    fontSize: t.nameSize,
    color: ink.onBrand,
  },
  verified: { marginLeft: t.verifiedGap },

  strip: {
    marginTop: t.stripGap,
    marginHorizontal: t.padX,
    minHeight: t.stripHeight,
    borderRadius: t.stripRadius,
    paddingHorizontal: t.stripPadX,
    backgroundColor: t.stripBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stripText: {
    marginLeft: t.stripIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.stripSize,
    color: t.stripColour,
  },
  stripTime: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.stripTimeSize,
    color: t.stripColour,
  },

  list: { paddingHorizontal: t.padX, paddingTop: t.listGap, paddingBottom: t.listGap },
  row: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'flex-start' },
  rowMine: { justifyContent: 'flex-end' },
  bubbleAvatar: {
    width: t.bubbleAvatar,
    height: t.bubbleAvatar,
    borderRadius: t.bubbleAvatar / 2,
    marginRight: t.bubbleAvatarGap,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleAvatarText: {
    fontFamily: font.appSemi,
    fontSize: t.bubbleAvatarText,
    color: colors.brandDark,
  },
  bubble: {
    maxWidth: `${t.bubbleMaxWidth * 100}%`,
    borderRadius: t.bubbleRadius,
    paddingHorizontal: t.bubblePadX,
    paddingVertical: t.bubblePadY,
  },
  bubbleTheirs: { backgroundColor: t.bubbleTheirs },
  bubbleMine: { backgroundColor: t.bubbleMine },
  bubbleText: {
    fontFamily: font.appBody,
    fontSize: t.bubbleSize,
    lineHeight: t.bubbleLineHeight,
    color: colors.textPrimary,
  },

  typing: { marginTop: t.typingGap, flexDirection: 'row', alignItems: 'center' },
  typingDot: {
    width: t.typingDot,
    height: t.typingDot,
    borderRadius: t.typingDot / 2,
    marginRight: t.typingDotGap,
    backgroundColor: t.typingColour,
  },

  composerWrap: { paddingHorizontal: t.padX, paddingTop: t.composerGap },
  composer: {
    minHeight: t.composerHeight,
    borderRadius: t.composerRadius,
    backgroundColor: colors.card,
    padding: t.composerPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  plus: {
    width: t.plus,
    height: t.plus,
    borderRadius: t.plus / 2,
    backgroundColor: t.plusBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: t.divider,
    height: t.dividerHeight,
    marginHorizontal: t.dividerGap,
    backgroundColor: colors.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  send: { marginLeft: t.sendGap, marginRight: 6 },
});

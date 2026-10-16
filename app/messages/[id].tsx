import { previewNotice } from '../../components/PreviewNotice';
import { router, useLocalSearchParams } from 'expo-router';
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  CircleSlash,
  FileText,
  Paperclip,
  Plus,
  Send,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import {
  THREADS,
  THREAD_CONTEXT,
  conversationById,
  conversationParty,
  type ThreadMessage,
} from '../../data/messages';
import { colors, font, ink, messageThread as t } from '../../constants/theme';

// Message thread (design/143).
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THIS IS THE THIRD CHAT STYLING IN THE APP:
//
//   design/33 and design/112   flat grey bubbles on cool grey, no context bar
//   design/35 (support chat)   white bubbles with a brand-coloured outgoing side
//   design/143 (here)          beige incoming, white outgoing, plus a matter
//                              context bar under the header
//
// Three treatments of one component. This one is the newest and the only one drawn
// in the app's own palette, so it is the sensible canonical choice — but nothing
// else has been changed, and the other two screens still look as they were built.
// ─────────────────────────────────────────────────────────────────────────────
//
// Typing and sending append locally; nothing is sent anywhere. The failed-send state
// is the only one designed in the app, and Retry clears it.

type LocalMessage = ThreadMessage & { id: string };

export default function MessageThreadScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = id ? conversationById(id) : undefined;
  const party = conversation
    ? conversationParty(conversation)
    : { name: 'Conversation', initials: '?', city: '' };
  const context = (id && THREAD_CONTEXT[id]) || { matter: '', category: '' };

  const seed = useMemo<LocalMessage[]>(
    () => ((id && THREADS[id]) || []).map((m, i) => ({ ...m, id: `seed-${i}` })),
    [id],
  );
  const [messages, setMessages] = useState<LocalMessage[]>(seed);
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${prev.length}`,
        kind: 'text',
        mine: true,
        text,
        time: 'Now',
      },
    ]);
    setDraft('');
  };

  const retry = (msgId: string) =>
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId && m.kind === 'text' ? { ...m, failed: false } : m)),
    );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/messages'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{party.initials}</Text>
          </View>
          {conversation?.online && <View style={styles.dot} />}
        </View>

        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.name} {...shrinkToFit(0.75)}>
              {party.name}
            </Text>
            {conversation?.badge === 'verified' && (
              <View style={styles.badge}>
                <BadgeCheck size={13} color="#1E8B4D" fill="#1E8B4D" />
                <Text style={styles.badgeText} {...shrinkToFit(0.8)}>
                  Verified
                </Text>
              </View>
            )}
          </View>
          <View style={styles.subRow}>
            <View style={styles.subDot} />
            <Text style={styles.sub} {...shrinkToFit(0.8)}>
              {conversation?.online ? 'Online' : 'Offline'}
              {party.city ? ` • ${party.city}` : ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.strip}>
        <View style={styles.stripDot} />
        <Text style={styles.stripMatter} {...shrinkToFit(0.75)}>
          {context.matter}
        </Text>
        <Text style={styles.stripCat} {...shrinkToFit(0.75)}>
          • {context.category}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.divider}>
          <Text style={styles.dividerText}>TODAY</Text>
        </View>

        {messages.map((m) => (
          <View key={m.id} style={styles.row}>
            <Text style={[styles.sender, m.mine && styles.senderMine]}>
              {m.mine ? 'You' : party.name}
            </Text>

            {m.kind === 'text' ? (
              <View
                style={[
                  styles.bubble,
                  m.mine ? styles.bubbleOut : styles.bubbleIn,
                  m.mine && m.failed && styles.bubbleFailed,
                ]}
              >
                <Text style={styles.bubbleText}>{m.text}</Text>
              </View>
            ) : (
              <View style={styles.doc}>
                <View style={styles.docIcon}>
                  <FileText size={t.docIconGlyph} color={colors.brandDark} />
                </View>
                <View style={styles.docText}>
                  <Text style={styles.docName} {...shrinkToFit(0.75)}>
                    {m.name}
                  </Text>
                  <Text style={styles.docMeta} {...shrinkToFit(0.75)}>
                    {m.size} • {m.type}
                  </Text>
                </View>
                <Pressable onPress={() => previewNotice("View")} accessibilityRole="button" style={styles.docView}>
                  <Text style={styles.docViewText} {...shrinkToFit(0.8)}>
                    View
                  </Text>
                </Pressable>
              </View>
            )}

            {m.kind === 'text' && m.mine && m.failed ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => retry(m.id)}
                style={styles.failed}
              >
                <CircleSlash size={t.failedIcon} color={t.failedColour} />
                <Text style={styles.failedText} {...shrinkToFit(0.75)}>
                  Message failed to send
                </Text>
                <Text style={styles.failedDot}>•</Text>
                <Text style={styles.retry} {...shrinkToFit(0.8)}>
                  Retry
                </Text>
              </Pressable>
            ) : (
              <View style={[styles.timeRow, m.mine && styles.timeRowMine]}>
                <Text style={styles.time} {...shrinkToFit(0.8)}>
                  {m.time}
                </Text>
                {m.mine && <Check size={t.tickSize} color={colors.textBody} style={styles.tick} />}
              </View>
            )}
          </View>
        ))}

        <View style={styles.typing}>
          <Text style={styles.typingText} {...shrinkToFit(0.75)}>
            {party.name} is typing
          </Text>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable onPress={() => previewNotice("Document")} accessibilityRole="button" style={styles.docChip}>
          <Paperclip size={t.docChipIcon} color={colors.brandDark} />
          <Text style={styles.docChipText} {...shrinkToFit(0.8)}>
            Document
          </Text>
        </Pressable>

        <View style={styles.inputRow}>
          <Pressable onPress={() => previewNotice("Attach")} accessibilityRole="button" accessibilityLabel="Attach" hitSlop={8}>
            <Plus size={t.plusIcon} color={colors.textPrimary} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            onPress={send}
            style={styles.send}
          >
            <Send size={t.sendIcon} color={ink.onBrand} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: 14,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: { width: t.avatar, height: t.avatar, marginLeft: t.backGap },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
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
    borderWidth: 2,
    borderColor: colors.card,
    backgroundColor: '#17B169',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.avatarGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  badge: {
    marginLeft: t.badgeGap,
    minHeight: 24,
    borderRadius: 7,
    paddingHorizontal: 7,
    backgroundColor: '#E4F4E9',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  badgeText: { marginLeft: 4, fontFamily: font.appSemi, fontSize: 11.5, color: '#1E8B4D' },
  subRow: { marginTop: t.subGap, flexDirection: 'row', alignItems: 'center' },
  subDot: {
    width: t.subDot,
    height: t.subDot,
    borderRadius: t.subDot / 2,
    marginRight: t.subDotGap,
    backgroundColor: t.subColour,
  },
  sub: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.subSize, color: t.subColour },

  strip: {
    minHeight: t.stripHeight,
    paddingHorizontal: t.padX,
    backgroundColor: t.stripBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stripDot: {
    width: t.stripDot,
    height: t.stripDot,
    borderRadius: t.stripDot / 2,
    marginRight: t.stripDotGap,
    backgroundColor: colors.brandDark,
  },
  stripMatter: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.stripMatterSize,
    color: colors.textPrimary,
  },
  stripCat: {
    marginLeft: t.stripCatGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.stripCatSize,
    color: colors.textBody,
  },

  list: { paddingHorizontal: t.padX, paddingTop: t.listGap, paddingBottom: t.listGap },
  divider: {
    alignSelf: 'center',
    minHeight: t.dividerHeight,
    borderRadius: t.dividerRadius,
    paddingHorizontal: t.dividerPadX,
    backgroundColor: t.dividerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerText: {
    fontFamily: font.appSemi,
    fontSize: t.dividerSize,
    letterSpacing: t.dividerSpacing,
    color: colors.textBody,
  },

  row: { marginTop: t.rowGap },
  sender: { fontFamily: font.appBody, fontSize: t.senderSize, color: colors.textBody },
  senderMine: { textAlign: 'right' },
  bubble: {
    marginTop: t.senderGap,
    maxWidth: `${t.bubbleMax * 100}%`,
    borderRadius: t.bubbleRadius,
    paddingHorizontal: t.bubblePadX,
    paddingVertical: t.bubblePadY,
  },
  bubbleIn: { alignSelf: 'flex-start', backgroundColor: t.bubbleIn },
  bubbleOut: {
    alignSelf: 'flex-end',
    backgroundColor: t.bubbleOut,
    borderWidth: 1,
    borderColor: t.bubbleOutBorder,
  },
  bubbleFailed: { borderColor: t.failedBorder },
  bubbleText: {
    fontFamily: font.appBody,
    fontSize: t.bubbleSize,
    lineHeight: t.bubbleLineHeight,
    color: colors.textPrimary,
  },

  doc: {
    marginTop: t.senderGap,
    alignSelf: 'flex-end',
    maxWidth: `${t.bubbleMax * 100}%`,
    borderRadius: t.docRadius,
    backgroundColor: t.bubbleOut,
    borderWidth: 1,
    borderColor: t.bubbleOutBorder,
    padding: t.docPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: t.docIcon,
    height: t.docIcon,
    borderRadius: t.docIconRadius,
    backgroundColor: t.docIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginLeft: t.docIconGap, marginRight: 10 },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: {
    marginTop: t.docMetaGap,
    fontFamily: font.appBody,
    fontSize: t.docMetaSize,
    color: colors.textBody,
  },
  docView: {
    minHeight: t.docViewHeight,
    borderRadius: t.docViewRadius,
    paddingHorizontal: t.docViewPadX,
    backgroundColor: t.docViewBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docViewText: { fontFamily: font.appBody, fontSize: t.docViewSize, color: colors.brandDark },

  timeRow: { marginTop: t.timeGap, flexDirection: 'row', alignItems: 'center' },
  timeRowMine: { justifyContent: 'flex-end' },
  time: { fontFamily: font.appBody, fontSize: t.timeSize, color: colors.textBody },
  tick: { marginLeft: t.tickGap },

  failed: {
    marginTop: t.failedGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  failedText: {
    marginLeft: t.failedIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.failedSize,
    color: t.failedColour,
  },
  failedDot: { marginHorizontal: 8, color: colors.textBody },
  retry: { fontFamily: font.appBody, fontSize: t.failedSize, color: t.retryColour },

  typing: {
    marginTop: t.typingGap,
    alignSelf: 'flex-start',
    minHeight: t.typingHeight,
    borderRadius: t.typingRadius,
    paddingHorizontal: t.typingPadX,
    backgroundColor: t.typingBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.typingSize, color: colors.textBody },
  typingDots: { marginLeft: 12, flexDirection: 'row', gap: t.typingDotGap },
  typingDot: {
    width: t.typingDot,
    height: t.typingDot,
    borderRadius: t.typingDot / 2,
    backgroundColor: t.typingDotColour,
  },

  composer: {
    paddingHorizontal: t.padX,
    paddingTop: t.composerPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: t.composerBorder,
  },
  docChip: {
    alignSelf: 'flex-start',
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: t.docChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docChipText: {
    marginLeft: t.docChipIconGap,
    fontFamily: font.appBody,
    fontSize: t.docChipSize,
    color: colors.brandDark,
  },
  inputRow: {
    marginTop: t.composerGap,
    minHeight: t.composerHeight,
    borderRadius: t.composerRadius,
    borderWidth: 1,
    borderColor: t.composerBorder2,
    paddingLeft: 16,
    paddingRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginLeft: t.plusGap,
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  send: {
    marginLeft: 10,
    width: t.send,
    height: t.send,
    borderRadius: t.send / 2,
    backgroundColor: t.sendBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

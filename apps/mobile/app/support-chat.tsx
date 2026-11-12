import { previewNotice } from '../components/PreviewNotice';
import { router } from 'expo-router';
import { Check, Clock, Info, Paperclip, Send, ShieldCheck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import { colors, font, ink, supportChat as c } from '../constants/theme';

type Message = { id: string; from: 'support' | 'user'; text: string; sender?: boolean };

// design/35's transcript. Only the first and last support messages carry the
// "Legalitt Support" avatar line in the file.
const INITIAL: Message[] = [
  { id: 'm1', from: 'support', sender: true, text: 'Hello! Welcome to Legalitt Support. How can we help you with your legal notice requirement?' },
  { id: 'm2', from: 'support', text: 'Please tell us briefly what you need help with.' },
  { id: 'm3', from: 'user', text: 'I need help sending a legal notice regarding a property matter.' },
  { id: 'm4', from: 'support', sender: true, text: 'Sure. We can help you understand the next steps and required information. You can share relevant details or attach contract excerpts here for initial guidance.' },
];

const SUGGESTIONS = [
  'What documents do I need?',
  'How does the process work?',
  'I need help choosing a service',
  'I have a question',
];

// Legal Support chat (design/35). Sending appends a local message; nothing replies.
function FixtureSupportChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [draft, setDraft] = useState('');
  const scroll = useRef<ScrollView>(null);
  const nextId = useRef(0);

  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    nextId.current += 1;
    setMessages((m) => [...m, { id: `local-${nextId.current}`, from: 'user', text: body }]);
    setDraft('');
    requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + c.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}>
          <ArrowBack />
        </Pressable>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Legal Support</Text>
            <View style={styles.assisted}>
              <Text style={styles.assistedText}>Assisted</Text>
            </View>
          </View>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>Legalitt Support Team</Text>
            <View style={styles.dot} />
            <Text style={[styles.subtitle, styles.online]}>Available to assist</Text>
          </View>
        </View>
        <Pressable onPress={() => previewNotice("About this chat")} accessibilityRole="button" accessibilityLabel="About this chat" hitSlop={10}>
          <Info size={c.infoIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.bar}>
        <Clock size={c.barIcon} color={ink.accent} />
        <Text style={styles.barText} numberOfLines={1} {...shrinkToFit()}>
          Regarding: <Text style={styles.barStrong}>Legal Notice Service</Text>
        </Text>
        <View style={styles.barChip}>
          <Text style={styles.barChipText}>Non-Advocate Chat</Text>
        </View>
      </View>

      <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.today}>
          <Text style={styles.todayText}>Today</Text>
        </View>

        {messages.map((m, i) => (
          <View key={m.id} style={i === 0 ? null : styles.block}>
            {m.sender && (
              <View style={styles.senderRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>L</Text>
                </View>
                <Text style={styles.senderName}>Legalitt Support</Text>
              </View>
            )}
            <View style={m.from === 'user' ? styles.userBubble : styles.supportBubble}>
              <Text style={m.from === 'user' ? styles.userText : styles.bubbleText}>{m.text}</Text>
            </View>
            <View style={[styles.timeRow, m.from === 'user' && styles.timeRowUser]}>
              <Text style={styles.time}>Just now</Text>
              {m.from === 'user' && <Check size={c.timeIcon} color={c.time} />}
            </View>
            {i === 0 && (
              <View style={styles.suggest}>
                <Text style={styles.suggestLabel}>Suggested quick questions:</Text>
                <View style={styles.pills}>
                  {SUGGESTIONS.map((q) => (
                    <Pressable key={q} accessibilityRole="button" onPress={() => send(q)} style={styles.pill}>
                      <Text style={styles.pillText}>{q}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + c.composerBottom }]}>
        <View style={styles.caution}>
          <ShieldCheck size={c.cautionIcon} color={colors.textBody} />
          <Text style={styles.cautionText}>Please avoid sharing unnecessary sensitive information.</Text>
        </View>
        <View style={styles.composerRow}>
          <Pressable onPress={() => previewNotice("Attach a file")} accessibilityRole="button" accessibilityLabel="Attach a file" style={styles.attach}>
            <Paperclip size={c.controlIcon} color={ink.accent} />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => send(draft)}
            placeholder="Type your message..."
            placeholderTextColor={ink.hint}
            accessibilityLabel="Message"
            returnKeyType="send"
            style={styles.input}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => send(draft)} style={styles.send}>
            <Send size={c.controlIcon} color={ink.onBrand} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** The file draws a plain left arrow, thinner than lucide's default. */
function ArrowBack() {
  return (
    <View style={styles.back}>
      <Text style={styles.backGlyph}>←</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.chatBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: c.padX,
    paddingBottom: c.headerBottom,
    backgroundColor: colors.card,
  },
  back: {
    width: c.backIcon,
    alignItems: 'center',
  },
  backGlyph: {
    fontFamily: font.appBody,
    fontSize: c.backIcon,
    lineHeight: c.backIcon + 4,
    color: colors.textPrimary,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: c.backGap,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: c.titleSize,
    lineHeight: c.titleLineHeight,
    color: colors.textPrimary,
  },
  assisted: {
    marginLeft: c.chipGap,
    height: c.chipHeight,
    borderRadius: 6,
    paddingHorizontal: c.chipPadX,
    backgroundColor: ink.badgeBg,
    justifyContent: 'center',
  },
  assistedText: {
    fontFamily: font.appBody,
    fontSize: c.chipTextSize,
    color: colors.textBody,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: font.appBody,
    fontSize: c.subtitleSize,
    lineHeight: c.subtitleLineHeight,
    color: c.sender,
  },
  dot: {
    width: c.dotSize,
    height: c.dotSize,
    borderRadius: c.dotSize / 2,
    backgroundColor: c.online,
    marginHorizontal: c.dotGap,
  },
  online: {
    fontFamily: font.appSemi,
    color: c.online,
  },
  bar: {
    height: c.barHeight,
    paddingHorizontal: c.padX,
    backgroundColor: c.barBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barText: {
    flex: 1,
    minWidth: 0,
    marginLeft: c.barIconGap,
    fontFamily: font.appBody,
    fontSize: c.barTextSize,
    color: colors.textBody,
  },
  barStrong: {
    fontFamily: font.appHeading,
    color: colors.textPrimary,
  },
  barChip: {
    height: c.barChipHeight,
    borderRadius: c.barChipRadius,
    paddingHorizontal: c.barChipPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  barChipText: {
    fontFamily: font.appBody,
    fontSize: c.barChipTextSize,
    color: colors.textBody,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: c.padX - 1.4,
    paddingTop: c.todayGap,
    paddingBottom: c.blockGap,
  },
  today: {
    alignSelf: 'center',
    height: c.todayHeight,
    borderRadius: c.todayHeight / 2,
    paddingHorizontal: c.todayPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    marginBottom: 16.6,
  },
  todayText: {
    fontFamily: font.appBody,
    fontSize: c.todayTextSize,
    color: colors.textBody,
  },
  block: {
    marginTop: c.blockGap,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: c.bubbleGap,
  },
  avatar: {
    width: c.avatar,
    height: c.avatar,
    borderRadius: c.avatar / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: c.avatarGap,
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: c.avatarTextSize,
    color: ink.onBrand,
  },
  senderName: {
    fontFamily: font.appBody,
    fontSize: c.senderSize,
    color: c.sender,
  },
  supportBubble: {
    width: c.bubbleWidth,
    borderRadius: c.bubbleRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: c.bubblePadX,
    paddingVertical: c.bubblePadY,
  },
  userBubble: {
    alignSelf: 'flex-end',
    width: c.userWidth,
    borderRadius: c.bubbleRadius,
    backgroundColor: colors.brand,
    paddingHorizontal: c.bubblePadX,
    paddingVertical: c.bubblePadY,
  },
  bubbleText: {
    fontFamily: font.appBody,
    fontSize: c.bubbleTextSize,
    lineHeight: c.bubbleLineHeight,
    color: c.bubbleText,
  },
  userText: {
    fontFamily: font.appBody,
    fontSize: c.bubbleTextSize,
    lineHeight: c.bubbleLineHeight,
    color: ink.onBrand,
  },
  timeRow: {
    marginTop: c.timeGap,
    marginLeft: 4.6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: c.timeIconGap,
  },
  timeRowUser: {
    justifyContent: 'flex-end',
    marginRight: 8,
  },
  time: {
    fontFamily: font.appBody,
    fontSize: c.timeSize,
    color: c.time,
  },
  suggest: {
    marginTop: c.suggestGap,
  },
  suggestLabel: {
    marginLeft: 3.3,
    fontFamily: font.appBody,
    fontSize: c.suggestSize,
    color: c.sender,
  },
  pills: {
    marginTop: c.pillsGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: c.pillColGap,
    rowGap: c.pillRowGap,
  },
  pill: {
    height: c.pillHeight,
    borderRadius: c.pillHeight / 2,
    paddingHorizontal: c.pillPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: font.appBody,
    fontSize: c.pillTextSize,
    color: c.pillText,
  },
  composer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: c.composerTop,
    paddingHorizontal: c.composerPadX,
  },
  caution: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: c.cautionIconGap,
  },
  cautionText: {
    fontFamily: font.appBody,
    fontSize: c.cautionSize,
    color: colors.textBody,
  },
  composerRow: {
    marginTop: c.cautionGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: c.controlGap,
  },
  attach: {
    width: c.control,
    height: c.control,
    borderRadius: c.control / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: c.control,
    borderRadius: c.inputRadius,
    backgroundColor: c.chatBg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: c.inputPadX,
    fontFamily: font.appBody,
    fontSize: c.inputTextSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  send: {
    width: c.control,
    height: c.control,
    borderRadius: c.control / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import {SERVICE_CODES, type ServiceCode} from '@legalitt/shared';
import {useLocalSearchParams} from 'expo-router';
import {SupportChat} from '../features/messages/Support';
import {DATA_SOURCE as LIVE_DATA_SOURCE} from '../lib/data-source';
// ?service=fir_draft (flow C1b): shows "Regarding: FIR Draft Service" and tags the thread.
export default function LiveScreen() {
  const {service} = useLocalSearchParams<{service?: string}>();
  const code = SERVICE_CODES.includes(service as ServiceCode) ? (service as ServiceCode) : undefined;
  return LIVE_DATA_SOURCE === 'api' ? <SupportChat service={code}/> : <FixtureSupportChatScreen/>;
}

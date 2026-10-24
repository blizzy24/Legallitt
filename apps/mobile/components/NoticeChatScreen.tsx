import { AdvocateAvatar } from './AdvocateAvatar';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, CheckCheck, ChevronLeft, Clock3, Plus, Send, UserRound } from 'lucide-react-native';
import { ScrollView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { previewNotice } from './PreviewNotice';
import { font, noticeChat as t } from '../constants/theme';
import type { ChatMessage } from '../data/noticeChat';

// The Legal Notice chats, as drawn: design/33 (`client`, the tan header) and
// design/183 (`advocate`, the light header, the "Chat Valid" strip, timestamps
// and read ticks). Initial messages are exactly the drawn messages; typed
// messages are held locally, without fabricating a response. The designs draw photographs;
// named advocates use the supplied replacement portraits; clients keep the fallback.

function Avatar({ name = "", size, w, h, r, onBrand }: { name?: string; size?: number; w?: number; h?: number; r: number; onBrand?: boolean }) {
  const width = w ?? size;
  const height = h ?? size;
  return (
    <AdvocateAvatar name={name} style={[styles.avatar, onBrand && styles.avatarOnBrand, { width, height, borderRadius: r }]}>
      <UserRound size={(width ?? 0) * 0.5} color={t.white} strokeWidth={1.9} />
    </AdvocateAvatar>
  );
}

export default function NoticeChatScreen({
  variant,
  name,
  messages,
  placeholder,
  valid,
  validTime,
}: {
  variant: 'client' | 'advocate';
  name: string;
  messages: ChatMessage[];
  placeholder: string;
  valid?: string;
  validTime?: string;
}) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{message?: string}>();
  const [draft, setDraft] = useState('');
  const [thread, setThread] = useState<ChatMessage[]>(() => [...messages, ...(variant === 'client' && params.message ? [{from: 'me' as const, text: params.message}] : [])]);
  const adv = variant === 'advocate';
  const fg = adv ? t.brand : t.white;
  return (
    <View style={[styles.screen, adv && styles.screenAdv]}>
      <View style={[styles.header, adv ? styles.headerAdv : styles.headerClient, { paddingTop: insets.top + t.statusPad }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}>
          <ChevronLeft size={t.backIcon} color={fg} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.who}>
          <View>
            {adv ? <Avatar w={t.avatarW183} h={t.avatarH183} r={t.avatarRadius183} /> : <Avatar name={name} size={t.avatar} r={t.avatarRadius} onBrand />}
            <View style={styles.online} />
          </View>
          <Text style={[styles.name, { color: adv ? t.nameBrown : t.white }]}>{name}</Text>
          <BadgeCheck size={t.badge} color={adv ? t.white : t.brand} fill={adv ? t.verified : t.white} strokeWidth={2.2} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.thread, { paddingTop: adv ? t.threadTop183 : t.threadTop }]}>
        {adv && valid ? (
          <View style={styles.pill}>
            <View style={styles.row}>
              <Clock3 size={t.pillIcon} color={t.validPill} fill={t.validInk} strokeWidth={2.2} />
              <Text style={styles.pillText}>{valid}</Text>
            </View>
            <Text style={styles.pillText}>{validTime}</Text>
          </View>
        ) : null}
        {thread.map((m, i) =>
          m.from === 'them' ? (
            <View key={i} style={[styles.inRow, i > 0 ? styles.rowGap : null]}>
              <Avatar name={adv ? "" : name} size={t.msgAvatar} r={t.msgAvatar / 2} />
              <View style={[styles.bubble, adv && styles.bubbleAdv, m.time ? styles.bubbleMeta : null]}>
                <Text style={styles.text}>{m.text}</Text>
                {m.time ? <Text style={styles.time}>{m.time}</Text> : null}
              </View>
            </View>
          ) : (
            <View key={i} style={[styles.outRow, styles.rowGap]}>
              <View style={[styles.bubble, adv && styles.bubbleAdv, m.read ? styles.bubbleMeta : null]}>
                <Text style={styles.text}>{m.text}</Text>
                {m.read ? (
                  <View style={styles.tick}>
                    <CheckCheck size={t.tick} color={t.read} strokeWidth={2.4} />
                  </View>
                ) : null}
              </View>
            </View>
          ),
        )}
        <View style={styles.typing}>
          {[0, 1, 2].map((d) => (
            <View key={d} style={styles.dot} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.input, { marginBottom: insets.bottom + t.inputBottom }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Attach" onPress={() => previewNotice('Attach')} style={styles.plus}>
          <Plus size={t.plusIcon} color={t.white} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.divider} />
        <TextInput accessibilityLabel={placeholder} value={draft} onChangeText={setDraft} placeholder={placeholder} style={styles.placeholder}/>
        <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => { if (draft.trim()) { setThread([...thread, {from: 'me', text: draft.trim()}]); setDraft(''); } }}>
          <Send size={t.send} color={t.brand} fill={t.brand} strokeWidth={1.6} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.surface },
  screenAdv: { backgroundColor: t.white },
  header: { minHeight: t.headerH, paddingBottom: t.headerPadBottom, paddingHorizontal: t.headerPadX, flexDirection: 'row', alignItems: 'center', gap: t.backGap },
  headerClient: { backgroundColor: t.brand },
  headerAdv: { backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.rule },
  who: { flexDirection: 'row', alignItems: 'center', gap: t.nameGap },
  avatarOnBrand: { backgroundColor: t.avatarOnBrand },
  avatar: { backgroundColor: t.brand, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  online: { position: 'absolute', right: 0, bottom: t.onlineInset, width: t.onlineDot, height: t.onlineDot, borderRadius: t.onlineDot / 2, backgroundColor: t.online },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.badgeGap },
  thread: { paddingHorizontal: t.padX, paddingBottom: t.rowGap },
  pill: { minHeight: t.pillH, borderRadius: t.pillRadius, backgroundColor: t.validPill, paddingHorizontal: t.pillPadX, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.pillTop },
  pillText: { fontFamily: font.appBody, fontSize: t.pillSize, color: t.validInk },
  rowGap: { marginTop: t.rowGap },
  inRow: { flexDirection: 'row', alignItems: 'center', gap: t.msgAvatarGap },
  outRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  bubble: { maxWidth: t.bubbleMaxW, flexShrink: 1, borderRadius: t.bubbleRadius, backgroundColor: t.bubble, paddingHorizontal: t.bubblePadX, paddingVertical: t.bubblePadY },
  // design/183 draws every bubble the same width, with its time or tick tucked in.
  bubbleAdv: { width: t.bubbleMaxW },
  bubbleMeta: { paddingBottom: t.metaPadBottom },
  text: { fontFamily: font.appBody, fontSize: t.textSize, lineHeight: t.textLine, color: t.ink },
  time: { alignSelf: 'flex-end', marginTop: t.timeTop, lineHeight: t.timeLine, fontFamily: font.appBody, fontSize: t.timeSize, color: t.timeInk },
  tick: { alignSelf: 'flex-end', marginTop: t.timeTop, height: t.timeLine, justifyContent: 'center' },
  typing: { flexDirection: 'row', gap: t.typingGap, marginTop: t.typingTop },
  dot: { width: t.typingDot, height: t.typingDot, borderRadius: t.typingDot / 2, backgroundColor: t.dot },
  input: { marginHorizontal: t.padX, height: t.inputH, borderRadius: t.inputRadius, backgroundColor: t.white, paddingHorizontal: t.bubblePadX * 2, flexDirection: 'row', alignItems: 'center', gap: t.dividerGap, shadowColor: t.ink, shadowOpacity: t.shadowOpacity, shadowRadius: t.shadowRadius, shadowOffset: { width: 0, height: t.shadowY } },
  plus: { width: t.plus, height: t.plus, borderRadius: t.plus / 2, backgroundColor: t.brand, alignItems: 'center', justifyContent: 'center' },
  divider: { width: t.dividerW, height: t.dividerH, backgroundColor: t.brand },
  placeholder: { flex: 1, fontFamily: font.appBody, fontSize: t.placeholderSize, color: t.muted },
});

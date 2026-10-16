import { previewNotice } from '../../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import { BriefcaseBusiness, CheckCheck, ChevronLeft, CirclePlus, Folder, Gavel, Mic, Phone, SendHorizontal, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { DEMO_AUTO_ADVANCE } from '../../../constants/dev';
import { useDemoAdvance } from '../../../hooks/useDemoAdvance';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiMark } from '../../../components/AiFlowerMark';
import { advCourtChat as t, advWalletPalette as w, courierHeader as h, font, hcPalette as c, ink, status } from '../../../constants/theme';
import { useCourtService } from '../../../components/court/CourtKit';
import { COURT_CHAT } from '../../../data/advocateCourt';

// Advocate — chat with the client (design/365). Measured at 1.000 px/pt on a
// 2x upscale.
//
// REPORTED — the advocate-side mirror of the client's High Court chat
// (design/301, app/services/high-court/chat.tsx): same brown-out / white-in
// bubbles on the warm page. Built as its own screen, not shared code: 365
// draws a plain chevron, an initials avatar, a two-line matter bar with an id
// pill, a row of action chips, the AI mark and a +/mic composer, none of which
// 301 has. The action row overflows the export's right edge ("View Documents"
// is clipped); here it scrolls sideways so the label is never cut.
//
// ⚠ UNSCOPED — see COURT_CHAT: nothing is sent, nothing is called.

const ACTION_ICON = { phone: Phone, briefcase: BriefcaseBusiness, folder: Folder };

export default function AdvocateCourtChatScreen() {
  const { advance } = useDemoAdvance();
  const insets = useSafeAreaInsets();
  // District Court variant (?service=dc): the header's service and docket swap,
  // and its links keep the service param.
  const court = useCourtService();
  const d = court.swap(COURT_CHAT);
  const [draft, setDraft] = useState('');

  return (
    <View style={styles.screen}>
      <View style={[styles.hdr, { paddingTop: insets.top + t.hdrPadTop }]}>
        <View style={styles.hdrRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
            style={styles.back}
          >
            <ChevronLeft size={t.backIcon} color={h.ink} strokeWidth={2.2} />
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{d.initials}</Text>
            <View style={styles.online} />
          </View>
          <View style={styles.hdrText}>
            <Text style={styles.name}>{d.name}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{d.status}</Text>
            </View>
          </View>
          {/* Opens the call screen (369) — no call is placed. */}
          <Pressable accessibilityRole="button" accessibilityLabel="Call" onPress={() => router.push(court.href('/advocate/court/call' as Href))}>
            <Phone size={t.phoneIcon} color={h.ink} strokeWidth={1.9} style={styles.phone} />
          </Pressable>
          <View style={styles.me}>
            <UserRound size={h.avatarGlyph} color={ink.onBrand} strokeWidth={1.9} />
          </View>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.matter}>
          <View style={styles.matterTile}>
            <Gavel size={t.matterGlyph} color={c.inkWarm} strokeWidth={1.8} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.matterTitle}>{d.matter}</Text>
            <Text style={styles.matterSub}>{d.matterSub}</Text>
          </View>
          <View style={styles.idPill}>
            <View style={styles.idDot} />
            <Text style={styles.idText}>{d.matterId}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll} contentContainerStyle={styles.actions}>
          {d.actions.map((a) => {
            const I = ACTION_ICON[a.icon];
            const to = a.to;
            return (
              <Pressable
                key={a.label}
                accessibilityRole="button"
                onPress={to === undefined ? undefined : () => router.push(court.href(to))}
                style={styles.action}
              >
                <I size={t.actionIcon} color={c.ink} strokeWidth={1.9} />
                <Text style={styles.actionText}>{a.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.today}>
          <Text style={styles.todayText}>{d.today}</Text>
        </View>

        {d.messages.map((m, i) => {
          const me = m.from === 'me';
          return (
            <View key={i} style={i === 0 ? styles.msgFirst : styles.msg}>
              <View style={[styles.bubble, me ? styles.out : styles.in]}>
                <Text style={[styles.bubbleText, me && styles.outText]}>{m.text}</Text>
              </View>
              <View style={[styles.timeRow, me && styles.timeRowMe]}>
                <Text style={styles.time}>{m.time}</Text>
                {me ? <CheckCheck size={t.timeTick} color={status.active} strokeWidth={2.2} /> : null}
              </View>
            </View>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.aiLabel}
          onPress={() => router.push(court.href(d.copilot))}
          style={styles.ai}
        >
          <AiMark size={t.aiMark} />
        </Pressable>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        {/* ⚠ UNSCOPED — no attachment picker. */}
        <CirclePlus size={t.plusIcon} color={c.inkMuted} strokeWidth={1.8} />
        <View style={styles.input}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={d.placeholder}
            placeholderTextColor={c.inkMuted}
            style={styles.inputText}
          />
          {/* ⚠ UNSCOPED — no voice input. */}
          <Mic size={t.micIcon} color={c.inkMuted} strokeWidth={1.9} />
        </View>
        {/* Nothing is sent: demo mode moves on to the copilot (366); otherwise the preview notice. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => (DEMO_AUTO_ADVANCE ? advance() : previewNotice('Send'))} style={styles.send}>
          <SendHorizontal size={t.sendIcon} color={ink.onBrand} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  flex: { flex: 1, minWidth: 0 },

  hdr: { backgroundColor: h.bg },
  hdrRow: { height: t.hdrH, paddingLeft: t.hdrPadLeft, paddingRight: t.hdrPadRight, flexDirection: 'row', alignItems: 'center' },
  back: { marginRight: t.backGap },
  avatar: { width: t.avatar, height: t.avatar, borderRadius: t.avatar / 2, backgroundColor: w.tile, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarSize, color: c.brownInk },
  online: {
    position: 'absolute',
    right: t.onlineInset,
    bottom: t.onlineInset,
    width: t.onlineDot,
    height: t.onlineDot,
    borderRadius: t.onlineDot / 2,
    borderWidth: t.onlineBorder,
    borderColor: h.bg,
    backgroundColor: status.active,
  },
  hdrText: { flex: 1, minWidth: 0, marginLeft: t.avatarGap, marginTop: t.hdrTextTop },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, color: c.ink },
  statusRow: { marginTop: t.statusTop, flexDirection: 'row', alignItems: 'center', gap: t.statusGap },
  statusDot: { width: t.statusDot, height: t.statusDot, borderRadius: t.statusDot / 2, backgroundColor: status.active },
  statusText: { fontFamily: font.appSemi, fontSize: t.statusSize, color: c.greenInk },
  phone: { marginRight: t.phoneGap },
  me: { width: h.avatar, height: h.avatar, borderRadius: h.avatar / 2, backgroundColor: h.avatarBg, alignItems: 'center', justifyContent: 'center' },
  divider: { height: t.dividerH, backgroundColor: c.panel },

  list: { paddingHorizontal: t.padX, paddingBottom: t.listBottom },
  matter: {
    marginTop: t.matterTop,
    minHeight: t.matterH,
    borderRadius: t.matterRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.matterPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.matterGap,
  },
  matterTile: { width: t.matterTile, height: t.matterTile, borderRadius: t.matterTileRadius, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  matterTitle: { fontFamily: font.appSemi, fontSize: t.matterTitleSize, color: c.ink },
  matterSub: { marginTop: t.matterSubTop, fontFamily: font.appBody, fontSize: t.matterSubSize, color: c.inkWarm },
  idPill: { minHeight: t.idH, borderRadius: t.idH / 2, paddingHorizontal: t.idPadX, backgroundColor: c.panel, flexDirection: 'row', alignItems: 'center', gap: t.idGap },
  idDot: { width: t.idDot, height: t.idDot, borderRadius: t.idDot / 2, backgroundColor: c.avatarTan },
  idText: { fontFamily: font.appBody, fontSize: t.idSize, color: c.inkWarm },

  actionsScroll: { marginTop: t.actionsTop, marginHorizontal: -t.padX },
  actions: { paddingHorizontal: t.padX, gap: t.actionGap },
  action: {
    minHeight: t.actionH,
    borderRadius: t.actionH / 2,
    paddingHorizontal: t.actionPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.actionIconGap,
  },
  actionText: { fontFamily: font.appSemi, fontSize: t.actionSize, color: c.ink },

  today: { marginTop: t.todayTop, alignSelf: 'center', minHeight: t.todayH, borderRadius: t.todayRadius, paddingHorizontal: t.todayPadX, backgroundColor: c.helpGrey, justifyContent: 'center' },
  todayText: { fontFamily: font.appSemi, fontSize: t.todaySize, letterSpacing: t.todaySpacing, color: c.inkWarm },

  msgFirst: { marginTop: t.firstTop },
  msg: { marginTop: t.msgGap },
  bubble: { maxWidth: t.bubbleMax, borderRadius: t.bubbleRadius, paddingHorizontal: t.bubblePadX, paddingVertical: t.bubblePadY },
  out: { alignSelf: 'flex-end', backgroundColor: c.brown },
  in: { alignSelf: 'flex-start', backgroundColor: c.card },
  bubbleText: { fontFamily: font.appBody, fontSize: t.bubbleSize, lineHeight: t.bubbleLine, color: c.ink },
  outText: { color: ink.onBrand },
  timeRow: { marginTop: t.timeTop, flexDirection: 'row', alignItems: 'center', gap: t.tickGap, marginLeft: t.timeInset },
  timeRowMe: { alignSelf: 'flex-end', marginLeft: 0, marginRight: t.timeInset },
  time: { fontFamily: font.appBody, fontSize: t.timeSize, color: c.inkWarm },

  ai: { alignSelf: 'flex-end', marginTop: t.aiTop, marginRight: t.aiRight },

  bar: {
    backgroundColor: c.card,
    paddingTop: t.barPadTop,
    paddingHorizontal: t.barPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.barGap,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: t.inputH,
    borderRadius: t.inputH / 2,
    paddingHorizontal: t.inputPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: { flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: t.inputSize, color: c.ink },
  send: { width: t.send, height: t.send, borderRadius: t.send / 2, backgroundColor: c.brown, alignItems: 'center', justifyContent: 'center' },
});

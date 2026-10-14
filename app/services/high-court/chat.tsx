import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  CircleUserRound,
  Info,
  LockKeyhole,
  Paperclip,
  Phone,
  SendHorizontal,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { courierHeader as h, font, hcChat as t, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { HC_CHAT } from '../../../data/highCourt';

// High Court — advocate chat (design/301). Measured at 2.000 px/pt.
//
// ⚠ CROSS-SERVICE — opened from the District Court advocate screen (design/300).
//
// REPORTED — A FOURTH CHAT STYLING. Brown outgoing / white incoming bubbles on
// the warm page, with a header avatar and a matter bar. design/33 and 112 (grey),
// design/35 (support) and design/143 (messages) each draw the component
// differently; this is built as drawn, not merged into any of them.
//
// STATIC, NOT WIRED: the transcript is fixed, the composer accepts text but Send
// sends nothing, the call icon dials nothing and the attachment pin opens
// nothing. View List opens design/303 (Documents You Need).

export default function HighCourtChatScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_CHAT;
  const [draft, setDraft] = useState('');

  return (
    <View style={styles.screen}>
      <View style={[styles.hdr, { paddingTop: insets.top }]}>
        <View style={styles.hdrRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace('/services/district-court/advocate-assigned' as Href)
            }
            style={styles.back}
          >
            <ArrowLeft size={h.backIcon} color={h.ink} strokeWidth={2.2} />
          </Pressable>
          <View style={styles.hdrAvatar}>
            <CircleUserRound size={t.hdrAvatarGlyph} color={ink.onBrand} strokeWidth={1.7} />
            <View style={styles.online} />
          </View>
          <View style={styles.hdrText}>
            <Text style={styles.name} {...shrinkToFit(0.8)}>
              {d.name}
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText} {...shrinkToFit(0.75)}>
                {d.status}
              </Text>
            </View>
          </View>
          {/* Static — no call is placed. */}
          <Phone size={t.phoneIcon} color={h.ink} strokeWidth={1.9} style={styles.phone} />
          <View style={styles.me}>
            <UserRound size={h.avatarGlyph} color={ink.onBrand} strokeWidth={1.9} />
          </View>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.ctx}>
          <View style={styles.ctxTile}>
            <BriefcaseBusiness size={t.ctxGlyph} color={c.inkWarm} strokeWidth={1.8} />
          </View>
          <View style={styles.ctxText}>
            <Text style={styles.ctxTitle} {...shrinkToFit(0.8)}>
              {d.ctxTitle}
            </Text>
            <Text style={styles.ctxSub} {...shrinkToFit(0.75)}>
              {d.ctxType}
              <Text style={styles.ctxDot}>{'  •  '}</Text>
              {d.ctxId}
            </Text>
          </View>
          <View style={styles.ctxActive}>
            <Text style={styles.ctxActiveText}>{d.ctxActive}</Text>
          </View>
        </View>

        <View style={styles.today}>
          <Text style={styles.todayText}>{d.today}</Text>
        </View>
        <View style={styles.enc}>
          <LockKeyhole size={t.encIcon} color={c.inkWarm} strokeWidth={2.2} />
          <Text style={styles.encText}>{d.enc}</Text>
        </View>

        {d.messages.map((m, i) => {
          const me = m.from === 'me';
          return (
            <View key={i} style={[styles.msg, i === 0 && styles.msgFirst]}>
              <View style={[styles.bubble, me ? styles.out : styles.in]}>
                <Text style={[styles.bubbleText, me && styles.outText]}>{m.text}</Text>
              </View>
              <View style={[styles.timeRow, me && styles.timeRowMe]}>
                <Text style={styles.time}>{m.time}</Text>
                {me && <CheckCheck size={t.timeTick} color={status.active} strokeWidth={2.2} />}
              </View>
            </View>
          );
        })}

        <View style={styles.card}>
          <View style={styles.between}>
            <View style={styles.tag}>
              <BadgeCheck size={t.tagIcon} color={c.brownInk} strokeWidth={2} />
              <Text style={styles.tagText} {...shrinkToFit(0.75)}>
                {d.cardTag}
              </Text>
            </View>
            <Text style={styles.cardTime}>{d.cardTime}</Text>
          </View>
          <Text style={styles.cardTitle}>{d.cardTitle}</Text>
          <Text style={styles.cardSub}>{d.cardSub}</Text>

          <View style={styles.rows}>
            {d.docs.map((doc) => (
              <View key={doc.name} style={styles.row}>
                <View style={[styles.disc, doc.required ? styles.discOn : styles.discOff]}>
                  <Check
                    size={t.rowGlyph}
                    color={doc.required ? ink.onBrand : c.ink}
                    strokeWidth={doc.required ? 3 : 2.2}
                  />
                </View>
                <Text style={styles.rowText} {...shrinkToFit(0.75)}>
                  {doc.name}
                </Text>
                <View style={[styles.pill, doc.required ? styles.pillReq : styles.pillOpt]}>
                  <Text style={[styles.pillText, !doc.required && styles.pillTextOpt]}>
                    {doc.required ? d.required : d.optional}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.note}>
            <View style={styles.noteHead}>
              <Info size={t.noteIcon} color={c.brownInk} strokeWidth={2} />
              <Text style={styles.noteLabel}>{d.noteLabel}</Text>
            </View>
            <Text style={styles.noteText}>{d.note}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services/high-court/documents-needed' as Href)}
            style={styles.btn}
          >
            <Text style={styles.btnText}>{d.cta}</Text>
            <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
        <View style={styles.barRow}>
          {/* Inert — no attachment picker. */}
          <Paperclip size={t.attachIcon} color={c.ink} strokeWidth={1.9} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={d.placeholder}
            placeholderTextColor={c.inkMuted}
            style={styles.input}
          />
          {/* Inert — nothing is sent. */}
          <View style={styles.send}>
            <SendHorizontal size={t.sendIcon} color={ink.onBrand} strokeWidth={2} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.ctxGap },

  hdr: { backgroundColor: h.bg },
  hdrRow: {
    height: t.hdrH,
    paddingLeft: h.padX,
    paddingRight: t.hdrPadRight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: { marginLeft: t.backInset, marginRight: t.hdrBackGap },
  hdrAvatar: {
    width: t.hdrAvatar,
    height: t.hdrAvatar,
    borderRadius: t.hdrAvatar / 2,
    backgroundColor: c.avatarTan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  online: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: t.onlineDot,
    height: t.onlineDot,
    borderRadius: t.onlineDot / 2,
    borderWidth: t.onlineBorder,
    borderColor: h.bg,
    backgroundColor: status.active,
  },
  hdrText: { flex: 1, minWidth: 0, marginLeft: t.hdrAvatarGap },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, color: c.ink },
  statusRow: { marginTop: t.statusTop, flexDirection: 'row', alignItems: 'center', gap: t.statusGap },
  statusDot: { width: t.statusDot, height: t.statusDot, borderRadius: t.statusDot / 2, backgroundColor: status.active },
  statusText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.statusSize, color: c.greenInk },
  phone: { marginLeft: t.ctxGap, marginRight: t.phoneGap },
  me: {
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: h.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: h.divider },

  list: { paddingLeft: t.listLeft, paddingRight: t.listRight, paddingBottom: t.listBottom },
  ctx: {
    ...shadow,
    marginTop: t.ctxTop,
    minHeight: t.ctxH,
    borderRadius: t.ctxRadius,
    backgroundColor: c.card,
    paddingLeft: t.ctxPad,
    paddingRight: t.ctxPadRight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctxTile: {
    width: t.ctxTile,
    height: t.ctxTile,
    borderRadius: t.ctxTileRadius,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctxText: { flex: 1, minWidth: 0, marginLeft: t.ctxGap },
  ctxTitle: { fontFamily: font.appSemi, fontSize: t.ctxTitleSize, color: c.ink },
  ctxSub: { fontFamily: font.appBody, fontSize: t.ctxSubSize, letterSpacing: t.ctxSubSpacing, color: c.inkWarm },
  ctxDot: { color: c.tagMuted },
  ctxActive: {
    height: t.ctxActiveH,
    borderRadius: t.ctxActiveRadius,
    paddingHorizontal: t.ctxActivePadX,
    backgroundColor: c.panel,
    justifyContent: 'center',
  },
  ctxActiveText: { fontFamily: font.appSemi, fontSize: t.ctxActiveSize, color: c.inkWarm },

  today: {
    marginTop: t.todayTop,
    alignSelf: 'center',
    height: t.todayH,
    borderRadius: t.todayH / 2,
    paddingHorizontal: t.todayPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  todayText: { fontFamily: font.appSemi, fontSize: t.todaySize, color: c.inkWarm },
  enc: {
    marginTop: t.encTop,
    marginHorizontal: t.encInset,
    minHeight: t.encH,
    borderRadius: t.encRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.encPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  encText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.encSize,
    lineHeight: t.encLineHeight,
    color: c.inkWarm,
  },

  msg: { marginTop: t.msgGap },
  msgFirst: { marginTop: t.firstTop },
  bubble: { borderRadius: t.bubbleRadius, paddingVertical: t.bubblePadY },
  out: { alignSelf: 'flex-end', maxWidth: t.bubbleOutMax, paddingHorizontal: t.bubbleOutPadX, backgroundColor: c.brown },
  in: { alignSelf: 'flex-start', maxWidth: t.bubbleInMax, paddingHorizontal: t.bubbleInPadX, backgroundColor: c.card },
  bubbleText: { fontFamily: font.appBody, fontSize: t.bubbleSize, lineHeight: t.bubbleLineHeight, color: c.ink },
  outText: { color: ink.onBrand },
  timeRow: { marginTop: t.timeTop, flexDirection: 'row', alignItems: 'center', gap: t.timeTickGap },
  timeRowMe: { alignSelf: 'flex-end', marginRight: t.timeRight },
  time: { fontFamily: font.appSemi, fontSize: t.timeSize, lineHeight: t.timeLineHeight, color: c.inkWarm },

  card: {
    ...shadow,
    marginTop: t.cardTop,
    marginRight: t.cardRight,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  tag: {
    flexShrink: 1,
    height: t.tagH,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.tagGap,
  },
  tagText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.tagSize, letterSpacing: t.tagSpacing, color: c.brownInk },
  cardTime: { fontFamily: font.appSemi, fontSize: t.cardTimeSize, color: c.inkWarm },
  cardTitle: {
    marginTop: t.cardTitleTop,
    fontFamily: font.appSemi,
    fontSize: t.cardTitleSize,
    lineHeight: t.cardTitleLineHeight,
    color: c.ink,
  },
  cardSub: { fontFamily: font.appBody, fontSize: t.cardSubSize, lineHeight: t.cardSubLineHeight, color: c.inkWarm },
  rows: { marginTop: t.rowsTop, gap: t.rowGap },
  row: {
    minHeight: t.rowH,
    borderRadius: t.rowRadius,
    backgroundColor: c.panel,
    paddingLeft: t.rowPadL,
    paddingRight: t.rowPadR,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disc: { width: t.rowDisc, height: t.rowDisc, borderRadius: t.rowDisc / 2, alignItems: 'center', justifyContent: 'center' },
  discOn: { backgroundColor: status.active },
  discOff: { backgroundColor: c.radioGrey },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.rowGap2, marginRight: t.rowTextRight, fontFamily: font.appSemi, fontSize: t.rowSize, color: c.ink },
  pill: { height: t.pillH, borderRadius: t.pillRadius, paddingHorizontal: t.pillPadX, justifyContent: 'center' },
  pillReq: { backgroundColor: c.brown },
  pillOpt: { backgroundColor: c.radioGrey },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: ink.onBrand },
  pillTextOpt: { color: c.inkWarm },
  note: { marginTop: t.noteTop, borderRadius: t.noteRadius, backgroundColor: c.tileGrey, padding: t.notePad },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: t.noteGap },
  noteLabel: { fontFamily: font.appSemi, fontSize: t.noteLabelSize, lineHeight: t.noteLabelLineHeight, color: c.brownInk },
  noteText: {
    marginLeft: t.noteIcon + t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: c.ink,
  },
  btn: {
    marginTop: t.btnTop,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },

  bar: { backgroundColor: c.card },
  barRow: { height: t.barH, paddingHorizontal: t.barPadX, flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    minWidth: 0,
    height: t.inputH,
    marginLeft: t.attachGap,
    borderRadius: t.inputRadius,
    paddingHorizontal: t.inputPadX,
    backgroundColor: c.panel,
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: c.ink,
  },
  send: {
    marginLeft: t.sendGap,
    width: t.send,
    height: t.send,
    borderRadius: t.send / 2,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

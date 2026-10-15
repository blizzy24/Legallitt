import DemoPressable from '../../../../components/DemoPressable';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowUp,
  BadgeCheck,
  CheckCheck,
  Eye,
  FileText,
  FolderClosed,
  Gavel,
  Lock,
  Mic,
  Paperclip,
  PhoneOff,
  Plus,
  Sparkles,
  SquarePen,
  Timer,
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

import AiFlowerMark from '../../../../components/AiFlowerMark';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_CHAT } from '../../../../data/advocateSide';
import { advChat as t, colors, font, ink } from '../../../../constants/theme';
import { advDocHref } from '../../../../data/docLinks';

// Consultation chat (designs 168, 169 and 172).
//
// The transcript is static. Typing shows the send state (design/169) and sending
// appends the advocate's message locally — nothing is transmitted and no reply is
// produced. The Private Notes chip toggles design/172's panel.
//
// End call opens design/179. The attach button, matter chip, mic and the file
// row's eye are inert — none has a designed destination.
//
// design/168 clips the matter chip to the single letter "M"; the label here is an
// inference. See the notes in data/advocateSide.ts.

/** Splits an advocate paragraph into plain and {emphasised} legal-term spans. */
function spans(text: string) {
  return text.split(/(\{[^}]*\})/).filter(Boolean).map((part, i) =>
    part.startsWith('{') ? (
      <Text key={i} style={styles.term}>
        {part.slice(1, -1)}
      </Text>
    ) : (
      <Text key={i}>{part}</Text>
    ),
  );
}

export default function AdvocateChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = ADV_CHAT;
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<{ id: string; text: string; time: string }[]>([]);
  const [notesOpen, setNotesOpen] = useState(false);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    setSent((s) => [
      ...s,
      {
        id: `s${s.length}`,
        text,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      },
    ]);
    setDraft('');
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.headerWrap, { paddingTop: insets.top + t.headerTop }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Placeholder for design/168's photograph, at the drawn size. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{c.client.initials}</Text>
            </View>
            <View style={styles.headerText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.7)}>
                  {c.client.name}
                </Text>
                <BadgeCheck size={t.tickIcon} color={colors.textPrimary} style={styles.tick} />
              </View>
              <View style={styles.subRow}>
                <Text style={styles.company} {...shrinkToFit(0.7)}>
                  {c.client.company}
                </Text>
                <View style={styles.encDot} />
                <Text style={styles.enc} {...shrinkToFit(0.75)}>
                  {c.encrypted}
                </Text>
              </View>
            </View>
            <View style={styles.timer}>
              <Timer size={t.timerIcon} color={colors.textPrimary} />
              <Text style={styles.timerText} {...shrinkToFit(0.8)}>
                {c.timer}
              </Text>
            </View>
            {/* Opens design/179's End Consultation confirmation, as video's End call does. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="End call"
              onPress={() => router.push(`/advocate/consultation/${id}/end` as Href)}
              style={styles.endBtn}
            >
              <PhoneOff size={t.endBtnIcon} color={t.endBtnColour} />
            </Pressable>
          </View>

          <View style={styles.tools}>
            <Pressable accessibilityRole="button" style={styles.matterChip}>
              <FolderClosed size={t.matterIcon} color={colors.textPrimary} />
              <Text style={styles.matterText} {...shrinkToFit(0.75)}>
                {c.matterChip}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: notesOpen }}
              onPress={() => setNotesOpen((v) => !v)}
              style={styles.tool}
            >
              <SquarePen size={t.toolIcon} color={colors.brandDark} />
              <Text style={styles.toolText} {...shrinkToFit(0.75)}>
                {c.notesChip}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{c.notesCount}</Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/advocate/ai' as Href)}
              style={styles.tool}
            >
              <Sparkles size={t.toolIcon} color={colors.brandDark} />
              <Text style={styles.toolText} {...shrinkToFit(0.75)}>
                {c.aiChip}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ctx}>
          <Gavel size={t.ctxIcon} color={colors.textBody} />
          <Text style={styles.ctxText} {...shrinkToFit(0.7)}>
            {c.context}
          </Text>
        </View>

        {c.messages.map((m) =>
          m.from === 'client' ? (
            <View key={m.id} style={styles.clientRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{c.client.initials}</Text>
              </View>
              <View style={styles.clientCol}>
                <View style={styles.clientBubble}>
                  {m.sender && (
                    <Text style={styles.sender} {...shrinkToFit(0.75)}>
                      {m.sender}
                    </Text>
                  )}
                  <Text style={styles.msg}>{m.text}</Text>
                  {m.file && (
                    <View style={styles.file}>
                      <View style={styles.fileIcon}>
                        <FileText size={t.fileIconGlyph} color="#D64545" />
                      </View>
                      <View style={styles.fileText}>
                        <Text style={styles.fileName} {...shrinkToFit(0.7)}>
                          {m.file.name}
                        </Text>
                        <Text style={styles.fileMeta} {...shrinkToFit(0.75)}>
                          {m.file.meta}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`View ${m.file.name}`}
                        onPress={() => router.push(advDocHref(m.file!.name) as Href)}
                        style={styles.fileEye}
                      >
                        <Eye size={t.fileEyeIcon} color={colors.textPrimary} />
                      </Pressable>
                    </View>
                  )}
                </View>
                <Text style={styles.time}>{m.time}</Text>
              </View>
            </View>
          ) : (
            <View key={m.id} style={styles.advRow}>
              <View style={styles.advBubble}>
                {m.paragraphs.map((p, i) => (
                  <Text key={p} style={[styles.msg, i > 0 && styles.para]}>
                    {spans(p)}
                  </Text>
                ))}
              </View>
              <View style={styles.advTimeRow}>
                <Text style={styles.time}>{m.time}</Text>
                <CheckCheck size={t.tickSmall} color={t.encColour} style={styles.tickSmall} />
              </View>
            </View>
          ),
        )}

        {sent.map((m) => (
          <View key={m.id} style={styles.advRow}>
            <View style={styles.advBubble}>
              <Text style={styles.msg}>{m.text}</Text>
            </View>
            <View style={styles.advTimeRow}>
              <Text style={styles.time}>{m.time}</Text>
              <CheckCheck size={t.tickSmall} color={t.encColour} style={styles.tickSmall} />
            </View>
          </View>
        ))}

        <View style={styles.typing}>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.typingDot, i > 0 && styles.typingDotNext]} />
            ))}
          </View>
          <Text style={styles.typingText} {...shrinkToFit(0.75)}>
            {c.typing}
          </Text>
        </View>

        <View style={styles.flower}>
          <AiFlowerMark size={t.flower} />
        </View>
      </ScrollView>

      {notesOpen && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle} {...shrinkToFit(0.8)}>
            {c.notesPanel.title}
          </Text>
          <View style={styles.panelPriv}>
            <Lock size={t.panelPrivIcon} color={colors.brandDark} />
            <Text style={styles.panelPrivText} {...shrinkToFit(0.8)}>
              {c.notesPanel.privacy}
            </Text>
          </View>
          <ScrollView style={styles.panelList} nestedScrollEnabled>
            {c.notesPanel.entries.map((n, i) => (
              <View key={n.id} style={[styles.noteCard, i > 0 && styles.noteCardNext]}>
                <Text style={styles.noteAt} {...shrinkToFit(0.75)}>
                  {n.at}
                </Text>
                <Text style={styles.noteBody}>{n.body}</Text>
              </View>
            ))}
          </ScrollView>
          {/* Inert — Add Note has no designed destination. */}
          <Pressable accessibilityRole="button" style={styles.add}>
            <Plus size={t.addIcon} color={ink.onBrand} />
            <Text style={styles.addText} {...shrinkToFit(0.8)}>
              {c.notesPanel.add}
            </Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.composer, { paddingBottom: insets.bottom + t.composerPadY }]}>
        {/* Inert — no upload flow is designed anywhere in the app. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Attach" style={styles.attach}>
          <Paperclip size={t.composerBtnIcon} color={colors.textPrimary} />
        </Pressable>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={c.placeholder}
          placeholderTextColor={colors.textBody}
          multiline
          onSubmitEditing={send}
        />
        {draft.trim() ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            onPress={send}
            style={styles.send}
          >
            <ArrowUp size={t.composerBtnIcon} color={ink.onBrand} />
          </Pressable>
        ) : (
          <DemoPressable accessibilityRole="button" accessibilityLabel="Voice note" style={styles.send}>
            <Mic size={t.composerBtnIcon} color={ink.onBrand} />
          </DemoPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  headerWrap: { paddingHorizontal: t.padX, backgroundColor: t.bg },
  header: {
    borderRadius: t.headerRadius,
    backgroundColor: t.headerBg,
    padding: t.headerPad,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  tick: { marginLeft: t.tickGap },
  subRow: { marginTop: t.companyGap, flexDirection: 'row', alignItems: 'center' },
  company: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.companySize, color: colors.textBody },
  encDot: {
    width: t.encDot,
    height: t.encDot,
    borderRadius: t.encDot / 2,
    marginHorizontal: t.encDotGap,
    backgroundColor: t.encColour,
  },
  enc: { fontFamily: font.appSemi, fontSize: t.encSize, color: t.encColour },
  timer: {
    minHeight: t.timerHeight,
    borderRadius: t.timerRadius,
    paddingHorizontal: t.timerPadX,
    backgroundColor: t.timerBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: { marginLeft: t.timerIconGap, fontFamily: font.appSemi, fontSize: t.timerSize, color: colors.textPrimary },
  endBtn: {
    marginLeft: 6,
    width: t.endBtn,
    height: t.endBtn,
    borderRadius: t.endBtn / 2,
    backgroundColor: t.endBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tools: { marginTop: t.toolGap, flexDirection: 'row', alignItems: 'center', gap: t.toolGapX },
  matterChip: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  matterText: {
    marginLeft: t.matterIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.toolSize,
    color: colors.textPrimary,
  },
  tool: {
    minHeight: t.toolHeight,
    borderRadius: t.toolRadius,
    paddingHorizontal: t.toolPadX,
    backgroundColor: t.toolBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  toolText: {
    marginLeft: t.toolIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.toolSize,
    color: colors.brandDark,
  },
  badge: {
    marginLeft: t.badgeGap,
    minWidth: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    paddingHorizontal: 5,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: font.appSemi, fontSize: t.badgeSize, color: ink.onBrand },

  content: { paddingHorizontal: t.padX, paddingTop: t.ctxGap, paddingBottom: 20 },
  ctx: {
    alignSelf: 'center',
    maxWidth: '100%',
    minHeight: t.ctxHeight,
    borderRadius: t.ctxRadius,
    paddingHorizontal: t.ctxPadX,
    backgroundColor: t.ctxBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctxText: {
    marginLeft: t.ctxIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.ctxSize,
    color: colors.textPrimary,
  },

  clientRow: { marginTop: t.msgGap, flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarText, color: colors.brandDark },
  clientCol: { marginLeft: t.avatarGap, flex: 1, minWidth: 0, alignItems: 'flex-start' },
  clientBubble: {
    maxWidth: t.bubbleMaxW,
    borderRadius: t.bubbleRadius,
    backgroundColor: t.clientBubbleBg,
    padding: t.bubblePad,
  },
  sender: { marginBottom: t.senderGap, fontFamily: font.appBody, fontSize: t.senderSize, color: colors.textBody },
  msg: {
    fontFamily: font.appBody,
    fontSize: t.msgSize,
    lineHeight: t.msgLineHeight,
    color: colors.textPrimary,
  },
  para: { marginTop: t.paraGap },
  term: { color: t.termColour },

  advRow: { marginTop: t.msgGap, alignItems: 'flex-end' },
  advBubble: {
    maxWidth: t.bubbleMaxW,
    borderRadius: t.bubbleRadius,
    backgroundColor: t.advBubbleBg,
    padding: t.bubblePad,
  },
  advTimeRow: { flexDirection: 'row', alignItems: 'center' },
  time: { marginTop: t.timeGap, fontFamily: font.appBody, fontSize: t.timeSize, color: colors.textBody },
  tickSmall: { marginTop: t.timeGap, marginLeft: t.tickSmallGap },

  file: {
    marginTop: t.fileGap,
    borderRadius: t.fileRadius,
    backgroundColor: t.fileBg,
    padding: t.filePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: t.fileIcon,
    height: t.fileIcon,
    borderRadius: t.fileIconRadius,
    backgroundColor: t.fileIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.fileIconGap, marginRight: 8 },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appBody, fontSize: t.fileMetaSize, color: colors.textBody },
  fileEye: {
    width: t.fileEye,
    height: t.fileEye,
    borderRadius: t.fileEye / 2,
    backgroundColor: t.fileEyeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  typing: {
    marginTop: t.typingGap,
    alignSelf: 'flex-start',
    marginLeft: t.avatar + t.avatarGap,
    minHeight: t.typingHeight,
    borderRadius: t.typingRadius,
    paddingHorizontal: t.typingPadX,
    backgroundColor: t.typingBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: { flexDirection: 'row' },
  typingDot: {
    width: t.typingDot,
    height: t.typingDot,
    borderRadius: t.typingDot / 2,
    backgroundColor: '#9A948B',
  },
  typingDotNext: { marginLeft: t.typingDotGap },
  typingText: {
    marginLeft: t.typingTextGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.typingSize,
    color: colors.textPrimary,
  },
  flower: { marginTop: t.flowerGap, alignItems: 'flex-end' },

  panel: {
    borderTopLeftRadius: t.panelRadius,
    borderTopRightRadius: t.panelRadius,
    borderWidth: 1,
    borderColor: t.panelBorder,
    backgroundColor: t.panelBg,
    paddingHorizontal: t.panelPadX,
    paddingTop: t.panelPadTop,
    paddingBottom: t.panelPadBottom,
  },
  panelTitle: { fontFamily: font.appHeading, fontSize: t.panelTitleSize, color: colors.brandDark },
  panelPriv: { marginTop: t.panelPrivGap, flexDirection: 'row', alignItems: 'center' },
  panelPrivText: {
    marginLeft: t.panelPrivIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.panelPrivSize,
    color: colors.brandDark,
  },
  panelList: { marginTop: t.panelListGap, maxHeight: t.panelListMaxH },
  noteCard: {
    borderRadius: t.noteCardRadius,
    borderWidth: 1,
    borderColor: t.noteCardBorder,
    backgroundColor: t.noteCardBg,
    padding: t.noteCardPad,
  },
  noteCardNext: { marginTop: t.noteCardGap },
  noteAt: { fontFamily: font.appHeading, fontSize: t.noteAtSize, color: colors.brandDark },
  noteBody: {
    marginTop: t.noteBodyGap,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLineHeight,
    color: colors.brandDark,
  },
  add: {
    marginTop: t.addGap,
    minHeight: t.addHeight,
    borderRadius: t.addRadius,
    backgroundColor: t.addBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { marginLeft: t.addIconGap, fontFamily: font.appHeading, fontSize: t.addSize, color: ink.onBrand },

  composer: {
    paddingHorizontal: t.composerPadX,
    paddingTop: t.composerPadY,
    backgroundColor: t.composerBg,
    borderTopWidth: 1,
    borderTopColor: t.composerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attach: {
    width: t.composerBtn,
    height: t.composerBtn,
    borderRadius: t.composerBtn / 2,
    backgroundColor: t.attachBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: t.inputGap,
    minHeight: t.inputMinHeight,
    maxHeight: 96,
    borderRadius: t.inputRadius,
    paddingHorizontal: t.inputPadX,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: t.inputBg,
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  send: {
    width: t.composerBtn,
    height: t.composerBtn,
    borderRadius: t.composerBtn / 2,
    backgroundColor: t.sendBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

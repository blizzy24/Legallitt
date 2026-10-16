import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  AudioLines,
  BadgeCheck,
  Bell,
  Camera,
  Clock,
  FolderClosed,
  Lock,
  Maximize,
  Mic,
  Paperclip,
  Phone,
  ShieldCheck,
  SquarePen,
  SwitchCamera,
  UserRound,
  Video as VideoIcon,
  Volume2,
  Wifi,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiMark } from '../../../../components/AiFlowerMark';
import LegalAiCopilotPanel from '../../../../components/LegalAiCopilotPanel';
import NoteLinesIcon from '../../../../components/NoteLinesIcon';
import { DEV_PREVIEW_TOGGLES } from '../../../../constants/dev';
import { shrinkToFit, shrinkToOneLine } from '../../../../constants/textFit';
import { ADV_VIDEO } from '../../../../data/advocateSide';
import {
  advRequest as h,
  advVideo as t,
  colors,
  font,
  ink,
  vkycDark,
} from '../../../../constants/theme';

// Video consultation — one screen, four panel states (designs 173, 174, 177, 178).
//
// ⚠ STATIC MOCK-UP. No calling SDK, no camera, no media. Both "feeds" are neutral
// blocks (vkycDark.feed) sized to the frames in the designs.
//
// ⚠ A real version needs a calling vendor AND, beyond that: a waiting room,
// pause/resume that excludes phone-call time from the billed duration, identity
// verification overlays, in-call note taking and the in-call AI copilot. Each is a
// vendor capability or a state machine, not a layout.
//
// States: base (design/173), fullscreen (design/174, which also moves the matter
// row BELOW the panel), notes (design/177) and copilot (design/178 / design/182).
// The notes and copilot panels are toggled from the matter row's Note chip and the
// AI mark on the feed; the AI mark appears only in fullscreen, as in design/174.
//
// Every control is inert except fullscreen, the two panels, the mode toggle and
// End call. design/173 clips the client's location line and the matter name behind
// the controls that overlap them, and design/174 clips the matter name behind the
// Note chip; all are laid out to fit here.
//
// design/174 draws the same corner-bracket glyph on the fullscreen button in both
// states (no "exit fullscreen" glyph), and a plain handset for End call.

function clock(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AdvocateVideoScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const v = ADV_VIDEO;
  const [seconds, setSeconds] = useState(v.remainingSeconds);
  const [mode, setMode] = useState(v.modes[0]);
  const [fullscreen, setFullscreen] = useState(false);
  const [panel, setPanel] = useState<'none' | 'notes' | 'ai'>('none');

  // designs 174, 177 and 178 all draw the feed edge-to-edge with the identity row
  // gone, so opening either panel implies the fullscreen variant.
  const immersive = fullscreen || panel !== 'none';

  useEffect(() => {
    if (seconds <= 0) return;
    const tick = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [seconds]);

  const matterRow = (
    <View style={[styles.matter, immersive && styles.matterFull]}>
      <FolderClosed size={t.matterIcon} color={colors.brandDark} />
      <Text style={styles.matterLabel} {...shrinkToFit(0.75)}>
        {v.matterLabel}
      </Text>
      <Text style={styles.matterDot}>•</Text>
      <Text style={styles.matterText} {...shrinkToFit(0.65)}>
        {v.matter}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: panel === 'notes' }}
        onPress={() => setPanel((p) => (p === 'notes' ? 'none' : 'notes'))}
        style={styles.noteChip}
      >
        <NoteLinesIcon size={t.noteIcon} color={colors.brandDark} />
        <Text style={styles.noteChipText} {...shrinkToFit(0.8)}>
          {v.noteChip}
        </Text>
      </Pressable>
      <View style={styles.attachChip}>
        <Paperclip size={t.attachIcon} color={colors.textPrimary} />
        <Text style={styles.attachText}>{v.attachmentCount}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, immersive && styles.screenFull]}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Text style={styles.headerTitle} {...shrinkToFit(0.8)}>
          Requests
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/advocate/notifications')}
          style={styles.bellWrap}
        >
          <Bell size={h.bell} color={colors.textPrimary} />
          <View style={styles.bellDot} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={h.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <View style={styles.status}>
        <View style={styles.enc}>
          <View style={styles.encDot} />
          <Lock size={t.encIcon} color={colors.textPrimary} />
          <Text style={styles.encText} {...shrinkToFit(0.8)}>
            {v.encrypted}
          </Text>
        </View>
        <View style={styles.cd}>
          <Clock size={t.cdIcon} color={colors.brandDark} />
          <Text style={styles.cdText} {...shrinkToFit(0.8)}>
            {clock(Math.max(seconds, 0))}
          </Text>
          <Text style={styles.cdSuffix} {...shrinkToFit(0.8)}>
            {v.remainingSuffix}
          </Text>
        </View>
      </View>

      {!immersive && (
        <>
          <View style={styles.idRow}>
            <View style={styles.idText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.7)}>
                  {v.client.name}
                </Text>
                <BadgeCheck size={t.nameTick} color={t.nameTickColour} style={styles.nameTick} />
              </View>
              {/* design/173 clips this line behind the toggle. Shrunk to one line
                  instead (native), so the row keeps its drawn height; the full line
                  needs ~0.69× at 13.5pt. react-native-web ignores
                  adjustsFontSizeToFit, so on web it wraps to two lines. */}
              <Text style={styles.company} {...shrinkToOneLine(0.65)}>
                {v.client.company} • {v.client.location}
              </Text>
            </View>
            <View style={styles.toggle}>
              {v.modes.map((m) => (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityState={{ selected: mode === m }}
                  onPress={() => setMode(m)}
                  style={[styles.toggleItem, mode === m && styles.toggleItemOn]}
                >
                  {m === 'Video' ? (
                    <VideoIcon size={t.toggleIcon} color={mode === m ? t.toggleOnIcon : t.toggleOffColour} />
                  ) : (
                    <Mic size={t.toggleIcon} color={mode === m ? t.toggleOnIcon : t.toggleOffColour} />
                  )}
                  <Text style={[styles.toggleText, mode !== m && styles.toggleTextOff]} {...shrinkToFit(0.8)}>
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {matterRow}
        </>
      )}

      <View style={[styles.panel, immersive && styles.panelFull]}>
        {/* Neutral placeholder — there is no camera and no feed. */}
        <View style={styles.feed} />

        <View style={styles.conn}>
          <Wifi size={t.connIcon} color={t.speakColour} />
          <Text style={styles.connText} {...shrinkToFit(0.8)}>
            {v.connection}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={immersive ? 'Exit fullscreen' : 'Fullscreen'}
          onPress={() => {
            setPanel('none');
            setFullscreen((f) => !f);
          }}
          style={styles.fsBtn}
        >
          <Maximize size={t.fsIcon} color={vkycDark.text} />
        </Pressable>

        <View style={[styles.self, immersive && styles.selfFull]}>
          {/* Neutral placeholder — the advocate's self-view is not a real feed. */}
          <View style={styles.selfFeed} />
          <View style={styles.flipBadge}>
            <SwitchCamera size={t.flipIcon} color={vkycDark.text} />
          </View>
          <View style={styles.selfLabel}>
            <Text style={styles.selfLabelText} {...shrinkToFit(0.75)}>
              {v.selfLabel}
            </Text>
          </View>
        </View>

        {/* design/173 sets the chips side by side; design/174 stacks them; design/177's
            notes sheet covers them and the AI mark, and so does design/178's copilot
            sheet (checked against 178-adv-video-ai.png; 182-ai-copilot-panel.png is
            the panel alone and draws no feed). */}
        {panel === 'none' && (
        <View style={[styles.panelBottom, immersive && styles.panelBottomFull]}>
          <View style={styles.speak}>
            <AudioLines size={t.speakIcon} color={t.speakColour} />
            <Text style={styles.speakText} {...shrinkToFit(0.7)}>
              {v.speaking}
            </Text>
          </View>
          <View style={styles.verify}>
            <ShieldCheck size={t.verifyIcon} color={t.verifyColour} />
            <Text style={styles.verifyText}>{v.verified}</Text>
          </View>
        </View>
        )}

        {/* design/173 (and its re-export, 12.jpeg) draws no AI mark on the base
            panel; design/174 draws it in fullscreen. So the copilot opens from
            fullscreen only. design/178 draws no mark once the copilot is open —
            the sheet's own X closes it. */}
        {immersive && panel === 'none' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Legal AI copilot"
          accessibilityState={{ expanded: false }}
          onPress={() => setPanel('ai')}
          style={styles.aiMark}
        >
          <AiMark size={t.aiMark} />
        </Pressable>
        )}
      </View>

      {fullscreen && panel === 'none' && matterRow}

      {/* design/173 leaves the space between the fixed panel and the controls empty. */}
      {!immersive && <View style={styles.spacer} />}

      {panel === 'notes' && (
        <View style={styles.notesSheet}>
          {matterRow}
          <View style={styles.notesPanel}>
            <View style={styles.notesBox}>
              <ScrollView style={styles.notesList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                <View style={styles.notesRow}>
                  <Text style={styles.notesBullet}>•</Text>
                  <Text style={styles.notesText}>{v.note}</Text>
                </View>
              </ScrollView>
              {/* design/177's drawn scroll track. Static: the thumb sits at the top as
                  drawn, and the note fits without scrolling. */}
              <View style={styles.notesTrack} pointerEvents="none">
                <View style={styles.notesThumb} />
              </View>
            </View>
            {/* Inert — Edit has no designed destination. */}
            <Pressable onPress={() => previewNotice(v.notesEdit)} accessibilityRole="button" style={styles.notesEdit}>
              <SquarePen size={t.notesEditIcon} color={colors.textPrimary} />
              <Text style={styles.notesEditText} {...shrinkToFit(0.8)}>
                {v.notesEdit}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {panel === 'ai' && <LegalAiCopilotPanel onClose={() => setPanel('none')} />}

      {/* design/178 covers the control row with the copilot panel. */}
      {panel !== 'ai' && (
      <View style={[styles.controls, { marginBottom: insets.bottom + t.controlsBottom }]}>
        {/* All inert — there is no camera, microphone or audio route to control. */}
        <Pressable onPress={() => previewNotice("Camera")} accessibilityRole="button" accessibilityLabel="Camera" style={styles.ctrl}>
          <Camera size={t.ctrlIcon} color={t.ctrlIconColour} />
        </Pressable>
        <Pressable onPress={() => previewNotice("Microphone")} accessibilityRole="button" accessibilityLabel="Microphone" style={styles.ctrl}>
          <Mic size={t.ctrlIcon} color={t.ctrlIconColour} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End call"
          onPress={() => router.push(`/advocate/consultation/${id}/end` as Href)}
          style={styles.end}
        >
          <View style={styles.endGlyph}>
            <Phone size={t.endIcon} color={ink.onBrand} />
          </View>
        </Pressable>
        <Pressable onPress={() => previewNotice("Speaker")} accessibilityRole="button" accessibilityLabel="Speaker" style={styles.ctrl}>
          <Volume2 size={t.ctrlIcon} color={t.ctrlIconColour} />
        </Pressable>
        <Pressable onPress={() => previewNotice("Switch camera")} accessibilityRole="button" accessibilityLabel="Switch camera" style={styles.ctrl}>
          <VideoIcon size={t.ctrlIcon} color={t.ctrlIconColour} />
        </Pressable>
      </View>
      )}

      {/* Development only — nothing in the prototype can pause a consultation. */}
      {DEV_PREVIEW_TOGGLES && panel !== 'ai' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/consultation/${id}/paused` as Href)}
          style={[styles.devLink, { paddingBottom: insets.bottom ? 0 : 8 }]}
        >
          <Text style={styles.devLinkText}>Preview state: consultation paused</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  screenFull: { backgroundColor: t.fullBg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: t.bg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.headerTitleSize,
    color: colors.textPrimary,
  },
  bellWrap: {},
  bellDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: h.bellDot,
    height: h.bellDot,
    borderRadius: h.bellDot / 2,
    backgroundColor: '#D64545',
  },
  avatar: {
    marginLeft: t.avatarGap,
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  status: {
    backgroundColor: t.bg,
    paddingHorizontal: t.padX,
    paddingTop: t.statusTop,
    paddingBottom: t.statusBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  enc: {
    minHeight: t.encHeight,
    borderRadius: t.encRadius,
    paddingHorizontal: t.encPadX,
    backgroundColor: t.encBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  encDot: {
    width: t.encDot,
    height: t.encDot,
    borderRadius: t.encDot / 2,
    marginRight: t.encDotGap,
    backgroundColor: t.encDotColour,
  },
  encText: {
    marginLeft: t.encIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.encSize,
    letterSpacing: t.encSpacing,
    color: colors.textPrimary,
  },
  cd: {
    marginLeft: 'auto',
    minHeight: t.cdHeight,
    borderRadius: t.cdRadius,
    paddingHorizontal: t.cdPadX,
    backgroundColor: t.cdBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cdText: { marginLeft: t.cdIconGap, fontFamily: font.appHeading, fontSize: t.cdSize, color: colors.textPrimary },
  cdSuffix: { marginLeft: t.cdSuffixGap, fontFamily: font.appBody, fontSize: t.cdSuffixSize, color: colors.textBody },

  // Top-aligned so the toggle keeps its drawn position on web, where the company
  // line cannot shrink and wraps to two lines.
  idRow: { marginTop: t.idGap, paddingHorizontal: t.padX, flexDirection: 'row', alignItems: 'flex-start' },
  idText: { flex: 1, minWidth: 0, marginRight: t.idTextGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  nameTick: { marginLeft: t.nameTickGap },
  company: { marginTop: t.compGap, fontFamily: font.appBody, fontSize: t.compSize, color: t.matterColour },
  toggle: {
    marginTop: t.toggleTop,
    minHeight: t.toggleHeight,
    borderRadius: t.toggleRadius,
    padding: t.togglePad,
    backgroundColor: t.toggleBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleItem: {
    minHeight: t.toggleHeight - t.togglePad * 2,
    borderRadius: t.toggleItemRadius,
    paddingHorizontal: t.toggleItemPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleItemOn: { backgroundColor: t.toggleOnBg },
  toggleTextOff: { color: t.toggleOffColour },
  toggleText: {
    marginLeft: t.toggleIconGap,
    fontFamily: font.appSemi,
    fontSize: t.toggleSize,
    color: colors.textPrimary,
  },

  matter: {
    marginHorizontal: t.padX,
    marginTop: t.matterGap,
    minHeight: t.matterHeight,
    borderRadius: t.matterRadius,
    paddingHorizontal: t.matterPadX,
    backgroundColor: t.matterBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matterLabel: {
    marginLeft: t.matterIconGap,
    fontFamily: font.appHeading,
    fontSize: t.matterLabelSize,
    color: colors.textPrimary,
  },
  matterDot: {
    marginHorizontal: t.matterDotGap,
    fontFamily: font.appBody,
    fontSize: t.matterSize,
    color: colors.textBody,
  },
  matterText: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.matterSize,
    color: t.matterColour,
  },
  noteChip: {
    minHeight: t.noteHeight,
    borderRadius: t.noteRadius,
    paddingHorizontal: t.notePadX,
    backgroundColor: t.noteBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteChipText: { marginLeft: t.noteIconGap, fontFamily: font.appBody, fontSize: t.noteSize, color: colors.brandDark },
  attachChip: {
    marginLeft: 8,
    minHeight: t.attachHeight,
    borderRadius: t.attachRadius,
    paddingHorizontal: t.attachPadX,
    backgroundColor: t.attachBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matterFull: { marginHorizontal: 0, marginTop: 0, paddingHorizontal: t.matterFullPadX },
  attachText: { marginLeft: t.attachIconGap, fontFamily: font.appBody, fontSize: t.attachSize, color: colors.textPrimary },

  panel: {
    height: t.panelHeight,
    marginHorizontal: t.padX,
    marginTop: t.panelGap,
    borderRadius: t.panelRadius,
    backgroundColor: vkycDark.bg,
    overflow: 'hidden',
  },
  panelFull: { flex: 1, height: undefined, marginHorizontal: 0, marginTop: 0, borderRadius: 0 },
  spacer: { flex: 1 },
  feed: { flex: 1, backgroundColor: vkycDark.feed },
  conn: {
    position: 'absolute',
    left: t.connInset,
    top: t.connTop,
    minHeight: t.connHeight,
    borderRadius: t.connRadius,
    paddingHorizontal: t.connPadX,
    backgroundColor: t.connBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connText: { marginLeft: t.connIconGap, fontFamily: font.appSemi, fontSize: t.connSize, color: vkycDark.text },
  fsBtn: {
    position: 'absolute',
    right: t.fsInset,
    top: t.connTop + t.connHeight / 2 - t.fsBtn / 2,
    width: t.fsBtn,
    height: t.fsBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  self: {
    position: 'absolute',
    right: t.selfInset,
    top: t.selfTop,
    width: t.self,
    height: t.selfH,
    borderRadius: t.selfRadius,
    borderWidth: 1,
    borderColor: t.selfBorder,
    backgroundColor: vkycDark.feed,
    overflow: 'hidden',
  },
  selfFull: { top: t.selfTopFull },
  selfFeed: { flex: 1, backgroundColor: vkycDark.feed },
  flipBadge: {
    position: 'absolute',
    right: t.flipInsetRight,
    top: t.flipInsetTop,
    width: t.flipBadge,
    height: t.flipBadge,
    borderRadius: t.flipBadge / 2,
    backgroundColor: t.flipBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfLabel: {
    position: 'absolute',
    left: t.selfLabelInset,
    bottom: t.selfLabelBottom,
    minHeight: t.selfLabelHeight,
    borderRadius: t.selfLabelRadius,
    paddingHorizontal: t.selfLabelPadX,
    backgroundColor: t.selfLabelBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfLabelText: { fontFamily: font.appBody, fontSize: t.selfLabelSize, color: vkycDark.text },

  panelBottom: {
    position: 'absolute',
    left: t.chipInset,
    right: t.chipInset,
    bottom: t.chipBottom,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.chipRowGap,
  },
  panelBottomFull: {
    bottom: t.chipBottomFull,
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
    gap: t.chipStackGap,
  },
  speak: {
    minHeight: t.speakHeight,
    borderRadius: t.speakRadius,
    paddingHorizontal: t.speakPadX,
    backgroundColor: t.overlayBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  speakText: { marginLeft: t.speakIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.speakSize, color: vkycDark.text },
  verify: {
    width: t.verifyWidth,
    minHeight: t.verifyHeight,
    borderRadius: t.verifyRadius,
    paddingHorizontal: t.verifyPadX,
    paddingVertical: t.verifyPadY,
    backgroundColor: t.overlayBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  verifyText: {
    marginLeft: t.verifyIconGap,
    maxWidth: t.verifyTextWidth,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.verifySize,
    lineHeight: t.verifyLineHeight,
    color: t.verifyColour,
  },
  aiMark: { position: 'absolute', right: t.aiMarkInset, bottom: t.aiMarkBottom },

  notesSheet: {
    borderRadius: t.matterRadius,
    backgroundColor: t.matterBg,
    paddingBottom: t.notesSheetPadBottom,
  },
  notesPanel: {
    marginHorizontal: t.padX,
    marginTop: t.notesPanelGap,
    borderRadius: t.notesPanelRadius,
    backgroundColor: t.notesPanelBg,
    padding: t.notesPanelPad,
    paddingBottom: t.notesPanelPadBottom,
  },
  notesList: { maxHeight: t.notesListMaxH },
  notesBox: {
    borderRadius: t.notesBoxRadius,
    backgroundColor: t.notesBoxBg,
    paddingLeft: t.notesBoxPadLeft,
    paddingRight: t.notesBoxPadRight,
    paddingVertical: t.notesBoxPadY,
  },
  notesRow: { flexDirection: 'row' },
  notesTrack: {
    position: 'absolute',
    right: t.notesTrackRight,
    top: t.notesTrackTop,
    bottom: t.notesTrackBottom,
    width: t.notesTrackWidth,
    borderRadius: t.notesTrackWidth / 2,
    borderWidth: t.notesTrackBorder,
    borderColor: t.notesTrackBorderColour,
    backgroundColor: t.notesTrackBg,
  },
  notesThumb: {
    marginTop: t.notesThumbInset,
    marginHorizontal: t.notesThumbInset - t.notesTrackBorder,
    height: t.notesThumbHeight,
    borderRadius: (t.notesTrackWidth - t.notesThumbInset * 2) / 2,
    backgroundColor: t.notesThumbBg,
  },
  notesBullet: {
    width: t.notesBulletWidth,
    fontFamily: font.appBody,
    fontSize: t.notesSize,
    lineHeight: t.notesLineHeight,
    color: t.matterColour,
  },
  notesText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.notesSize,
    lineHeight: t.notesLineHeight,
    color: t.matterColour,
  },
  notesEdit: {
    marginTop: t.notesEditGap,
    alignSelf: 'flex-end',
    width: t.notesEditWidth,
    minHeight: t.notesEditHeight,
    borderRadius: t.notesEditRadius,
    backgroundColor: t.notesEditBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesEditText: {
    marginLeft: t.notesEditIconGap,
    fontFamily: font.appBody,
    fontSize: t.notesEditSize,
    color: colors.textPrimary,
  },

  controls: {
    marginHorizontal: t.padX,
    marginTop: t.controlsGap,
    borderTopLeftRadius: t.controlsRadius,
    borderTopRightRadius: t.controlsRadius,
    borderBottomLeftRadius: t.controlsRadius,
    borderBottomRightRadius: t.controlsRadius,
    paddingVertical: t.controlsPadY,
    paddingHorizontal: t.controlsPadX,
    backgroundColor: t.controlsBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctrl: {
    width: t.ctrlBtn,
    height: t.ctrlBtn,
    borderRadius: t.ctrlBtn / 2,
    backgroundColor: t.ctrlBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endGlyph: { transform: [{ rotate: '135deg' }] },
  end: {
    width: t.endBtn,
    height: t.endBtn,
    borderRadius: t.endBtn / 2,
    backgroundColor: t.endBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  devLink: { paddingTop: 8, alignItems: 'center' },
  devLinkText: { fontFamily: font.appBody, fontSize: 12, color: colors.textBody },
});

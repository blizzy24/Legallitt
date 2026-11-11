import { router } from 'expo-router';
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  CircleCheck,
  Lock,
  Mic,
  ShieldCheck,
  SwitchCamera,
  Video,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KycHeader from '../../../components/KycHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { colors, font, ink, vkycDark as d, vkycDevice as t } from '../../../constants/theme';

// Device & permission check (design/97). Light page with a DARK camera panel.
//
// THE CAMERA PANEL IS A STATIC MOCK-UP. The feed is a neutral block sized to the
// file's frame with the overlays drawn on top. No expo-camera, no permissions, no
// capture — and nothing on this screen actually tests the device. The three
// diagnostic rows and both permission chips are decoration.
//
// Dark values come from the quarantined `vkycDark` block.

const DIAGNOSTICS: { icon: LucideIcon; title: string; sub: string; chip: string }[] = [
  { icon: Camera, title: 'Camera', sub: 'Ready & Unobstructed', chip: 'Working' },
  { icon: Mic, title: 'Microphone', sub: 'Audio level optimal', chip: 'Clear Sound' },
  { icon: Wifi, title: 'Internet', sub: 'Low latency • 48 Mbps', chip: 'Fast & Stable' },
];

const BARS = [6, 10, 14, 9, 12];

export default function VideoKycDeviceCheckScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <KycHeader title="Device & Permission Check" sub="Not available yet" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.sectionGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.75)}>
              STEP 3 OF 3 • READY IN SECONDS
            </Text>
          </View>
          <View style={styles.progress}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.progressDash} />
            ))}
          </View>
        </View>

        <Text style={styles.heading}>We Are Checking Your Phone</Text>
        <Text style={styles.body}>
          Make sure your camera, microphone, and internet are working properly before starting.
        </Text>

        <View style={styles.cam}>
          {/* Neutral placeholder, sized to design/97's camera frame. Never a real feed. */}
          <View style={styles.feed} />

          <View style={styles.camChip}>
            <View style={styles.camChipDot} />
            <Text style={styles.camChipText} {...shrinkToFit(0.8)}>
              Live Camera Feed • HD
            </Text>
          </View>
          <View style={styles.capture}>
            <SwitchCamera size={t.captureGlyph} color={d.text} />
          </View>

          <View style={[styles.bracket, styles.bracketTL]} />
          <View style={[styles.bracket, styles.bracketTR]} />
          <View style={[styles.bracket, styles.bracketBL]} />
          <View style={[styles.bracket, styles.bracketBR]} />

          <View style={styles.faceLabel}>
            <Text style={styles.faceLabelText} {...shrinkToFit(0.8)}>
              Face Centered
            </Text>
          </View>

          <View style={styles.strip}>
            <Mic size={t.micIcon} color={d.accent} />
            <View style={styles.bars}>
              {BARS.map((h, i) => (
                <View key={i} style={[styles.barItem, { height: h }]} />
              ))}
            </View>
            <View style={styles.stripSpacer} />
            <Text style={styles.soundText} {...shrinkToFit(0.8)}>
              Sound Detected
            </Text>
          </View>
        </View>

        <View style={styles.lensRow}>
          <View style={styles.lens}>
            <Video size={t.lensIcon} color={colors.textPrimary} />
            <Text style={styles.lensText} {...shrinkToFit(0.75)}>
              Built-in Front Lens
            </Text>
          </View>
          <View style={styles.lens}>
            <CircleCheck size={t.lensIcon} color="#1E9E4A" />
            <Text style={[styles.lensText, styles.lensOk]} {...shrinkToFit(0.75)}>
              1080p Crisp
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
            DIAGNOSTIC CHECKS
          </Text>
          <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
            3 of 3 Passed
          </Text>
        </View>

        {DIAGNOSTICS.map((x) => (
          <View key={x.title} style={styles.diag}>
            <View style={styles.diagIcon}>
              <x.icon size={t.diagIconGlyph} color={ink.accent} />
            </View>
            <View style={styles.diagText}>
              <Text style={styles.diagTitle} {...shrinkToFit(0.8)}>
                {x.title}
              </Text>
              <View style={styles.diagSubRow}>
                <Check size={t.diagSubIcon} color="#1E9E4A" strokeWidth={3} />
                <Text style={styles.diagSub} {...shrinkToFit(0.8)}>
                  {x.sub}
                </Text>
              </View>
            </View>
            <View style={styles.diagChip}>
              <Text style={styles.diagChipText} {...shrinkToFit(0.8)}>
                {x.chip}
              </Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionLabel, styles.soloLabel]} {...shrinkToFit(0.8)}>
          DEVICE PERMISSIONS
        </Text>

        <View style={styles.perm}>
          <View style={styles.permHead}>
            <View style={styles.permIcon}>
              <ShieldCheck size={t.permIconGlyph} color="#1E9E4A" />
            </View>
            <Text style={styles.permTitle} {...shrinkToFit(0.8)}>
              All Permissions Granted
            </Text>
            <Text style={styles.permActive} {...shrinkToFit(0.8)}>
              Active
            </Text>
          </View>
          <Text style={styles.permBody}>
            Both camera and microphone access are enabled for this secure video session.
          </Text>

          <View style={styles.permChips}>
            {['Camera Access', 'Microphone Access'].map((c) => (
              <View key={c} style={styles.permChip}>
                <CircleCheck size={t.permChipIcon} color="#1E9E4A" />
                <Text style={styles.permChipText} {...shrinkToFit(0.75)}>
                  {c}
                </Text>
              </View>
            ))}
          </View>

          {/* Expands nothing — no settings panel is designed. */}
          <Pressable accessibilityRole="button" style={styles.expander}>
            <Text style={styles.expanderText} {...shrinkToFit(0.8)}>
              Need to check browser settings?
            </Text>
            <ChevronDown size={t.lensIcon} color={colors.textBody} />
          </Pressable>
        </View>

        <View style={styles.note}>
          <Lock size={t.noteIcon} color={colors.textBody} />
          <Text style={styles.noteText}>
            Video KYC is not available yet.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/kyc/video/capture')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Start Video KYC</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>

        <View style={styles.caption}>
          <View style={styles.captionDot} />
          <Text style={styles.captionText} {...shrinkToFit(0.8)}>
            Ready to start • Takes under 2 mins
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX },
  pillRow: {
    marginTop: t.pillTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: '#F6EFE6',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  pillDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 7, backgroundColor: '#22B14C' },
  pillText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: colors.textBody,
  },
  progress: { marginLeft: 10, flexDirection: 'row', gap: 5 },
  progressDash: { width: 14, height: 3, borderRadius: 1.5, backgroundColor: '#22B14C' },
  heading: {
    marginTop: t.headingGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  cam: {
    marginTop: t.camGap,
    height: t.camHeight,
    borderRadius: t.camRadius,
    backgroundColor: d.surface,
    overflow: 'hidden',
  },
  feed: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: d.feed },
  camChip: {
    position: 'absolute',
    left: t.camPad,
    top: t.camPad,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: d.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  camChipDot: {
    width: t.chipDot,
    height: t.chipDot,
    borderRadius: t.chipDot / 2,
    marginRight: t.chipDotGap,
    backgroundColor: d.accent,
  },
  camChipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: d.chipText },
  capture: {
    position: 'absolute',
    right: t.camPad,
    top: t.camPad,
    width: t.capture,
    height: t.capture,
    borderRadius: t.capture / 2,
    backgroundColor: d.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bracket: {
    position: 'absolute',
    width: t.bracket,
    height: t.bracket,
    borderColor: d.accent,
  },
  bracketTL: { left: 56, top: 78, borderLeftWidth: t.bracketWidth, borderTopWidth: t.bracketWidth },
  bracketTR: { right: 56, top: 78, borderRightWidth: t.bracketWidth, borderTopWidth: t.bracketWidth },
  bracketBL: {
    left: 56,
    bottom: 70,
    borderLeftWidth: t.bracketWidth,
    borderBottomWidth: t.bracketWidth,
  },
  bracketBR: {
    right: 56,
    bottom: 70,
    borderRightWidth: t.bracketWidth,
    borderBottomWidth: t.bracketWidth,
  },
  faceLabel: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 86,
    minHeight: t.faceLabelHeight,
    borderRadius: t.faceLabelRadius,
    paddingHorizontal: t.faceLabelPadX,
    backgroundColor: d.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceLabelText: { fontFamily: font.appSemi, fontSize: t.faceLabelSize, color: d.chipText },
  strip: {
    position: 'absolute',
    left: t.camPad,
    right: t.camPad,
    bottom: t.camPad,
    minHeight: t.strip,
    borderRadius: t.stripRadius,
    paddingHorizontal: t.stripPadX,
    backgroundColor: 'rgba(14,12,9,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bars: { marginLeft: t.micIconGap, flexDirection: 'row', alignItems: 'flex-end', gap: t.barGap },
  barItem: { width: t.bar, borderRadius: 1.5, backgroundColor: d.accent },
  stripSpacer: { flex: 1, minWidth: 10 },
  soundText: { fontFamily: font.appSemi, fontSize: t.soundSize, color: d.text },
  lensRow: { marginTop: t.lensGap, flexDirection: 'row', gap: t.lensColGap },
  lens: {
    flex: 1,
    minWidth: 0,
    minHeight: t.lensHeight,
    borderRadius: t.lensRadius,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  lensText: {
    marginLeft: t.lensIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.lensSize,
    color: colors.textPrimary,
  },
  lensOk: { color: '#1E9E4A' },
  sectionRow: {
    marginTop: t.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textBody,
  },
  soloLabel: { marginTop: t.sectionGap, marginBottom: 2 },
  sectionNote: {
    marginLeft: 10,
    fontFamily: font.appSemi,
    fontSize: t.sectionNoteSize,
    color: '#1E9E4A',
  },
  diag: {
    marginTop: t.diagGap,
    borderRadius: t.diagRadius,
    backgroundColor: colors.card,
    padding: t.diagPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagIcon: {
    width: t.diagIcon,
    height: t.diagIcon,
    borderRadius: t.diagIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagText: { flex: 1, minWidth: 0, marginLeft: t.diagIconGap },
  diagTitle: { fontFamily: font.appHeading, fontSize: t.diagTitleSize, color: colors.textPrimary },
  diagSubRow: { marginTop: t.diagSubGap, flexDirection: 'row', alignItems: 'center' },
  diagSub: {
    marginLeft: t.diagSubIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.diagSubSize,
    color: colors.textBody,
  },
  diagChip: {
    marginLeft: 10,
    minHeight: t.diagChipHeight,
    borderRadius: t.diagChipRadius,
    paddingHorizontal: t.diagChipPadX,
    backgroundColor: '#E7F7EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagChipText: { fontFamily: font.appSemi, fontSize: t.diagChipSize, color: '#1E9E4A' },
  perm: {
    marginTop: t.permGap,
    borderRadius: t.permRadius,
    backgroundColor: '#F6F2ED',
    padding: t.permPad,
  },
  permHead: { flexDirection: 'row', alignItems: 'center' },
  permIcon: {
    width: t.permIcon,
    height: t.permIcon,
    borderRadius: t.permIconRadius,
    backgroundColor: '#E7F7EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.permIconGap,
    fontFamily: font.appHeading,
    fontSize: t.permTitleSize,
    color: colors.textPrimary,
  },
  permActive: {
    marginLeft: 10,
    fontFamily: font.appSemi,
    fontSize: t.permActiveSize,
    color: '#1E9E4A',
  },
  permBody: {
    marginTop: t.permBodyGap,
    fontFamily: font.appBody,
    fontSize: t.permBodySize,
    lineHeight: t.permBodyLineHeight,
    color: colors.textBody,
  },
  permChips: { marginTop: t.permChipGap, flexDirection: 'row', gap: t.permChipColGap },
  permChip: {
    flex: 1,
    minWidth: 0,
    minHeight: t.permChipHeight,
    borderRadius: t.permChipRadius,
    paddingHorizontal: t.permChipPadX,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permChipText: {
    marginLeft: t.permChipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.permChipSize,
    color: colors.textPrimary,
  },
  expander: {
    marginTop: t.expanderGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expanderText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.expanderSize,
    color: colors.textPrimary,
  },
  note: {
    marginTop: t.noteGap,
    borderRadius: t.permRadius,
    backgroundColor: '#F6F2ED',
    padding: t.permPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.noteIconGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: t.buttonIconGap },
  caption: {
    marginTop: t.captionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
    backgroundColor: '#1E9E4A',
  },
  captionText: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.captionSize,
    color: colors.textBody,
  },
});

import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Eye,
  IdCard,
  ScanFace,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEV_PREVIEW_TOGGLES } from '../../../constants/dev';
import { shrinkToFit } from '../../../constants/textFit';
import { font, vkycCapture as t, vkycDark as d } from '../../../constants/theme';

// Video verification capture (design/98). FULLY DARK — the only such screen in the
// app. All colours come from the quarantined `vkycDark` block.
//
// ─────────────────────────────────────────────────────────────────────────────
// THERE IS NO CAMERA HERE, AND NO WAY TO ADD ONE IN A UI PROTOTYPE.
//
// The feed is a neutral block with the oval guide, corner brackets and face-mesh
// dots drawn on top. No expo-camera, no permissions, no capture code.
//
// SCOPE, NOT UI: a real video KYC needs a liveness-detection SDK (to prove a live
// person rather than a photo or a replay) and a verification vendor to match the
// face against the ID and return a pass/fail. Those decide the capture format, the
// retry rules, what is stored and for how long, and which regulator's norms apply.
// None of that is a design question, and none of it can be inferred from these
// screens — the whole branch models the happy path of a system that does not exist
// yet. The 65% progress, "Step 2 of 3", "ID Ready" and "Passport matched" are all
// static.
// ─────────────────────────────────────────────────────────────────────────────

const POSES = [
  { label: 'Face straight', active: true },
  { label: 'Turn left', active: false },
  { label: 'Turn right', active: false },
];

// Face-mesh dots, as fractions of the oval's box.
const MESH = [
  [0.5, 0.3],
  [0.36, 0.44],
  [0.64, 0.44],
  [0.5, 0.52],
  [0.42, 0.66],
  [0.58, 0.66],
  [0.5, 0.74],
];

export default function VideoKycCaptureScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const done = setTimeout(() => router.replace('/kyc/video/verified'), 4000);
    return () => clearTimeout(done);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/kyc/video/intro'))}
        >
          <ArrowLeft size={t.backIcon} color={d.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Video Verification
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarIcon} color={d.text} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pillRow}>
          <View style={styles.progressPill}>
            <View style={styles.progressDot} />
            <Text style={styles.progressText} {...shrinkToFit(0.75)}>
              VERIFICATION IN PROGRESS
            </Text>
          </View>
          <View style={styles.encPill}>
            <ShieldCheck size={t.encIcon} color={d.textDim} />
            <Text style={styles.encText} {...shrinkToFit(0.8)}>
              Encrypted
            </Text>
          </View>
        </View>

        <View style={styles.cam}>
          {/* Neutral placeholder, sized to design/98's camera frame. Never a real feed. */}
          <View style={styles.feed} />

          <View style={styles.ovalWrap}>
            <View style={styles.ovalDashed} />
            <View style={styles.ovalSolid} />
            {MESH.map(([x, y], i) => (
              <View
                key={i}
                style={[
                  styles.meshDot,
                  { left: `${x * 100}%`, top: `${y * 100}%` },
                ]}
              />
            ))}
          </View>

          <View style={[styles.bracket, styles.bracketTL]} />
          <View style={[styles.bracket, styles.bracketTR]} />
          <View style={[styles.bracket, styles.bracketBL]} />
          <View style={[styles.bracket, styles.bracketBR]} />

          <View style={styles.hint}>
            <ScanFace size={t.encIcon + 2} color={d.accent} />
            <Text style={styles.hintText} {...shrinkToFit(0.8)}>
              Fit face inside the oval
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}>
              <Eye size={t.cardIconGlyph} color={d.textDim} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
                Look straight at the camera
              </Text>
              <Text style={styles.cardSub} {...shrinkToFit(0.8)}>
                Hold steady for a few seconds.
              </Text>
            </View>
          </View>

          <View style={styles.poses}>
            {POSES.map((p) => (
              <View key={p.label} style={[styles.pose, p.active && styles.poseOn]}>
                {p.active ? (
                  <ArrowRight size={t.encIcon} color={d.accent} />
                ) : (
                  <View style={styles.poseDot} />
                )}
                <Text style={[styles.poseText, p.active && styles.poseTextOn]} {...shrinkToFit(0.7)}>
                  {p.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cells}>
          <View style={styles.cell}>
            <View style={styles.cellHead}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                DOCUMENT
              </Text>
              <IdCard size={t.cellValueSize} color={d.accent} />
            </View>
            <View style={styles.cellValueRow}>
              <View style={styles.cellTick}>
                <Check size={t.cellTickGlyph} color={d.bg} strokeWidth={3} />
              </View>
              <Text style={styles.cellValue} {...shrinkToFit(0.75)}>
                ID Ready
              </Text>
            </View>
            <Text style={styles.cellSub} {...shrinkToFit(0.8)}>
              Passport matched
            </Text>
          </View>

          <View style={styles.cell}>
            <View style={styles.cellHead}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                IDENTITY CHECK
              </Text>
              <Text style={styles.cellPercent} {...shrinkToFit(0.8)}>
                65%
              </Text>
            </View>
            <View style={styles.cellValueRow}>
              <View style={styles.cellDot} />
              <Text style={styles.cellValue} {...shrinkToFit(0.75)}>
                Step 2 of 3
              </Text>
            </View>
            <View style={styles.cellBar}>
              <View style={styles.cellBarFill} />
            </View>
          </View>
        </View>

        <View style={styles.foot}>
          <ShieldCheck size={t.footIcon} color={d.accent} />
          <Text style={styles.footText} {...shrinkToFit(0.8)}>
            Video KYC is not available yet.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat')}
          hitSlop={8}
          style={styles.help}
        >
          <CircleHelp size={t.helpSize} color={d.textDim} />
          <Text style={styles.helpText} {...shrinkToFit(0.8)}>
            Need Help?
          </Text>
        </Pressable>

        {/* Development only — hidden by DEV_PREVIEW_TOGGLES in constants/dev.ts.
            design/100's error state is otherwise unreachable: nothing in this
            prototype can fail a check, so there is no path to it. */}
        {DEV_PREVIEW_TOGGLES && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/kyc/video/error')}
            style={styles.devLink}
          >
            <Text style={styles.devLinkText}>Preview state: verification failed</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: d.bg },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: d.text,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: d.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: t.padX },
  pillRow: {
    marginTop: t.pillTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPill: {
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: d.accentDim,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  progressDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    marginRight: t.pillDotGap,
    backgroundColor: d.accent,
  },
  progressText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: d.accent,
  },
  encPill: {
    marginLeft: 10,
    minHeight: t.encHeight,
    borderRadius: t.encRadius,
    paddingHorizontal: t.encPadX,
    backgroundColor: d.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  encText: {
    marginLeft: t.encIconGap,
    fontFamily: font.appSemi,
    fontSize: t.encSize,
    color: d.textDim,
  },
  cam: {
    marginTop: t.camGap,
    height: t.camHeight,
    borderRadius: t.camRadius,
    backgroundColor: d.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feed: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: d.feed },
  ovalWrap: { width: t.ovalW, height: t.ovalH },
  ovalDashed: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: t.ovalW / 2,
    borderWidth: t.ovalBorder,
    borderStyle: 'dashed',
    borderColor: d.ovalGuide,
  },
  ovalSolid: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 8,
    bottom: 8,
    borderRadius: t.ovalW / 2,
    borderWidth: 1.5,
    borderColor: d.accent,
  },
  meshDot: {
    position: 'absolute',
    width: t.mesh,
    height: t.mesh,
    borderRadius: t.mesh / 2,
    backgroundColor: d.accent,
  },
  bracket: { position: 'absolute', width: t.bracket, height: t.bracket, borderColor: d.accent },
  bracketTL: { left: 30, top: 54, borderLeftWidth: t.bracketWidth, borderTopWidth: t.bracketWidth },
  bracketTR: { right: 30, top: 54, borderRightWidth: t.bracketWidth, borderTopWidth: t.bracketWidth },
  bracketBL: {
    left: 30,
    bottom: 76,
    borderLeftWidth: t.bracketWidth,
    borderBottomWidth: t.bracketWidth,
  },
  bracketBR: {
    right: 30,
    bottom: 76,
    borderRightWidth: t.bracketWidth,
    borderBottomWidth: t.bracketWidth,
  },
  hint: {
    position: 'absolute',
    bottom: t.camPad,
    minHeight: t.hintHeight,
    borderRadius: t.hintRadius,
    paddingHorizontal: t.hintPadX,
    backgroundColor: d.hintBg,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '92%',
  },
  hintText: {
    marginLeft: 8,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.hintSize,
    color: d.text,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: t.cardIcon,
    height: t.cardIcon,
    borderRadius: 10,
    backgroundColor: d.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, minWidth: 0, marginLeft: t.cardIconGap },
  cardTitle: { fontFamily: font.appHeading, fontSize: t.cardTitleSize, color: d.text },
  cardSub: {
    marginTop: t.cardSubGap,
    fontFamily: font.appBody,
    fontSize: t.cardSubSize,
    color: d.textDim,
  },
  poses: { marginTop: t.poseGap, flexDirection: 'row', gap: t.poseColGap },
  pose: {
    // design/98 sizes these to their labels rather than into thirds — equal thirds
    // wraps "Face straight" onto two lines at 390pt.
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minWidth: 0,
    minHeight: t.poseHeight,
    borderRadius: t.poseRadius,
    backgroundColor: d.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  poseOn: { backgroundColor: d.accentDim, borderColor: d.accent },
  poseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: d.textMuted },
  poseText: {
    marginLeft: 7,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.poseSize,
    color: d.textDim,
  },
  poseTextOn: { color: d.accent },
  cells: { marginTop: t.cellGap, flexDirection: 'row', gap: t.cellColGap },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.cellRadius,
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
    padding: t.cellPad,
  },
  cellHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cellLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.cellLabelSize,
    letterSpacing: t.cellLabelSpacing,
    color: d.textDim,
  },
  cellPercent: { marginLeft: 6, fontFamily: font.appSemi, fontSize: t.cellPercentSize, color: d.amber },
  cellValueRow: { marginTop: t.cellValueGap, flexDirection: 'row', alignItems: 'center' },
  cellTick: {
    width: t.cellTick,
    height: t.cellTick,
    borderRadius: t.cellTick / 2,
    backgroundColor: d.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: d.stepDot },
  cellValue: {
    marginLeft: 8,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: d.text,
  },
  cellSub: {
    marginTop: t.cellSubGap,
    fontFamily: font.appBody,
    fontSize: t.cellSubSize,
    color: d.textDim,
  },
  cellBar: {
    marginTop: t.cellBarGap,
    height: t.cellBar,
    borderRadius: t.cellBarRadius,
    backgroundColor: d.surfaceAlt,
    overflow: 'hidden',
  },
  cellBarFill: { width: '65%', height: '100%', borderRadius: t.cellBarRadius, backgroundColor: d.accent },
  foot: {
    marginTop: t.footGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footText: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: d.textDim,
  },
  help: {
    marginTop: t.helpGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    marginLeft: 7,
    fontFamily: font.appSemi,
    fontSize: t.helpSize,
    color: d.text,
  },
  devLink: { marginTop: 22, alignItems: 'center' },
  devLinkText: {
    fontFamily: font.appBody,
    fontSize: 11.5,
    color: d.textMuted,
    textDecorationLine: 'underline',
  },
});

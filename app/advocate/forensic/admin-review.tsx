import { previewNotice } from '../../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  BellRing,
  Check,
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  FolderCheck,
  Headset,
  Info,
  RefreshCw,
  UserRound,
  X,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_ADMIN_REVIEW, DF_ADMIN_SHARED, DF_ADMIN_STATES } from '../../../data/advocateForensic';
import { advForensicAdminReview as t, colors, font, ink } from '../../../constants/theme';

// Admin review status (design/229).
//
// This screen, and the three it switches to, are the ADVOCATE watching work a
// Legalitt admin does elsewhere. There is no admin role, no admin screen and no
// admin action here, and none has been added to the role switcher.
//
// ⚠ THE PROGRESS TRACKER IS NOT design/219's FIR TIMELINE. Measured both:
// design/219 is five standalone circles on a 50pt pitch with NO rail; this is
// 23pt circles on a 58pt pitch joined by a 2pt #EAE7E7 rail, with a 31pt haloed
// ring for the active step. Nothing is reused from advFirReview.
//
// The switcher is CLIENT UI drawn in design/229 — not behind DEV_PREVIEW_TOGGLES.
// Its three segments navigate to the three routes.
//
// "Refresh Status" re-renders and nothing changes: no polling, no timer, no fake
// progress. A real status source is not scoped.
//
// "Est. 15-30 min" is a static string, not computed.
//
// The Chat Help card is static. Messaging exists in the client app; it is not
// wired here.

export default function AdvocateForensicAdminReviewScreen() {
  const insets = useSafeAreaInsets();
  const r = DF_ADMIN_REVIEW;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          onPress={() => router.replace('/matters' as Href)}
          style={styles.close}
        >
          <X size={t.closeIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Client UI, drawn in design/229. Segments navigate. */}
        <View style={styles.seg}>
          {DF_ADMIN_STATES.map((s, i) => (
            <Pressable
              key={s.label}
              accessibilityRole="button"
              accessibilityState={{ selected: i === 0 }}
              onPress={() => i !== 0 && router.replace(s.route as Href)}
              style={[styles.segItem, i === 0 && styles.segItemOn]}
            >
              <Text style={[styles.segText, i === 0 && styles.segTextOn]} {...shrinkToFit(0.75)}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.chip}>
              <View style={styles.chipDot} />
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {r.chip}
              </Text>
            </View>
            {/* ⚠ Static string. */}
            <Text style={styles.est} {...shrinkToFit(0.8)}>
              {r.est}
            </Text>
          </View>

          <Text style={styles.headline} {...shrinkToFit(0.75)}>
            {r.headline}
          </Text>
          <Text style={styles.body}>{r.body}</Text>

          <View style={styles.note}>
            <View style={styles.row}>
              <Info size={t.noteIcon} color={colors.textPrimary} style={styles.noteIcon} />
              <Text style={styles.noteText}>{r.note}</Text>
            </View>
            <View style={styles.bellRow}>
              <BellRing size={t.bellIcon} color={t.bellColour} style={styles.bellIcon} />
              <Text style={styles.bellText}>{r.bell}</Text>
            </View>
          </View>

          {/* Re-renders; nothing changes. A real status source is not scoped. */}
          <Pressable onPress={() => previewNotice(r.refresh)} accessibilityRole="button" style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}>
            <RefreshCw size={t.refreshIcon} color={ink.onBrand} />
            <Text style={styles.refreshText} {...shrinkToFit(0.8)}>
              {r.refresh}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/advocate/forensic/documents' as Href)}
            style={({ pressed }) => [styles.view, pressed && styles.pressed]}
          >
            <Eye size={t.viewIcon} color={colors.textPrimary} />
            <Text style={styles.viewText} {...shrinkToFit(0.8)}>
              {r.viewFiles}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cdTitle} {...shrinkToFit(0.75)}>
              {r.caseTitle}
            </Text>
            <View style={styles.id}>
              <Text style={styles.idText} {...shrinkToFit(0.8)}>
                {r.idLabel}
              </Text>
            </View>
          </View>
          {r.caseRows.map((row, i) => (
            <View key={row.label} style={[styles.cdRow, i === 0 && styles.cdRowFirst]}>
              <Text style={styles.cdLabel} {...shrinkToFit(0.8)}>
                {row.label}
              </Text>
              <Text style={styles.cdValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.cdRow}>
            <Text style={styles.cdLabel} {...shrinkToFit(0.8)}>
              {r.dueLabel}
            </Text>
            <View style={styles.due}>
              <Clock size={t.dueIcon} color={t.dueColour} />
              <Text style={styles.dueText} {...shrinkToFit(0.8)}>
                {DF_ADMIN_SHARED.filingDue}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.filesText}>
              <Text style={styles.filesTitle} {...shrinkToFit(0.75)}>
                {r.filesTitle}
              </Text>
              <Text style={styles.filesSub} {...shrinkToFit(0.8)}>
                {r.filesSub}
              </Text>
            </View>
            <FolderCheck size={t.filesIcon} color={colors.brandDark} />
          </View>
          {[DF_ADMIN_SHARED.report, DF_ADMIN_SHARED.affidavit].map((f, i) => (
            <View key={f.name} style={[styles.file, i === 0 && styles.fileFirst]}>
              <View style={styles.fileIcon}>
                <FileText size={t.fileIconGlyph} color={colors.textPrimary} />
              </View>
              <View style={styles.fileText}>
                <Text style={styles.fileName} {...shrinkToFit(0.7)}>
                  {f.name}
                </Text>
                <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
                  {f.meta}
                </Text>
              </View>
              <View style={styles.sent}>
                <Check size={t.sentIcon} color={t.sentColour} strokeWidth={3} />
                <Text style={styles.sentText} {...shrinkToFit(0.8)}>
                  {r.sentTag}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.trkTitle} {...shrinkToFit(0.75)}>
            {r.trackerTitle}
          </Text>
          <View style={styles.trk}>
            {r.tracker.map((item, i) => (
              <Fragment key={item.title}>
                <View style={styles.trkRow}>
                  <View style={styles.trkCol}>
                    {item.tone === 'now' ? (
                      <View style={styles.trkHalo}>
                        <View style={styles.trkRing}>
                          <View style={styles.trkCentre} />
                        </View>
                      </View>
                    ) : item.tone === 'done' ? (
                      <View style={styles.trkDone}>
                        <Check size={t.trkDotGlyph} color={ink.onBrand} strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={styles.trkTodo} />
                    )}
                    {i < r.tracker.length - 1 && (
                      <View style={styles.trkRailWrap}>
                        <View style={styles.trkRail} />
                      </View>
                    )}
                  </View>
                  <View style={styles.trkText}>
                    <Text style={styles.trkItemTitle} {...shrinkToFit(0.75)}>
                      {item.title}
                    </Text>
                    <Text style={styles.trkItemSub}>{item.sub}</Text>
                  </View>
                </View>
              </Fragment>
            ))}
          </View>
        </View>

        {/* Opens the support chat (design/35). */}
        <Pressable accessibilityRole="button" onPress={() => router.push('/support-chat' as Href)} style={styles.chat}>
          <View style={styles.chatIcon}>
            <Headset size={t.chatIconGlyph} color={colors.textPrimary} />
          </View>
          <View style={styles.chatText}>
            <Text style={styles.chatTitle} {...shrinkToFit(0.75)}>
              {r.chat.title}
            </Text>
            <Text style={styles.chatSub}>{r.chat.sub}</Text>
          </View>
          <View style={styles.chatBtn}>
            <Text style={styles.chatBtnText} {...shrinkToFit(0.8)}>
              {r.chat.button}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  close: { marginRight: t.closeGap },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 28 },
  row: { flexDirection: 'row', alignItems: 'center' },

  seg: {
    marginTop: t.segGap,
    minHeight: t.segHeight,
    borderRadius: t.segRadius,
    backgroundColor: t.segBg,
    padding: t.segPad,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  segItem: { flex: 1, minWidth: 0, borderRadius: t.segItemRadius, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segItemOn: { backgroundColor: t.segOnBg },
  segText: { fontFamily: font.appBody, fontSize: t.segSize, color: t.segOffColour, flexShrink: 1 },
  segTextOn: { fontFamily: font.appHeading, color: t.segOnColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },

  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    backgroundColor: t.chipBg,
    paddingHorizontal: t.chipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chipDot: { width: t.chipDot, height: t.chipDot, borderRadius: t.chipDot / 2, backgroundColor: t.chipColour, marginRight: t.chipDotGap },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: t.chipColour, flexShrink: 1 },
  est: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appBody, fontSize: t.estSize, color: t.estColour, flexShrink: 1 },

  headline: { marginTop: t.headlineGap, fontFamily: font.appHeading, fontSize: t.headlineSize, color: colors.textPrimary },
  body: { marginTop: t.bodyGap, fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: t.bodyColour },

  note: { marginTop: t.noteGap, borderRadius: t.noteRadius, backgroundColor: t.noteBg, padding: t.notePad },
  noteIcon: { marginTop: 1, alignSelf: 'flex-start' },
  noteText: { flex: 1, minWidth: 0, marginLeft: t.noteIconGap, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: colors.textPrimary },
  bellRow: { marginTop: t.bellGap, flexDirection: 'row', alignItems: 'flex-start' },
  bellIcon: { marginTop: 1 },
  bellText: { flex: 1, minWidth: 0, marginLeft: t.bellIconGap, fontFamily: font.appSemi, fontSize: t.bellSize, lineHeight: t.bellLineHeight, color: t.bellColour },

  refresh: {
    marginTop: t.actGap,
    minHeight: t.refreshHeight,
    borderRadius: t.refreshRadius,
    backgroundColor: t.refreshBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: { marginLeft: t.refreshIconGap, fontFamily: font.appHeading, fontSize: t.refreshSize, color: ink.onBrand, flexShrink: 1 },
  view: {
    marginTop: t.viewGap,
    minHeight: t.viewHeight,
    borderRadius: t.viewRadius,
    backgroundColor: t.viewBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: { marginLeft: t.viewIconGap, fontFamily: font.appHeading, fontSize: t.viewSize, color: colors.textPrimary, flexShrink: 1 },

  cdTitle: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.cdTitleSize, color: colors.textPrimary },
  id: {
    marginLeft: 'auto',
    minHeight: t.idHeight,
    borderRadius: t.idRadius,
    backgroundColor: t.idBg,
    paddingHorizontal: t.idPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  idText: { fontFamily: font.appSemi, fontSize: t.idSize, color: t.idColour },
  cdRow: { marginTop: t.cdRowGapY, flexDirection: 'row', alignItems: 'flex-start' },
  cdRowFirst: { marginTop: t.cdRowGap },
  cdLabel: { flexShrink: 1, marginRight: 12, fontFamily: font.appBody, fontSize: t.cdLabelSize, color: t.cdLabelColour },
  cdValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    fontFamily: font.appHeading,
    fontSize: t.cdValueSize,
    lineHeight: t.cdValueLineHeight,
    color: colors.textPrimary,
  },
  due: {
    marginLeft: 'auto',
    minHeight: t.dueHeight,
    borderRadius: t.dueRadius,
    backgroundColor: t.dueBg,
    paddingHorizontal: t.duePadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  dueText: { marginLeft: t.dueIconGap, fontFamily: font.appSemi, fontSize: t.dueSize, color: t.dueColour },

  filesText: { flex: 1, minWidth: 0, marginRight: 10 },
  filesTitle: { fontFamily: font.appHeading, fontSize: t.filesTitleSize, color: colors.textPrimary },
  filesSub: { marginTop: t.filesSubGap, fontFamily: font.appBody, fontSize: t.filesSubSize, color: t.filesSubColour },
  file: { marginTop: t.fileGapY, borderRadius: t.fileRadius, backgroundColor: t.fileBg, padding: t.filePad, flexDirection: 'row', alignItems: 'center' },
  fileFirst: { marginTop: t.fileGap },
  fileIcon: { width: t.fileIcon, height: t.fileIcon, borderRadius: t.fileIconRadius, backgroundColor: t.fileIconBg, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0, marginHorizontal: t.fileIconGap },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appBody, fontSize: t.fileMetaSize, color: t.fileMetaColour },
  sent: {
    minHeight: t.sentHeight,
    borderRadius: t.sentRadius,
    backgroundColor: t.sentBg,
    paddingHorizontal: t.sentPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  sentText: { marginLeft: t.sentIconGap, fontFamily: font.appSemi, fontSize: t.sentSize, color: t.sentColour },

  trkTitle: { fontFamily: font.appHeading, fontSize: t.trkTitleSize, color: colors.textPrimary },
  trk: { marginTop: t.trkGap },
  trkRow: { flexDirection: 'row', alignItems: 'stretch' },
  trkCol: { alignItems: 'center', width: t.trkNowHalo },
  trkRailWrap: { flex: 1, alignItems: 'center' },
  trkDone: { width: t.trkDot, height: t.trkDot, borderRadius: t.trkDot / 2, backgroundColor: t.trkDoneBg, alignItems: 'center', justifyContent: 'center' },
  trkHalo: {
    width: t.trkNowHalo,
    height: t.trkNowHalo,
    borderRadius: t.trkNowHalo / 2,
    backgroundColor: t.trkNowHaloBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trkRing: {
    width: t.trkNowRing,
    height: t.trkNowRing,
    borderRadius: t.trkNowRing / 2,
    borderWidth: t.trkNowRingW,
    borderColor: t.trkNowRingColour,
    backgroundColor: t.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trkCentre: { width: t.trkNowCentre, height: t.trkNowCentre, borderRadius: t.trkNowCentre / 2, backgroundColor: t.trkNowRingColour },
  trkTodo: {
    width: t.trkDot,
    height: t.trkDot,
    borderRadius: t.trkDot / 2,
    borderWidth: 2,
    borderColor: t.trkTodoBorder,
    backgroundColor: t.cardBg,
  },
  trkRail: { flex: 1, width: t.trkRailW, backgroundColor: t.trkRailColour },
  trkText: { flex: 1, minWidth: 0, marginLeft: t.trkDotGapX, paddingBottom: t.trkPitch - t.trkDot },
  trkItemTitle: { fontFamily: font.appHeading, fontSize: t.trkItemTitleSize, color: colors.textPrimary },
  trkItemSub: { marginTop: t.trkItemSubGap, fontFamily: font.appBody, fontSize: t.trkItemSubSize, color: t.trkItemSubColour },

  chat: { marginTop: t.cardGap, borderRadius: t.chatRadius, backgroundColor: t.chatBg, padding: t.chatPad, flexDirection: 'row', alignItems: 'center' },
  chatIcon: { width: t.chatIcon, height: t.chatIcon, borderRadius: t.chatIcon / 2, backgroundColor: t.chatIconBg, alignItems: 'center', justifyContent: 'center' },
  chatText: { flex: 1, minWidth: 0, marginHorizontal: t.chatIconGap },
  chatTitle: { fontFamily: font.appHeading, fontSize: t.chatTitleSize, color: colors.textPrimary },
  chatSub: { marginTop: t.chatSubGap, fontFamily: font.appBody, fontSize: t.chatSubSize, lineHeight: t.chatSubLineHeight, color: t.chatSubColour },
  chatBtn: {
    minHeight: t.chatBtnHeight,
    borderRadius: t.chatBtnRadius,
    backgroundColor: t.chatBtnBg,
    paddingHorizontal: t.chatBtnPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  chatBtnText: { textAlign: 'center', fontFamily: font.appHeading, fontSize: t.chatBtnSize, lineHeight: t.chatBtnLineHeight, color: colors.textPrimary },
  pressed: { opacity: 0.85 },
});

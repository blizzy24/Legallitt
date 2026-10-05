import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  Clock,
  Download,
  FileText,
  Lock,
  ShieldCheck,
  SquarePen,
  UserRound,
  Video,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_ROOM } from '../../../../data/advocateSide';
import { advRequest as h, advRoom as t, colors, font, ink } from '../../../../constants/theme';

// Consultation room (design/167).
//
// The admittance countdown runs. Everything else is static: View All, both Review
// chips, the lock button, Edit and Save are inert — none has a designed destination.
//
// design/167 overflows its own time row ("IST" and "min" each wrap alone); laid out
// to fit here. It also calls the matter "Matter #2024-CH-882", a third reference
// format for the same matter — see the note in data/advocateSide.ts.

function clock(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AdvocateConsultationRoomScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = ADV_ROOM;
  const [seconds, setSeconds] = useState(r.countdownSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const tick = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [seconds]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + h.headerTop }]}>
        <Text style={styles.headerTitle} numberOfLines={1}>
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

      <View style={styles.back}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backChevron} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.backTitle} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <View style={styles.shield}>
          <ShieldCheck size={t.shieldIcon} color={colors.brandDark} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.clientRow}>
            {/* Placeholder for design/167's photograph, at the drawn size. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{r.client.initials}</Text>
            </View>
            <View style={styles.clientText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.7)}>
                  {r.client.name}
                </Text>
                <View style={styles.mode}>
                  <Video size={t.modeIcon} color={colors.brandDark} />
                  <Text style={styles.modeText} {...shrinkToFit(0.75)}>
                    {r.client.modeChip}
                  </Text>
                </View>
              </View>
              <Text style={styles.role}>{r.client.company}</Text>
            </View>
          </View>

          <View style={styles.when}>
            <Clock size={t.whenIcon} color={colors.brandDark} />
            <Text style={styles.whenText} {...shrinkToFit(0.7)}>
              {r.when}
            </Text>
            <Text style={styles.dur} {...shrinkToFit(0.75)}>
              • {r.duration}
            </Text>
          </View>
        </View>

        <View style={styles.ready}>
          <View style={styles.readyTop}>
            <View style={styles.readyText}>
              <View style={styles.readyLabelRow}>
                <View style={styles.readyDot} />
                <Text style={styles.readyLabel} {...shrinkToFit(0.8)}>
                  {r.readyLabel}
                </Text>
              </View>
              <View style={styles.cdRow}>
                <Text style={styles.cd} {...shrinkToFit(0.75)}>
                  {clock(Math.max(seconds, 0))}
                </Text>
                <Text style={styles.cdNote} {...shrinkToFit(0.7)}>
                  {r.countdownNote}
                </Text>
              </View>
            </View>
            {/* Inert — the lock button has no designed destination. */}
            <View style={styles.lockBtn}>
              <Lock size={t.lockBtnIcon} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.e2e}>
            <Lock size={t.e2eIcon} color={colors.textPrimary} />
            <Text style={styles.e2eText} {...shrinkToFit(0.7)}>
              {r.encrypted}
            </Text>
            <Text style={styles.cleared} {...shrinkToFit(0.75)}>
              {r.cleared}
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.75)}>
            {r.summaryLabel}
          </Text>
          <Text style={styles.sectionLink} {...shrinkToFit(0.75)}>
            {r.matterRef}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.matterTitle}>{r.matter}</Text>
          <Text style={styles.summary}>{r.summary}</Text>
          <View style={styles.tags}>
            {r.tags.map((tag) => (
              <View
                key={tag.label}
                style={[styles.tag, tag.tone === 'priority' && styles.tagPriority]}
              >
                <Text
                  style={[styles.tagText, tag.tone === 'priority' && styles.tagTextPriority]}
                  {...shrinkToFit(0.75)}
                >
                  {tag.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.75)}>
            DOCUMENTS ({r.documents.length})
          </Text>
          {/* Inert — View All has no designed destination. */}
          <Pressable accessibilityRole="button">
            <Text style={styles.sectionLink} {...shrinkToFit(0.8)}>
              {r.documentsLink}
            </Text>
          </Pressable>
        </View>

        {r.documents.map((d) => (
          <View key={d.id} style={[styles.card, styles.docCard]}>
            <View style={styles.docIcon}>
              <FileText size={t.docIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.docText}>
              <Text style={styles.docName} {...shrinkToFit(0.7)}>
                {d.name}
              </Text>
              <Text style={styles.docMeta} {...shrinkToFit(0.75)}>
                {d.meta}
              </Text>
            </View>
            <Pressable accessibilityRole="button" style={styles.review}>
              <Text style={styles.reviewText} {...shrinkToFit(0.8)}>
                Review
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.sectionRow}>
          <Lock size={t.sectionIcon} color={colors.textPrimary} />
          <Text style={[styles.section, styles.sectionWithIcon]} {...shrinkToFit(0.75)}>
            {r.notesLabel}
          </Text>
          <Text style={styles.sectionLink} {...shrinkToFit(0.75)}>
            {r.notesPrivacy}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.note}>
            <Text style={styles.noteText}>• {r.note}</Text>
          </View>
          <View style={styles.noteBtns}>
            {/* Both inert — neither has a designed destination. */}
            <Pressable accessibilityRole="button" style={styles.noteBtn}>
              <SquarePen size={t.noteBtnIcon} color={colors.textPrimary} />
              <Text style={styles.noteBtnText} {...shrinkToFit(0.8)}>
                Edit
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.noteBtn}>
              <Download size={t.noteBtnIcon} color={colors.textPrimary} />
              <Text style={styles.noteBtnText} {...shrinkToFit(0.8)}>
                Save
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/consultation/${id}/chat` as Href)}
          style={({ pressed }) => [styles.start, pressed && styles.pressed]}
        >
          <Video size={t.startIcon} color={ink.onBrand} />
          <Text style={styles.startText} {...shrinkToFit(0.75)}>
            {r.start}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: h.headerPadBottom,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: h.titleSize,
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
    marginLeft: h.avatarGap,
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  back: {
    paddingHorizontal: t.padX,
    paddingTop: t.backTop,
    paddingBottom: t.backPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backTitle: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.backTitleSize,
    color: colors.textPrimary,
  },
  shield: {
    width: t.shield,
    height: t.shield,
    borderRadius: t.shield / 2,
    backgroundColor: t.shieldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 32 },
  card: {
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  clientRow: { flexDirection: 'row' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.photoGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  mode: {
    marginLeft: 8,
    minHeight: t.modeHeight,
    borderRadius: t.modeRadius,
    paddingHorizontal: t.modePadX,
    backgroundColor: t.modeBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  modeText: {
    marginLeft: t.modeIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.modeSize,
    color: colors.brandDark,
  },
  role: {
    marginTop: t.roleGap,
    fontFamily: font.appBody,
    fontSize: t.roleSize,
    lineHeight: t.roleLineHeight,
    color: colors.textBody,
  },
  when: { marginTop: t.whenGap, flexDirection: 'row', alignItems: 'center' },
  whenText: {
    marginLeft: t.whenIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.whenSize,
    color: colors.textPrimary,
  },
  dur: {
    marginLeft: t.whenDotGap,
    fontFamily: font.appBody,
    fontSize: t.durSize,
    color: colors.textPrimary,
  },

  ready: {
    marginTop: t.cardGap,
    borderRadius: t.readyRadius,
    backgroundColor: t.readyBg,
    overflow: 'hidden',
  },
  readyTop: { padding: t.readyPad, flexDirection: 'row', alignItems: 'center' },
  readyText: { flex: 1, minWidth: 0, marginRight: 10 },
  readyLabelRow: { flexDirection: 'row', alignItems: 'center' },
  readyDot: {
    width: t.readyDot,
    height: t.readyDot,
    borderRadius: t.readyDot / 2,
    marginRight: t.readyDotGap,
    backgroundColor: colors.brandDark,
  },
  readyLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.readyLabelSize,
    letterSpacing: t.readyLabelSpacing,
    color: colors.textPrimary,
  },
  cdRow: { marginTop: t.cdGap, flexDirection: 'row', alignItems: 'baseline' },
  cd: { fontFamily: font.appHeading, fontSize: t.cdSize, color: colors.textPrimary },
  cdNote: {
    marginLeft: t.cdNoteGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.cdNoteSize,
    color: colors.textBody,
  },
  lockBtn: {
    width: t.lockBtn,
    height: t.lockBtn,
    borderRadius: t.lockBtnRadius,
    backgroundColor: t.lockBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  e2e: {
    paddingHorizontal: t.e2ePadX,
    paddingVertical: t.e2ePadY,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  e2eText: {
    marginLeft: t.e2eIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.e2eSize,
    color: colors.textPrimary,
  },
  cleared: { fontFamily: font.appBody, fontSize: t.clearedSize, color: colors.brandDark },

  sectionRow: {
    marginTop: t.sectionGap,
    marginBottom: t.cardGap - 4,
    paddingHorizontal: t.sectionInset,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textPrimary,
  },
  sectionWithIcon: { marginLeft: t.sectionIconGap },
  sectionLink: { fontFamily: font.appSemi, fontSize: t.sectionLinkSize, color: colors.brandDark },

  matterTitle: {
    fontFamily: font.appHeading,
    fontSize: t.matterTitleSize,
    lineHeight: t.matterTitleLineHeight,
    color: colors.textPrimary,
  },
  summary: {
    marginTop: t.summaryGap,
    fontFamily: font.appBody,
    fontSize: t.summarySize,
    lineHeight: t.summaryLineHeight,
    color: colors.textPrimary,
  },
  tags: {
    marginTop: t.tagGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.tagGapX,
    rowGap: t.tagGapY,
  },
  tag: {
    minHeight: t.tagHeight,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: t.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  tagPriority: { backgroundColor: t.tagPriorityBg },
  tagText: { fontFamily: font.appBody, fontSize: t.tagSize, color: colors.textPrimary },
  tagTextPriority: { color: t.tagPriorityColour },

  docCard: { marginBottom: t.docGap, flexDirection: 'row', alignItems: 'center' },
  docIcon: {
    width: t.docIcon,
    height: t.docIcon,
    borderRadius: t.docIconRadius,
    backgroundColor: t.docIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginLeft: t.docIconGap, marginRight: 8 },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: colors.textBody },
  review: {
    minHeight: t.reviewHeight,
    borderRadius: t.reviewRadius,
    paddingHorizontal: t.reviewPadX,
    backgroundColor: t.reviewBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewText: { fontFamily: font.appBody, fontSize: t.reviewSize, color: colors.textPrimary },

  note: {
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
  },
  noteText: {
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textPrimary,
  },
  noteBtns: { marginTop: t.noteBtnGap, flexDirection: 'row', gap: t.noteBtnGapX },
  noteBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: t.noteBtnHeight,
    borderRadius: t.noteBtnRadius,
    backgroundColor: t.noteBtnBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBtnText: {
    marginLeft: t.noteBtnIconGap,
    fontFamily: font.appSemi,
    fontSize: t.noteBtnSize,
    color: colors.textPrimary,
  },

  start: {
    marginTop: t.startGap,
    minHeight: t.startHeight,
    borderRadius: t.startRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  startText: {
    marginLeft: t.startIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.startSize,
    color: ink.onBrand,
  },
  pressed: { opacity: 0.85 },
});

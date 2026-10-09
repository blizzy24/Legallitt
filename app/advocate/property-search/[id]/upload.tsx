import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Eye,
  FileText,
  FolderOpen,
  Info,
  Landmark,
  Lock,
  MapPin,
  MessageSquare,
  RefreshCw,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_PSR_UPLOAD } from '../../../../data/advocateSide';
import {
  advPsrUpload as t,
  colors,
  font,
  ink,
  psrUrgent,
  status,
} from '../../../../constants/theme';

// Upload property search report (design/210).
//
// ⚠ THE URGENT CHIP IS RED HERE AND AMBER ON THE CASES LIST. Sampled #FFDAD6 on
// #93000A; designs 204/205 draw the same word for the same matter in amber
// (advCases.urgentBg #FBEEDC on #B5741A). The shared `status` scale has no red pill
// at all. Quarantined in constants/tokens/psrUrgent.ts — see the note there.
//
// ⚠ THE FILENAME NAMES SINGHANIA, THE CLIENT IS RAHUL SHARMA.
//
// ⚠ THE PLACEHOLDER IS CUT OFF MID-SENTENCE in design/210, unclosed bracket.
// Rendered exactly as drawn.
//
// ⚠ UPLOAD CONTROLS ARE INERT. View and Replace have no designed destination, and
// no upload flow — picker, progress, failure, retry — exists anywhere in the
// project. The screen only ever shows an already-uploaded file.
//
// The note field is live and the counter tracks it; everything else is static.

export default function AdvocatePropertySearchUploadScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const u = ADV_PSR_UPLOAD;
  const [note, setNote] = useState('');

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {u.title}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="About this step" hitSlop={8}>
          <Info size={t.infoIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.docketRow}>
          <View style={styles.docket}>
            <FolderOpen size={t.docketIcon} color={t.docketColour} />
            <Text style={styles.docketText} {...shrinkToFit(0.75)}>
              {u.docket}
            </Text>
          </View>
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText} {...shrinkToFit(0.75)}>
              {u.statusChip}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {u.property.label}
            </Text>
            {/* ⚠ Red, not the amber used for the same word elsewhere. */}
            <View style={styles.urgent}>
              <Text style={styles.urgentText} {...shrinkToFit(0.7)}>
                {u.property.urgentChip}
              </Text>
            </View>
          </View>

          <View style={styles.identity}>
            <View style={styles.bigAvatar}>
              <UserRound size={t.bigAvatarGlyph} color={t.labelColour} />
            </View>
            <View style={styles.identityText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.8)}>
                  {u.property.name}
                </Text>
                <BadgeCheck size={t.tick} color={colors.textPrimary} style={styles.tick} />
              </View>
              <Text style={styles.role} {...shrinkToFit(0.8)}>
                {u.property.role}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.addrRow}>
            <MapPin size={t.pinIcon} color={colors.textPrimary} style={styles.pin} />
            <Text style={styles.addr}>{u.property.address}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.heading} {...shrinkToFit(0.8)}>
            {u.upload.heading}
          </Text>
          <View style={styles.ru}>
            <BadgeCheck size={t.ruIcon} color={t.ruColour} />
            <Text style={styles.ruText} {...shrinkToFit(0.75)}>
              {u.upload.chip}
            </Text>
          </View>
        </View>
        <Text style={styles.body}>{u.upload.body}</Text>

        <View style={[styles.card, styles.fileCard]}>
          <View style={styles.fileRow}>
            <View style={styles.pdfBox}>
              <FileText size={t.pdfGlyph} color={t.pdfColour} />
            </View>
            <View style={styles.fileText}>
              {/* ⚠ Singhania, not Sharma. Wrapped, never ellipsized. */}
              <Text style={styles.fileName}>{u.upload.file}</Text>
              <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
                {u.upload.meta}
              </Text>
            </View>
          </View>

          {/* Inert — no upload flow is designed anywhere. */}
          <View style={styles.vrRow}>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.vr, pressed && styles.pressed]}>
              <Eye size={t.vrIcon} color={colors.textPrimary} />
              <Text style={styles.vrText} {...shrinkToFit(0.8)}>
                {u.upload.view}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.vr, pressed && styles.pressed]}>
              <RefreshCw size={t.vrIcon} color={colors.textPrimary} />
              <Text style={styles.vrText} {...shrinkToFit(0.8)}>
                {u.upload.replace}
              </Text>
            </Pressable>
          </View>

          <View style={styles.footRow}>
            <Info size={t.footIcon} color={t.footColour} />
            <Text style={styles.foot} {...shrinkToFit(0.8)}>
              {u.upload.footnote}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.payCard]}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {u.payment.label}
            </Text>
            <View style={styles.esc}>
              <Lock size={t.escIcon} color={t.escColour} />
              <Text style={styles.escText} {...shrinkToFit(0.75)}>
                {u.payment.chip}
              </Text>
            </View>
          </View>

          <View style={styles.receiveRow}>
            <Text style={styles.receive} {...shrinkToFit(0.8)}>
              {u.payment.receiveLabel}
            </Text>
            <Text style={styles.amount} {...shrinkToFit(0.75)}>
              {u.payment.amount}
            </Text>
          </View>

          <View style={styles.escNote}>
            <Landmark size={t.escNoteIcon} color={colors.textPrimary} style={styles.escNoteIcon} />
            <Text style={styles.escNoteText}>{u.payment.note}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.heading} {...shrinkToFit(0.8)}>
            {u.note.heading}
          </Text>
          <View style={styles.opt}>
            <Text style={styles.optText} {...shrinkToFit(0.75)}>
              {u.note.chip}
            </Text>
          </View>
          <Text style={styles.counter} {...shrinkToFit(0.8)}>
            {note.length}/{u.note.max}
          </Text>
        </View>

        <View style={[styles.card, styles.noteCard]}>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            maxLength={u.note.max}
            multiline
            textAlignVertical="top"
            /* ⚠ Cut off mid-sentence in design/210 — as drawn. */
            placeholder={u.note.placeholder}
            placeholderTextColor={t.inputColour}
          />
          <View style={styles.deliveryRow}>
            <MessageSquare size={t.deliveryIcon} color={t.deliveryColour} style={styles.deliveryIcon} />
            <Text style={styles.delivery}>{u.note.delivery}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/property-search/${id}/send` as Href)}
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
        >
          <Text style={styles.continueText} {...shrinkToFit(0.8)}>
            {u.continue}
          </Text>
          <ArrowRight size={t.continueArrow} color={ink.onBrand} style={styles.continueArrow} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    marginLeft: t.infoGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },

  docketRow: { marginTop: t.docketGap, flexDirection: 'row', alignItems: 'center' },
  docket: {
    minHeight: t.docketHeight,
    borderRadius: t.docketRadius,
    backgroundColor: t.docketBg,
    paddingHorizontal: t.docketPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  docketText: {
    marginLeft: t.docketIconGap,
    fontFamily: font.appSemi,
    fontSize: t.docketSize,
    letterSpacing: t.docketSpacing,
    color: t.docketColour,
    flexShrink: 1,
  },
  status: {
    marginLeft: 'auto',
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    backgroundColor: t.statusBg,
    paddingHorizontal: t.statusPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  statusDot: {
    width: t.statusDot,
    height: t.statusDot,
    borderRadius: t.statusDot / 2,
    backgroundColor: t.statusColour,
    marginRight: t.statusDotGap,
  },
  statusText: { fontFamily: font.appSemi, fontSize: t.statusSize, color: t.statusColour, flexShrink: 1 },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    padding: t.cardPad,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    flexShrink: 1,
    marginRight: 10,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: t.labelColour,
  },
  urgent: {
    marginLeft: 'auto',
    minHeight: t.urgentHeight,
    borderRadius: t.urgentRadius,
    backgroundColor: psrUrgent.bg,
    paddingHorizontal: t.urgentPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  urgentText: { fontFamily: font.appSemi, fontSize: t.urgentSize, color: psrUrgent.colour },

  identity: { marginTop: t.identityGap, flexDirection: 'row', alignItems: 'center' },
  bigAvatar: {
    width: t.bigAvatar,
    height: t.bigAvatar,
    borderRadius: t.bigAvatar / 2,
    backgroundColor: t.bigAvatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: { flex: 1, minWidth: 0, marginLeft: t.bigAvatarGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  tick: { marginLeft: t.tickGap },
  role: { marginTop: t.roleGap, fontFamily: font.appSemi, fontSize: t.roleSize, color: t.roleColour },

  divider: { marginTop: t.dividerGap, height: 1, backgroundColor: t.dividerColour },
  addrRow: { marginTop: t.addrGap, flexDirection: 'row', alignItems: 'flex-start' },
  pin: { marginTop: 2 },
  addr: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.pinGap,
    fontFamily: font.appBody,
    fontSize: t.addrSize,
    lineHeight: t.addrLineHeight,
    color: colors.textPrimary,
  },

  sectionRow: { marginTop: t.sectionGap, flexDirection: 'row', alignItems: 'center' },
  heading: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.headingSize, color: colors.textPrimary },
  ru: {
    marginLeft: 'auto',
    minHeight: t.ruHeight,
    borderRadius: t.ruRadius,
    backgroundColor: t.ruBg,
    paddingHorizontal: t.ruPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  ruText: { marginLeft: t.ruIconGap, fontFamily: font.appSemi, fontSize: t.ruSize, color: t.ruColour, flexShrink: 1 },
  body: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: t.bodyColour,
  },

  fileCard: { marginTop: t.fileGap },
  fileRow: { flexDirection: 'row', alignItems: 'center' },
  pdfBox: {
    width: t.pdfBox,
    height: t.pdfBox,
    borderRadius: t.pdfRadius,
    backgroundColor: t.pdfBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.pdfGap },
  fileName: {
    fontFamily: font.appHeading,
    fontSize: t.fileNameSize,
    lineHeight: t.fileNameLineHeight,
    color: colors.textPrimary,
  },
  fileMeta: {
    marginTop: t.fileMetaGap,
    fontFamily: font.appBody,
    fontSize: t.fileMetaSize,
    color: t.fileMetaColour,
  },
  vrRow: { marginTop: t.vrGap, flexDirection: 'row', gap: t.vrGapX },
  vr: {
    flex: 1,
    minWidth: 0,
    minHeight: t.vrHeight,
    borderRadius: t.vrRadius,
    backgroundColor: t.vrBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  vrText: { marginLeft: t.vrIconGap, fontFamily: font.appSemi, fontSize: t.vrSize, color: colors.textPrimary, flexShrink: 1 },
  footRow: { marginTop: t.footGap, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  foot: { marginLeft: t.footIconGap, fontFamily: font.appBody, fontSize: t.footSize, color: t.footColour, flexShrink: 1 },

  payCard: {},
  esc: {
    marginLeft: 'auto',
    minHeight: t.escHeight,
    borderRadius: t.escRadius,
    backgroundColor: t.escBg,
    paddingHorizontal: t.escPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  escText: { marginLeft: t.escIconGap, fontFamily: font.appSemi, fontSize: t.escSize, color: t.escColour, flexShrink: 1 },
  receiveRow: { marginTop: t.receiveGap, flexDirection: 'row', alignItems: 'baseline' },
  receive: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.receiveSize, color: colors.textPrimary },
  amount: { marginLeft: 8, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.amountSize, color: colors.textPrimary },
  escNote: {
    marginTop: t.escNoteGap,
    borderRadius: t.escNoteRadius,
    backgroundColor: t.escNoteBg,
    padding: t.escNotePad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  escNoteIcon: { marginTop: 1 },
  escNoteText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.escNoteIconGap,
    fontFamily: font.appBody,
    fontSize: t.escNoteSize,
    lineHeight: t.escNoteLineHeight,
    color: colors.textPrimary,
  },

  opt: {
    marginLeft: t.optGap,
    minHeight: t.optHeight,
    borderRadius: t.optRadius,
    backgroundColor: t.optBg,
    paddingHorizontal: t.optPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  optText: { fontFamily: font.appSemi, fontSize: t.optSize, color: t.optColour },
  counter: { marginLeft: 'auto', fontFamily: font.appBody, fontSize: t.counterSize, color: t.counterColour },

  noteCard: { marginTop: t.noteCardGap },
  input: {
    minHeight: t.inputMinHeight,
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    lineHeight: t.inputLineHeight,
    color: colors.textPrimary,
    padding: 0,
    outlineWidth: 0,
  },
  deliveryRow: { marginTop: t.deliveryGap, flexDirection: 'row', alignItems: 'flex-start' },
  deliveryIcon: { marginTop: 1 },
  delivery: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.deliveryIconGap,
    fontFamily: font.appSemi,
    fontSize: t.deliverySize,
    lineHeight: t.deliveryLineHeight,
    color: t.deliveryColour,
  },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.bg },
  continue: {
    minHeight: t.continueHeight,
    borderRadius: t.continueRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { fontFamily: font.appHeading, fontSize: t.continueSize, color: ink.onBrand, flexShrink: 1 },
  continueArrow: { marginLeft: t.continueArrowGap },
  pressed: { opacity: 0.85 },
});

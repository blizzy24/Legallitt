import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  Eye,
  FileText,
  FolderOpen,
  Home,
  Info,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_PSR_SEND } from '../../../../data/advocateSide';
import { advPsrSend as t, colors, font, ink } from '../../../../constants/theme';

// Send report (design/211).
//
// ⚠ design/211's counter reads 86/300 over an 83-character message. The counter
// here is live, so it reads 83/300 until the advocate types.
//
// ⚠ The client's email is UNMASKED here and masked in design/207.
//
// ⚠ "123/4 & 45" is a THIRD khasra / survey number for this property — 123/4 in
// design/207, 312/1/4 in design/208 — and looks like design/207's khasra and its
// plot number run together.
//
// ⚠ "Ready for Dispatch" is a grey pill with a green dot, not a green chip.
//
// ⚠ BOTH DELIVERY CHANNELS ARE DRAWN SELECTED. Nothing says whether either can be
// turned off, whether one is mandatory, or what happens if both are cleared. Made
// togglable; the drawn state is both on.
//
// ⚠ The filename is clipped mid-word in design/211 with no ellipsis. Wrapped here.
//
// See data/advocateSide.ts for the full list.

export default function AdvocatePropertySearchSendScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = ADV_PSR_SEND;
  const [message, setMessage] = useState(s.message.body);
  // design/211 draws both selected.
  const [channels, setChannels] = useState<Record<string, boolean>>({ app: true, email: true });

  const toggle = (key: string) => setChannels((c) => ({ ...c, [key]: !c[key] }));

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {s.title}
        </Text>
        <View style={styles.docChip}>
          <Lock size={t.docChipIcon} color={colors.textPrimary} />
          <Text style={styles.docChipText} {...shrinkToFit(0.8)}>
            {s.docChip}
          </Text>
        </View>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.docketRow}>
          <FolderOpen size={t.docketIcon} color={t.docketColour} />
          <Text style={styles.docketText} {...shrinkToFit(0.75)}>
            {s.docket}
          </Text>
          {/* ⚠ Grey pill with a green dot, not a green chip. */}
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText} {...shrinkToFit(0.75)}>
              {s.statusChip}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {s.client.label}
            </Text>
            <View style={styles.verified}>
              <BadgeCheck size={t.verifiedIcon} color={t.verifiedColour} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.75)}>
                {s.client.verified}
              </Text>
            </View>
          </View>

          <View style={styles.nameRow}>
            <View style={styles.nameText}>
              <View style={styles.nameLine}>
                <Text style={styles.name} {...shrinkToFit(0.8)}>
                  {s.client.name}
                </Text>
                <BadgeCheck size={t.tick} color={t.verifiedColour} style={styles.tick} />
              </View>
              <Text style={styles.role}>{s.client.role}</Text>
            </View>
            <View style={styles.initials}>
              <Text style={styles.initialsText} {...shrinkToFit(0.8)}>
                {s.client.initials}
              </Text>
            </View>
          </View>

          <View style={styles.appRow}>
            <Smartphone size={t.appRowIcon} color={colors.textPrimary} />
            <Text style={styles.appRowText} {...shrinkToFit(0.8)}>
              {s.client.appRow}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {s.property.label}
            </Text>
            <View style={[styles.chip, styles.beige]}>
              <Home size={t.chipIcon} color={t.beigeColour} />
              <Text style={[styles.chipText, styles.beigeText]} {...shrinkToFit(0.75)}>
                {s.property.chip}
              </Text>
            </View>
          </View>
          <Text style={styles.addr}>{s.property.address}</Text>
          <View style={styles.khasraRow}>
            <MapPin size={t.khasraIcon} color={t.khasraColour} />
            <Text style={styles.khasra} {...shrinkToFit(0.75)}>
              {s.property.khasraLabel}{' '}
              <Text style={styles.khasraValue}>{s.property.khasra}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {s.document.label}
            </Text>
            <View style={[styles.chip, styles.green]}>
              <Check size={t.chipIcon} color={t.greenColour} strokeWidth={3} />
              <Text style={[styles.chipText, styles.greenText]} {...shrinkToFit(0.75)}>
                {s.document.chip}
              </Text>
            </View>
          </View>

          <View style={styles.fileBox}>
            <View style={styles.pdfBox}>
              <FileText size={t.pdfGlyph} color={t.pdfColour} />
            </View>
            <View style={styles.fileText}>
              {/* ⚠ Clipped in design/211. Wrapped, never ellipsized. */}
              <Text style={styles.fileName}>{s.document.file}</Text>
              <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
                {s.document.meta}
              </Text>
            </View>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.view, pressed && styles.pressed]}>
              <Eye size={t.viewIcon} color={colors.textPrimary} />
              <Text style={styles.viewText} {...shrinkToFit(0.8)}>
                {s.document.view}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            {s.message.label}
          </Text>
          <Text style={styles.sub}>{s.message.sub}</Text>
          <View style={styles.msgBox}>
            <TextInput
              style={styles.msgInput}
              value={message}
              onChangeText={setMessage}
              maxLength={s.message.max}
              multiline
              textAlignVertical="top"
            />
          </View>
          {/* ⚠ design/211 prints 86 over an 83-character message. */}
          <Text style={styles.counter} {...shrinkToFit(0.8)}>
            {message.length}/{s.message.max}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            {s.delivery.label}
          </Text>
          <Text style={styles.sub}>{s.delivery.sub}</Text>
          {s.delivery.channels.map((c, i) => {
            const on = channels[c.key];
            return (
              <Pressable
                key={c.key}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => toggle(c.key)}
                style={({ pressed }) => [
                  styles.dc,
                  i === 0 ? styles.dcFirst : styles.dcNext,
                  { backgroundColor: on ? t.dcBgOn : t.dcBgOff },
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.dcCheck, { backgroundColor: on ? t.dcCheckOn : t.dcCheckOff }]}>
                  <Check size={t.dcCheckGlyph} color={ink.onBrand} strokeWidth={3} />
                </View>
                <View style={styles.dcText}>
                  <View style={styles.dcTitleRow}>
                    <Text style={styles.dcTitle} {...shrinkToFit(0.8)}>
                      {c.title}
                    </Text>
                    <View style={styles.dcChip}>
                      <Text style={styles.dcChipText} {...shrinkToFit(0.75)}>
                        {c.chip}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dcBody}>{c.body}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {s.payment.label}
            </Text>
            <View style={[styles.chip, styles.green]}>
              <ShieldCheck size={t.chipIcon} color={t.greenColour} />
              <Text style={[styles.chipText, styles.greenText]} {...shrinkToFit(0.75)}>
                {s.payment.chip}
              </Text>
            </View>
          </View>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel} {...shrinkToFit(0.8)}>
              {s.payment.payoutLabel}
            </Text>
            <Text style={styles.payout} {...shrinkToFit(0.75)}>
              {s.payment.payout}
            </Text>
          </View>
          <View style={styles.payNote}>
            <Info size={t.payNoteIcon} color={colors.textPrimary} style={styles.payNoteIcon} />
            <Text style={styles.payNoteText}>{s.payment.note}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/property-search/${id}/sent` as Href)}
          style={({ pressed }) => [styles.send, pressed && styles.pressed]}
        >
          <Text style={styles.sendText} {...shrinkToFit(0.8)}>
            {s.send}
          </Text>
          <ArrowRight size={t.sendArrow} color={ink.onBrand} style={styles.sendArrow} />
        </Pressable>
        <Text style={styles.caption} {...shrinkToFit(0.75)}>
          {s.caption}
        </Text>
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
    marginLeft: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  docChip: {
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    backgroundColor: t.docChipBg,
    paddingHorizontal: t.docChipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  docChipText: {
    marginLeft: t.docChipIconGap,
    fontFamily: font.appSemi,
    fontSize: t.docChipSize,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  avatar: {
    marginLeft: t.docChipGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },

  docketRow: { marginTop: t.docketGap, flexDirection: 'row', alignItems: 'center' },
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
    backgroundColor: t.statusDotColour,
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
  verified: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  verifiedText: {
    marginLeft: t.verifiedGap,
    fontFamily: font.appSemi,
    fontSize: t.verifiedSize,
    color: t.verifiedColour,
    flexShrink: 1,
  },

  nameRow: { marginTop: t.nameGap, flexDirection: 'row', alignItems: 'center' },
  nameText: { flex: 1, minWidth: 0, marginRight: 12 },
  nameLine: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  tick: { marginLeft: t.tickGap },
  role: {
    marginTop: t.roleGap,
    fontFamily: font.appBody,
    fontSize: t.roleSize,
    lineHeight: t.roleLineHeight,
    color: t.roleColour,
  },
  initials: {
    width: t.initials,
    height: t.initials,
    borderRadius: t.initials / 2,
    backgroundColor: t.initialsBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontFamily: font.appSemi, fontSize: t.initialsSize, color: t.initialsColour },

  appRow: {
    marginTop: t.appRowGap,
    minHeight: t.appRowHeight,
    borderRadius: t.appRowRadius,
    backgroundColor: t.appRowBg,
    paddingHorizontal: t.appRowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appRowText: {
    marginLeft: t.appRowIconGap,
    fontFamily: font.appBody,
    fontSize: t.appRowSize,
    color: colors.textPrimary,
    flexShrink: 1,
  },

  chip: {
    marginLeft: 'auto',
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chipText: { marginLeft: t.chipIconGap, fontFamily: font.appSemi, fontSize: t.chipSize, flexShrink: 1 },
  beige: { backgroundColor: t.beigeBg },
  beigeText: { color: t.beigeColour },
  green: { backgroundColor: t.greenBg },
  greenText: { color: t.greenColour },

  addr: {
    marginTop: t.addrGap,
    fontFamily: font.appBody,
    fontSize: t.addrSize,
    lineHeight: t.addrLineHeight,
    color: colors.textPrimary,
  },
  khasraRow: { marginTop: t.khasraGap, flexDirection: 'row', alignItems: 'center' },
  khasra: {
    marginLeft: t.khasraIconGap,
    fontFamily: font.appSemi,
    fontSize: t.khasraSize,
    letterSpacing: t.khasraSpacing,
    color: t.khasraColour,
    flexShrink: 1,
  },
  khasraValue: { color: t.khasraValueColour },

  fileBox: {
    marginTop: t.fileGap,
    borderRadius: t.fileBoxRadius,
    backgroundColor: t.fileBoxBg,
    padding: t.fileBoxPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfBox: {
    width: t.pdfBox,
    height: t.pdfBox,
    borderRadius: t.pdfRadius,
    backgroundColor: t.pdfBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.pdfGap, marginRight: t.viewGap },
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
  view: {
    minHeight: t.viewHeight,
    borderRadius: t.viewRadius,
    backgroundColor: t.viewBg,
    paddingHorizontal: t.viewPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  viewText: {
    marginLeft: t.viewIconGap,
    fontFamily: font.appSemi,
    fontSize: t.viewSize,
    color: colors.textPrimary,
    flexShrink: 1,
  },

  sub: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLineHeight,
    color: t.subColour,
  },

  msgBox: {
    marginTop: t.msgGap,
    borderRadius: t.msgRadius,
    backgroundColor: t.msgBg,
    padding: t.msgPad,
  },
  msgInput: {
    minHeight: t.msgMinHeight,
    fontFamily: font.appBody,
    fontSize: t.msgSize,
    lineHeight: t.msgLineHeight,
    color: colors.textPrimary,
    padding: 0,
    outlineWidth: 0,
  },
  counter: {
    marginTop: t.counterGap,
    alignSelf: 'flex-end',
    fontFamily: font.appBody,
    fontSize: t.counterSize,
    color: t.counterColour,
  },

  dc: { borderRadius: t.dcRadius, padding: t.dcPad, flexDirection: 'row', alignItems: 'flex-start' },
  dcFirst: { marginTop: t.dcGap },
  dcNext: { marginTop: t.dcGapY },
  dcCheck: {
    width: t.dcCheck,
    height: t.dcCheck,
    borderRadius: t.dcCheck / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dcText: { flex: 1, minWidth: 0, marginLeft: t.dcCheckGap },
  dcTitleRow: { flexDirection: 'row', alignItems: 'center' },
  dcTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.dcTitleSize, color: colors.textPrimary },
  dcChip: {
    marginLeft: t.dcChipGap,
    minHeight: t.dcChipHeight,
    borderRadius: t.dcChipRadius,
    backgroundColor: t.dcChipBg,
    paddingHorizontal: t.dcChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  dcChipText: { fontFamily: font.appSemi, fontSize: t.dcChipSize, color: t.dcChipColour },
  dcBody: {
    marginTop: t.dcBodyGap,
    fontFamily: font.appBody,
    fontSize: t.dcBodySize,
    lineHeight: t.dcBodyLineHeight,
    color: t.dcBodyColour,
  },

  payoutRow: { marginTop: t.payoutGap, flexDirection: 'row', alignItems: 'center' },
  payoutLabel: { flexShrink: 1, marginRight: 10, fontFamily: font.appBody, fontSize: t.payoutLabelSize, color: colors.textPrimary },
  payout: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.payoutSize, color: colors.textPrimary },
  payNote: {
    marginTop: t.payNoteGap,
    borderRadius: t.payNoteRadius,
    backgroundColor: t.payNoteBg,
    padding: t.payNotePad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  payNoteIcon: { marginTop: 1 },
  payNoteText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.payNoteIconGap,
    fontFamily: font.appBody,
    fontSize: t.payNoteSize,
    lineHeight: t.payNoteLineHeight,
    color: colors.textPrimary,
  },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  send: {
    minHeight: t.sendHeight,
    borderRadius: t.sendRadius,
    backgroundColor: t.sendBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { fontFamily: font.appHeading, fontSize: t.sendSize, color: ink.onBrand, flexShrink: 1 },
  sendArrow: { marginLeft: t.sendArrowGap },
  caption: {
    marginTop: t.captionGap,
    marginHorizontal: t.captionInset,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.captionSize,
    color: t.captionColour,
  },
  pressed: { opacity: 0.85 },
});

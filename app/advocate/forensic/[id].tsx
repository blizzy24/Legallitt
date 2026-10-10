import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Copy,
  Eye,
  FileText,
  Fingerprint,
  Flag,
  Mail,
  MapPin,
  Phone,
  ScrollText,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_REQUEST } from '../../../data/advocateForensic';
import {
  advForensicGreen,
  advForensicRed,
  advForensicRequest as t,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Document Forensic request details (design/223).
//
// ⚠ THE ACCEPT BUTTON IS GREEN (#61B000), outside the brand palette entirely —
// the same divergence as design/206's Accept. Checked against every green already
// in the project and it matches none of them, advFirGreen included (#55A900, 12
// points apart in red). Quarantined in advForensicGreen; see advForensic.ts.
// "Decline Request" is #BA1A1A, a fifth red.
//
// ⚠ THE FEE. ₹15,000 here; design/232 pays the advocate ₹4,500. A 70% commission
// if they are the same transaction. Both stored as drawn, neither computed.
//
// ⚠ THE CLIENT IS IN MUMBAI ON +91 98765 here and in Indore (M.P.) on
// +91 98260 41298 everywhere else — and masked here, unmasked there.
//
// ⚠ "2 Evidentiary Files" here; design/224's readiness card says "3 of 3 Ready".
//
// ⚠ The header reads "Request Details" and so does design/224's.
//
// SHA-256 values are static strings. Nothing is hashed and no file is read.
// See data/advocateForensic.ts for the full conflict register.

export default function AdvocateForensicRequestScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = DF_REQUEST;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ArrowRight size={t.backIcon} color={colors.textPrimary} style={styles.backIcon} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.chip}>
              <View style={styles.chipDot} />
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {r.statusChip}
              </Text>
            </View>
            <View style={styles.ref}>
              <Text style={styles.refText} {...shrinkToFit(0.8)}>
                {r.ref}
              </Text>
              <Copy size={t.refIcon} color={t.refColour} style={styles.refIcon} />
            </View>
          </View>

          <Text style={styles.heading}>{r.heading}</Text>

          <View style={styles.fee}>
            <View style={styles.feeRow}>
              <View style={styles.feeCol}>
                <Text style={styles.feeLabel} {...shrinkToFit(0.8)}>
                  {r.fee.label}
                </Text>
                <Text style={styles.feeAmount} {...shrinkToFit(0.7)}>
                  {r.fee.amount}
                </Text>
              </View>
              <View style={styles.secured}>
                <ShieldCheck size={t.securedIcon} color={colors.brandDark} />
                <Text style={styles.securedText} {...shrinkToFit(0.75)}>
                  {r.fee.secured}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cells}>
            {r.cells.map((c) => (
              <View key={c.label} style={styles.cell}>
                <Text style={styles.cellLabel} {...shrinkToFit(0.75)}>
                  {c.label}
                </Text>
                <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                  {c.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.initials}>
              <Text style={styles.initialsText} {...shrinkToFit(0.8)}>
                {r.client.initials}
              </Text>
            </View>
            <View style={styles.clientText}>
              <View style={styles.row}>
                <Text style={styles.name} {...shrinkToFit(0.75)}>
                  {r.client.name}
                </Text>
                <BadgeCheck size={t.tick} color={t.tickColour} style={styles.tick} />
              </View>
              <Text style={styles.cli} {...shrinkToFit(0.8)}>
                {r.client.id}
              </Text>
            </View>
            <View style={styles.role}>
              <Text style={styles.roleText} {...shrinkToFit(0.8)}>
                {r.client.role}
              </Text>
            </View>
          </View>

          <View style={styles.contact}>
            <View style={styles.row}>
              <Phone size={t.contactIcon} color={colors.textPrimary} />
              <Text style={styles.contactText} {...shrinkToFit(0.75)}>
                {r.client.phone}
              </Text>
              <Text style={styles.contactTag} {...shrinkToFit(0.8)}>
                {r.client.phoneTag}
              </Text>
            </View>
            <View style={styles.contactNext}>
              <Mail size={t.contactIcon} color={colors.textPrimary} />
              <Text style={styles.contactText} {...shrinkToFit(0.7)}>
                {r.client.email}
              </Text>
              <Text style={[styles.contactTag, styles.contactTagOk]} {...shrinkToFit(0.8)}>
                {r.client.emailTag}
              </Text>
            </View>
            <View style={styles.contactNext}>
              <MapPin size={t.contactIcon} color={colors.textPrimary} />
              <Text style={styles.contactText} {...shrinkToFit(0.75)}>
                {r.client.city}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <ClipboardList size={t.stTitleIcon} color={colors.brandDark} />
            <Text style={styles.stTitle} {...shrinkToFit(0.75)}>
              {r.statement.title}
            </Text>
          </View>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>{r.statement.quote}</Text>
          </View>
        </View>

        <View style={styles.headingRow}>
          <Text style={styles.docHeading} {...shrinkToFit(0.8)}>
            {r.documents.heading}
          </Text>
          <Text style={styles.headingNote} {...shrinkToFit(0.8)}>
            {r.documents.note}
          </Text>
        </View>
        <Text style={styles.headingSub}>{r.documents.sub}</Text>

        {r.documents.rows.map((d) => {
          const questioned = d.tone === 'questioned';
          return (
            <View key={d.name} style={[styles.card, styles.docCard]}>
              <View style={styles.row}>
                <View style={[styles.docIcon, questioned ? styles.docIconQ : styles.docIconR]}>
                  <FileText
                    size={t.docIconGlyph}
                    color={questioned ? status.onRedContainer : t.chipColour}
                  />
                </View>
                <View style={styles.docText}>
                  <View style={styles.row}>
                    <Text style={styles.docName} {...shrinkToFit(0.7)}>
                      {d.name}
                    </Text>
                    <View style={[styles.docTag, questioned ? styles.docTagQ : styles.docTagR]}>
                      <Text
                        style={[styles.docTagText, questioned ? styles.docTagTextQ : styles.docTagTextR]}
                        {...shrinkToFit(0.75)}
                      >
                        {d.tag}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.docMeta} {...shrinkToFit(0.75)}>
                    {d.meta}
                  </Text>
                </View>
              </View>

              <View style={styles.note}>
                <Flag size={t.noteIcon} color={colors.brandDark} style={styles.noteIcon} />
                <Text style={styles.noteText}>{d.flag}</Text>
              </View>

              <View style={styles.hashRow}>
                {/* Static string — nothing is hashed. */}
                <Text style={styles.hash} {...shrinkToFit(0.75)}>
                  {d.hash}
                </Text>
                <Pressable accessibilityRole="button" style={styles.viewBtn}>
                  <Text style={styles.viewText} {...shrinkToFit(0.8)}>
                    {r.documents.view}
                  </Text>
                  <Eye size={t.viewIcon} color={colors.brandDark} style={styles.viewIcon} />
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={styles.card}>
          <View style={styles.row}>
            <ScrollText size={t.examIcon} color={colors.brandDark} />
            <Text style={styles.examTitle} {...shrinkToFit(0.7)}>
              {r.exam.title}
            </Text>
            <View style={styles.examTag}>
              <Text style={styles.examTagText} {...shrinkToFit(0.8)}>
                {r.exam.tag}
              </Text>
            </View>
          </View>

          <View style={styles.examBox}>
            <View style={styles.row}>
              <View style={styles.examDot} />
              <Text style={styles.examItem} {...shrinkToFit(0.75)}>
                {r.exam.item}
              </Text>
            </View>
            <Text style={styles.examBody}>{r.exam.body}</Text>
            <View style={styles.proto}>
              <Text style={styles.protoLabel} {...shrinkToFit(0.8)}>
                {r.exam.protoLabel}
              </Text>
              <Text style={styles.protoValue} {...shrinkToFit(0.8)}>
                {r.exam.protoValue}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        {/* ⚠ #61B000 — outside the brand palette. See advForensic.ts. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/forensic/documents?id=${id}` as Href)}
          style={({ pressed }) => [styles.accept, pressed && styles.pressed]}
        >
          <Text style={styles.acceptText} {...shrinkToFit(0.8)}>
            {r.accept}
          </Text>
          <ArrowRight size={t.acceptArrow} color={ink.onBrand} style={styles.acceptArrow} />
        </Pressable>
        <View style={styles.secRow}>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.sec, pressed && styles.pressed]}>
            <Text style={styles.secText} {...shrinkToFit(0.8)}>
              {r.more}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.sec, pressed && styles.pressed]}>
            <Text style={[styles.secText, styles.declineText]} {...shrinkToFit(0.8)}>
              {r.decline}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  backIcon: { transform: [{ rotate: '180deg' }] },
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
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },
  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  docCard: { marginTop: t.docGap },
  row: { flexDirection: 'row', alignItems: 'center' },

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
  ref: {
    marginLeft: 'auto',
    minHeight: t.refHeight,
    borderRadius: t.refRadius,
    backgroundColor: t.refBg,
    paddingHorizontal: t.refPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  refText: { fontFamily: font.mono, fontSize: t.refSize, color: t.refColour, flexShrink: 1 },
  refIcon: { marginLeft: t.refIconGap },

  heading: { marginTop: t.titleGap, fontFamily: font.appHeading, fontSize: t.titleBigSize, lineHeight: t.titleBigLineHeight, color: colors.textPrimary },

  fee: { marginTop: t.feeGap, borderRadius: t.feeRadius, backgroundColor: t.feeBg, padding: t.feePad },
  feeRow: { flexDirection: 'row', alignItems: 'center' },
  feeCol: { flex: 1, minWidth: 0, marginRight: 10 },
  feeLabel: { fontFamily: font.appSemi, fontSize: t.feeLabelSize, color: t.feeLabelColour },
  feeAmount: { marginTop: t.feeAmountGap, fontFamily: font.appHeading, fontSize: t.feeAmountSize, color: colors.textPrimary },
  secured: {
    minHeight: t.securedHeight,
    borderRadius: t.securedRadius,
    backgroundColor: t.securedBg,
    paddingHorizontal: t.securedPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  securedText: { marginLeft: t.securedIconGap, fontFamily: font.appBody, fontSize: t.securedSize, color: colors.textPrimary, flexShrink: 1 },

  cells: { marginTop: t.cellsGap, flexDirection: 'row', flexWrap: 'wrap', gap: t.cellGapY },
  cell: { width: '48%', flexGrow: 1, borderRadius: t.cellRadius, backgroundColor: t.cellBg, padding: t.cellPad },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: t.cellLabelColour },
  cellValue: { marginTop: t.cellValueGap, fontFamily: font.appHeading, fontSize: t.cellValueSize, color: colors.textPrimary },

  initials: {
    width: t.initials,
    height: t.initials,
    borderRadius: t.initials / 2,
    backgroundColor: t.initialsBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontFamily: font.appSemi, fontSize: t.initialsSize, color: t.initialsColour },
  clientText: { flex: 1, minWidth: 0, marginHorizontal: t.initialsGapX },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  tick: { marginLeft: t.tickGap },
  cli: { marginTop: t.cliGap, fontFamily: font.appBody, fontSize: t.cliSize, color: t.cliColour },
  role: {
    minHeight: t.roleHeight,
    borderRadius: t.roleRadius,
    backgroundColor: t.roleBg,
    paddingHorizontal: t.rolePadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  roleText: { fontFamily: font.appBody, fontSize: t.roleSize, color: t.roleColour },

  contact: { marginTop: t.contactGap, borderRadius: t.contactRadius, backgroundColor: t.contactBg, padding: t.contactPad },
  contactNext: { marginTop: t.contactRowGapY, flexDirection: 'row', alignItems: 'center' },
  contactText: { marginLeft: t.contactIconGap, flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appBody, fontSize: t.contactSize, color: colors.textPrimary },
  contactTag: { fontFamily: font.appSemi, fontSize: t.contactTagSize, color: t.contactTagColour, flexShrink: 1 },
  contactTagOk: { color: t.contactTagOk },

  stTitle: { marginLeft: t.stTitleIconGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.stTitleSize, color: colors.textPrimary },
  quote: { marginTop: t.quoteGap, borderRadius: t.quoteRadius, backgroundColor: t.quoteBg, padding: t.quotePad },
  quoteText: { fontFamily: font.appBody, fontStyle: 'italic', fontSize: t.quoteSize, lineHeight: t.quoteLineHeight, color: colors.textPrimary },

  headingRow: { marginTop: t.headingGap, flexDirection: 'row', alignItems: 'center' },
  docHeading: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.headingSize, color: colors.textPrimary },
  headingNote: { marginLeft: 'auto', fontFamily: font.appSemi, fontSize: t.headingNoteSize, color: t.headingNoteColour, flexShrink: 1 },
  headingSub: { marginTop: t.headingSubGap, fontFamily: font.appBody, fontSize: t.headingSubSize, color: t.headingSubColour },

  docIcon: { width: t.docIcon, height: t.docIcon, borderRadius: t.docIconRadius, alignItems: 'center', justifyContent: 'center' },
  docIconQ: { backgroundColor: status.redContainer },
  docIconR: { backgroundColor: t.chipBg },
  docText: { flex: 1, minWidth: 0, marginLeft: t.docIconGap },
  docName: { flexShrink: 1, marginRight: 8, fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docTag: {
    marginLeft: 'auto',
    minHeight: t.docTagHeight,
    borderRadius: t.docTagRadius,
    paddingHorizontal: t.docTagPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  docTagQ: { backgroundColor: status.redContainer },
  docTagR: { backgroundColor: t.chipBg },
  docTagText: { fontFamily: font.appSemi, fontSize: t.docTagSize },
  docTagTextQ: { color: advForensicRed.declineColour },
  docTagTextR: { color: t.chipColour },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: t.docMetaColour },

  note: { marginTop: t.noteGap, borderRadius: t.noteRadius, backgroundColor: t.noteBg, padding: t.notePad, flexDirection: 'row', alignItems: 'flex-start' },
  noteIcon: { marginTop: 1 },
  noteText: { flex: 1, minWidth: 0, marginLeft: t.noteIconGap, fontFamily: font.appBody, fontSize: t.noteSize, color: colors.textPrimary },

  hashRow: { marginTop: t.hashGap, flexDirection: 'row', alignItems: 'center' },
  hash: { flexShrink: 1, marginRight: 10, fontFamily: font.mono, fontSize: t.hashSize, color: t.hashColour },
  viewBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  viewText: { fontFamily: font.appSemi, fontSize: t.viewSize, color: colors.brandDark, flexShrink: 1 },
  viewIcon: { marginLeft: t.viewIconGap },

  examTitle: { marginLeft: t.examIconGap, flexShrink: 1, marginRight: 8, fontFamily: font.appHeading, fontSize: t.headingSize, color: colors.textPrimary },
  examTag: {
    marginLeft: 'auto',
    minHeight: t.examTagHeight,
    borderRadius: t.examTagRadius,
    backgroundColor: t.examTagBg,
    paddingHorizontal: t.examTagPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  examTagText: { fontFamily: font.appSemi, fontSize: t.examTagSize, color: t.examTagColour },
  examBox: { marginTop: t.examBoxGap, borderRadius: t.examBoxRadius, backgroundColor: t.examBoxBg, padding: t.examBoxPad },
  examDot: { width: t.examDot, height: t.examDot, borderRadius: t.examDot / 2, backgroundColor: colors.brandDark, marginRight: t.examDotGap },
  examItem: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.examItemSize, color: colors.textPrimary },
  examBody: { marginTop: t.examBodyGap, fontFamily: font.appBody, fontSize: t.examBodySize, lineHeight: t.examBodyLineHeight, color: colors.textPrimary },
  proto: {
    marginTop: t.protoGap,
    minHeight: t.protoHeight,
    borderRadius: t.protoRadius,
    backgroundColor: t.protoBg,
    paddingHorizontal: t.protoPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  protoLabel: { flexShrink: 1, marginRight: 8, fontFamily: font.appBody, fontSize: t.protoSize, color: t.protoColour },
  protoValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appSemi, fontSize: t.protoSize, color: colors.textPrimary },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  accept: {
    minHeight: t.acceptHeight,
    borderRadius: t.acceptRadius,
    backgroundColor: advForensicGreen.acceptBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: { fontFamily: font.appHeading, fontSize: t.acceptSize, color: ink.onBrand, flexShrink: 1 },
  acceptArrow: { marginLeft: t.acceptArrowGap },
  secRow: { marginTop: t.secGap, flexDirection: 'row', gap: t.secGapX },
  sec: {
    flex: 1,
    minWidth: 0,
    minHeight: t.secHeight,
    borderRadius: t.secRadius,
    backgroundColor: t.secBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  secText: { fontFamily: font.appHeading, fontSize: t.secSize, color: colors.textPrimary, flexShrink: 1 },
  declineText: { color: advForensicRed.declineColour },
  pressed: { opacity: 0.85 },
});

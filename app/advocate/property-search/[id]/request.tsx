import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  EllipsisVertical,
  Eye,
  FileSearch,
  FileText,
  Home,
  IdCard,
  Lock,
  Mail,
  Phone,
  Quote,
  ScrollText,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEV_PREVIEW_TOGGLES } from '../../../../constants/dev';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_PSR_PROPERTY_REQUEST, ADV_PSR_REQUEST } from '../../../../data/advocateSide';
import {
  advPsrRequest as t,
  colors,
  font,
  ink,
  psrDecision,
} from '../../../../constants/theme';

// Property search request (designs 206 and 207) — one screen, two states.
//
// ⚠⚠ THE PROPERTY HERE IS NOT THE PROPERTY IN design/208. Same journey, different
// land: owner, acquisition, scheme, khasra, plot, village and reference all differ.
// On a title-verification product the property is the deliverable. Rendered exactly
// as design/206/207 draw it; see the table in data/advocateSide.ts.
//
// ⚠ design/207 contradicts itself too: its address line reads "Plot No. 42" while
// its own Plot Number cell reads "45".
//
// ⚠ Your Payout ₹3,800 on ₹4,500 is 15.56% withheld, which no established rate
// produces. Stored as drawn and NOT computed.
//
// ⚠ Accept and Reject use a near-fluorescent green and a salmon that appear nowhere
// else in the app. Sampled from design/206 and quarantined in
// constants/tokens/psrDecision.ts.
//
// ⚠ Measured from design/207; design/206 is a 0.474 px/pt mockup, used only for
// those two colours. The accepted state is reachable via Accept and, since nothing
// else in the prototype can change it back, via DEV_PREVIEW_TOGGLES.

export default function AdvocatePsrRequestScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = ADV_PSR_REQUEST;
  const p = ADV_PSR_PROPERTY_REQUEST;
  const [accepted, setAccepted] = useState(false);

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
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="More" hitSlop={8}>
          <EllipsisVertical size={t.kebab} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.docketRow}>
            <Text style={styles.docket} {...shrinkToFit(0.7)}>
              {p.docket}
            </Text>
            <View style={styles.status}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: accepted
                      ? t.statusAcceptedColour
                      : t.statusPendingColour,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: accepted ? t.statusAcceptedColour : t.statusPendingColour,
                  },
                ]}
                {...shrinkToFit(0.75)}
              >
                {accepted ? r.statusAccepted : r.statusPending}
              </Text>
            </View>
          </View>

          <View style={styles.reportRow}>
            <FileSearch size={t.reportIcon} color={colors.brandDark} />
            <Text style={styles.reportTitle} {...shrinkToFit(0.7)}>
              {r.reportTitle}
            </Text>
          </View>

          <View style={styles.brief}>
            <Text style={styles.briefText}>
              {accepted ? (
                <>
                  Request accepted on{' '}
                  <Text style={styles.briefBold}>{r.acceptedOn}</Text>. Review client facts
                  and certified documents below to conduct off-platform registry search.
                </>
              ) : (
                r.briefPending
              )}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.labelIcon}>
              <UserRound size={t.labelIconGlyph} color={colors.textPrimary} />
            </View>
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {r.client.label}
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {r.client.chip}
              </Text>
            </View>
          </View>

          <View style={styles.clientRow}>
            <View style={styles.clientText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.7)}>
                  {r.client.name}
                </Text>
                <BadgeCheck size={t.nameTick} color="#1E9E4A" style={styles.nameTick} />
              </View>
              <Text style={styles.role}>{r.client.role}</Text>
            </View>
            <View style={styles.initials}>
              <Text style={styles.initialsText}>{r.client.initials}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Phone size={t.fieldIcon} color={colors.textPrimary} />
            <Text style={styles.fieldValue} {...shrinkToFit(0.7)}>
              {r.client.phone}
            </Text>
            <Text style={styles.fieldChip} {...shrinkToFit(0.8)}>
              {r.client.phoneChip}
            </Text>
          </View>
          <View style={styles.field}>
            <Mail size={t.fieldIcon} color={colors.textPrimary} />
            <Text style={styles.fieldValue} {...shrinkToFit(0.65)}>
              {r.client.email}
            </Text>
            <Text style={styles.fieldChip} {...shrinkToFit(0.8)}>
              {r.client.emailChip}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.labelIcon}>
              <Home size={t.labelIconGlyph} color={colors.textPrimary} />
            </View>
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {r.propertyLabel}
            </Text>
            <View style={styles.chip}>
              <Home size={t.chipIcon} color={t.chipColour} />
              <Text style={[styles.chipText, styles.chipTextIcon]} {...shrinkToFit(0.75)}>
                {p.typeChip}
              </Text>
            </View>
          </View>

          <View style={styles.addrBlock}>
            <Text style={styles.addrLabel} {...shrinkToFit(0.8)}>
              {p.addressLabel}
            </Text>
            {/* ⚠ Says Plot No. 42; the Plot Number cell says 45. Both as drawn. */}
            <Text style={styles.addr}>{p.address}</Text>
          </View>

          <View style={styles.cells}>
            {p.cells.map((c) => (
              <View key={c.label} style={styles.cell}>
                <Text style={styles.cellLabel} {...shrinkToFit(0.7)}>
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
          <View style={styles.labelRow}>
            <View style={styles.labelIcon}>
              <IdCard size={t.labelIconGlyph} color={colors.textPrimary} />
            </View>
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {r.ownerLabel}
            </Text>
          </View>

          <View style={styles.ownerBlock}>
            <Text style={styles.ownerLabel} {...shrinkToFit(0.8)}>
              {p.owners.label}
            </Text>
            <Text style={styles.ownerName}>{p.owners.names}</Text>
            <Text style={styles.ownerType} {...shrinkToFit(0.75)}>
              {p.owners.holderType}
            </Text>
          </View>

          <View style={styles.ownerBlock}>
            <View style={styles.acqRow}>
              <ScrollText size={t.acqIcon} color={colors.brandDark} />
              <View style={styles.acqText}>
                <Text style={styles.acqLabel} {...shrinkToFit(0.8)}>
                  {p.owners.acquisitionLabel}
                </Text>
                <Text style={styles.acqValue}>{p.owners.acquisition}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.quoteIcon}>
              <Quote size={t.quoteIconSize} color={colors.textPrimary} />
            </View>
            <Text style={styles.label} {...shrinkToFit(0.7)}>
              {r.requirement.label}
            </Text>
          </View>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>{r.requirement.quote}</Text>
          </View>
          <View style={styles.submitted}>
            <Text style={styles.submittedLabel} {...shrinkToFit(0.75)}>
              {r.requirement.submittedLabel}
            </Text>
            <Text style={styles.submittedValue} {...shrinkToFit(0.75)}>
              {r.requirement.submittedOn}
            </Text>
          </View>
        </View>

        <View style={styles.docsLabelRow}>
          <Text style={styles.label} {...shrinkToFit(0.75)}>
            {r.documents.label}
          </Text>
          <Text style={styles.vault} {...shrinkToFit(0.8)}>
            {r.documents.vault}
          </Text>
        </View>

        {/* ⚠ Names and source labels are clipped in design/207; completed by
            inference — see data/advocateSide.ts. */}
        {r.documents.rows.map((d) => (
          <View key={d.name} style={styles.docRow}>
            <View style={styles.docIcon}>
              <FileText size={t.docIconGlyph} color={t.docIconColour} />
            </View>
            <View style={styles.docText}>
              <Text style={styles.docName} {...shrinkToFit(0.65)}>
                {d.name}
              </Text>
              <Text style={styles.docMeta} {...shrinkToFit(0.7)}>
                {d.meta}
              </Text>
            </View>
            <Pressable accessibilityRole="button" style={styles.view}>
              <Eye size={t.viewIcon} color={colors.textPrimary} />
              <Text style={styles.viewText} {...shrinkToFit(0.8)}>
                {r.documents.view}
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.labelIcon}>
              <Wallet size={t.labelIconGlyph} color={colors.textPrimary} />
            </View>
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {r.payment.label}
            </Text>
            <View style={styles.escrow}>
              <Lock size={t.chipIcon} color="#1E7A44" />
              <Text style={styles.escrowText} {...shrinkToFit(0.75)}>
                {r.payment.chip}
              </Text>
            </View>
          </View>

          <View style={styles.payCells}>
            <View style={styles.payCell}>
              <Text style={styles.payLabel} {...shrinkToFit(0.75)}>
                {r.payment.paidLabel}
              </Text>
              <Text style={styles.payValue} {...shrinkToFit(0.75)}>
                {r.payment.paid}
              </Text>
            </View>
            <View style={[styles.payCell, styles.payoutCell]}>
              <Text style={styles.payLabel} {...shrinkToFit(0.75)}>
                {r.payment.payoutLabel}
              </Text>
              {/* ⚠ As drawn. Not computed — see the note at the top. */}
              <Text style={styles.payoutValue} {...shrinkToFit(0.7)}>
                {r.payment.payout}
              </Text>
            </View>
          </View>

          <View style={styles.payNote}>
            <ShieldCheck size={t.payNoteIcon} color={colors.textBody} />
            <Text style={styles.payNoteText}>{r.payment.note}</Text>
          </View>
        </View>

        {/* Development only — nothing else in the prototype can undo acceptance. */}
        {DEV_PREVIEW_TOGGLES && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setAccepted((v) => !v)}
            style={styles.devLink}
          >
            <Text style={styles.devLinkText}>
              {accepted
                ? 'Preview state: request pending (design/206)'
                : 'Preview state: accepted (design/207)'}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        {accepted ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/property-search/${id}/editor` as Href)}
            style={({ pressed }) => [styles.btn, styles.cta, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText} {...shrinkToFit(0.75)}>
              {r.continue}
            </Text>
            <ArrowRight size={t.ctaIcon} color={ink.onBrand} style={styles.ctaIcon} />
          </Pressable>
        ) : (
          <View style={styles.btnRow}>
            {/* ⚠ Quarantined colours — see constants/tokens/psrDecision.ts. */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setAccepted(true)}
              style={({ pressed }) => [styles.btn, styles.accept, pressed && styles.pressed]}
            >
              <Text style={styles.acceptText} {...shrinkToFit(0.8)}>
                {r.accept}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => (router.canGoBack() ? router.back() : null)}
              style={({ pressed }) => [styles.btn, styles.reject, pressed && styles.pressed]}
            >
              <Text style={styles.rejectText} {...shrinkToFit(0.8)}>
                {r.reject}
              </Text>
            </Pressable>
          </View>
        )}
        <Text style={styles.cap} {...shrinkToFit(0.7)}>
          {r.caption}
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
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
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
    marginLeft: t.kebabGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 28 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  docketRow: { flexDirection: 'row', alignItems: 'center' },
  docket: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.docketSize,
    letterSpacing: t.docketSpacing,
    color: colors.brandDark,
  },
  status: {
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    backgroundColor: t.statusBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  statusDot: {
    width: t.statusDot,
    height: t.statusDot,
    borderRadius: t.statusDot / 2,
    marginRight: t.statusDotGap,
  },
  statusText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.statusSize },

  reportRow: { marginTop: t.reportGap, flexDirection: 'row', alignItems: 'center' },
  reportTitle: {
    marginLeft: t.reportIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.reportTitleSize,
    color: colors.textPrimary,
  },
  brief: {
    marginTop: t.briefGap,
    borderRadius: t.briefRadius,
    backgroundColor: t.briefBg,
    padding: t.briefPad,
  },
  briefText: {
    fontFamily: font.appBody,
    fontSize: t.briefSize,
    lineHeight: t.briefLineHeight,
    color: colors.textPrimary,
  },
  briefBold: { fontFamily: font.appHeading },

  labelRow: { flexDirection: 'row', alignItems: 'center' },
  labelIcon: {
    width: t.labelIcon,
    height: t.labelIcon,
    borderRadius: t.labelIconRadius,
    backgroundColor: t.labelIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginLeft: t.labelIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textPrimary,
  },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chipText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.chipSize, color: t.chipColour },
  chipTextIcon: { marginLeft: t.chipIconGap },
  escrow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  escrowText: {
    marginLeft: t.chipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    color: '#1E7A44',
  },

  clientRow: { marginTop: t.nameGap, flexDirection: 'row', alignItems: 'center' },
  clientText: { flex: 1, minWidth: 0, marginRight: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  nameTick: { marginLeft: t.nameTickGap },
  role: {
    marginTop: t.roleGap,
    fontFamily: font.appBody,
    fontSize: t.roleSize,
    lineHeight: t.roleLineHeight,
    color: colors.brandDark,
  },
  initials: {
    width: t.initials,
    height: t.initials,
    borderRadius: t.initials / 2,
    backgroundColor: t.initialsBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontFamily: font.appSemi, fontSize: t.initialsText, color: colors.brandDark },

  field: {
    marginTop: t.fieldGap,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    padding: t.fieldPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldValue: {
    marginLeft: t.fieldIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.fieldSize,
    color: colors.textPrimary,
  },
  fieldChip: { fontFamily: font.appSemi, fontSize: t.fieldChipSize, color: colors.textBody },

  addrBlock: {
    marginTop: t.fieldGap,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    padding: t.fieldPad,
  },
  addrLabel: { fontFamily: font.appSemi, fontSize: t.addrLabelSize, color: colors.brandDark },
  addr: {
    marginTop: t.addrGap,
    fontFamily: font.appHeading,
    fontSize: t.addrSize,
    lineHeight: t.addrLineHeight,
    color: colors.textPrimary,
  },

  cells: {
    marginTop: t.cellGapY,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.cellGapX,
    rowGap: t.cellGapY,
  },
  cell: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: '45%',
    borderRadius: t.cellRadius,
    backgroundColor: t.cellBg,
    padding: t.cellPad,
  },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: colors.brandDark },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: colors.textPrimary,
  },

  ownerBlock: {
    marginTop: t.ownerBlockGap,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    padding: t.fieldPad,
  },
  ownerLabel: { fontFamily: font.appSemi, fontSize: t.ownerLabelSize, color: colors.brandDark },
  ownerName: {
    marginTop: t.ownerNameGap,
    fontFamily: font.appHeading,
    fontSize: t.ownerNameSize,
    lineHeight: t.ownerNameLineHeight,
    color: colors.textPrimary,
  },
  ownerType: { marginTop: t.ownerTypeGap, fontFamily: font.appBody, fontSize: t.ownerTypeSize, color: colors.textBody },
  acqRow: { flexDirection: 'row' },
  acqText: { marginLeft: t.acqIconGap, flex: 1, minWidth: 0 },
  acqLabel: { fontFamily: font.appSemi, fontSize: t.acqLabelSize, color: colors.brandDark },
  acqValue: {
    marginTop: t.acqValueGap,
    fontFamily: font.appHeading,
    fontSize: t.acqValueSize,
    lineHeight: t.acqValueLineHeight,
    color: colors.textPrimary,
  },

  quoteIcon: {
    width: t.quoteIcon,
    height: t.quoteIcon,
    borderRadius: t.quoteIconRadius,
    backgroundColor: t.quoteIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quote: {
    marginTop: t.quoteGap,
    borderRadius: t.quoteRadius,
    backgroundColor: t.quoteBg,
    padding: t.quotePad,
  },
  quoteText: {
    fontFamily: font.appBody,
    fontStyle: 'italic',
    fontSize: t.quoteSize,
    lineHeight: t.quoteLineHeight,
    color: colors.textPrimary,
  },
  submitted: {
    marginTop: t.submittedGap,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    padding: t.submittedPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submittedLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.submittedSize,
    color: colors.textBody,
  },
  submittedValue: { fontFamily: font.appHeading, fontSize: t.submittedSize, color: colors.textPrimary },

  docsLabelRow: {
    marginBottom: t.cardGap - 2,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vault: { fontFamily: font.appBody, fontSize: t.docsVaultSize, color: colors.textBody },
  docRow: {
    marginBottom: t.docRowGap,
    borderRadius: t.docRowRadius,
    backgroundColor: colors.card,
    padding: t.docRowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  view: {
    minHeight: t.viewHeight,
    borderRadius: t.viewRadius,
    paddingHorizontal: t.viewPadX,
    backgroundColor: t.viewBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: { marginLeft: t.viewIconGap, fontFamily: font.appBody, fontSize: t.viewSize, color: colors.textPrimary },

  payCells: { marginTop: t.payCellGap, flexDirection: 'row', gap: t.payCellGapX },
  payCell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.payCellRadius,
    backgroundColor: t.payCellBg,
    padding: t.payCellPad,
  },
  payoutCell: { backgroundColor: t.payoutBg },
  payLabel: { fontFamily: font.appBody, fontSize: t.payLabelSize, color: colors.brandDark },
  payValue: {
    marginTop: t.payValueGap,
    fontFamily: font.appHeading,
    fontSize: t.payValueSize,
    color: colors.textPrimary,
  },
  payoutValue: {
    marginTop: t.payValueGap,
    fontFamily: font.appHeading,
    fontSize: t.payoutValueSize,
    color: colors.textPrimary,
  },
  payNote: {
    marginTop: t.payNoteGap,
    borderRadius: t.payNoteRadius,
    backgroundColor: t.payNoteBg,
    padding: t.payNotePad,
    flexDirection: 'row',
  },
  payNoteText: {
    marginLeft: t.payNoteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.payNoteSize,
    lineHeight: t.payNoteLineHeight,
    color: colors.textPrimary,
  },

  devLink: { marginTop: 18, alignItems: 'center' },
  devLinkText: { fontFamily: font.appBody, fontSize: 12, color: colors.textBody },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  btnRow: { flexDirection: 'row', gap: t.btnGapX },
  btn: {
    flex: 1,
    minWidth: 0,
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  accept: { backgroundColor: psrDecision.acceptBg },
  acceptText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: psrDecision.acceptColour },
  reject: { backgroundColor: psrDecision.rejectBg },
  rejectText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: psrDecision.rejectColour },
  cta: { backgroundColor: t.ctaBg },
  ctaText: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand },
  ctaIcon: { marginLeft: t.ctaIconGap },
  cap: {
    marginTop: t.capGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.capSize,
    color: colors.brandDark,
  },
  pressed: { opacity: 0.85 },
});

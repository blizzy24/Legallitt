import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowRight, BadgeCheck, Check, ChevronLeft, Eye, FileText, UserRound } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { FIR_DOCUMENTS } from '../../../data/advocateFir';
import { advFirDocuments as t, colors, font, ink, status } from '../../../constants/theme';
import { advDocHref } from '../../../data/docLinks';

// Review documents (design/216).
//
// ⚠ FOUR FILES HERE, FIVE ON design/215, with entirely different names, for the
// same request one screen earlier. design/215 lists Written Complaint Statement,
// Vehicle Damage & CCTV Stills, Complainant Aadhaar Card, Witness Statement and
// Shop Lease Agreement; this screen lists Complaint, Case Papers, ID Proof and
// Supporting Document. design/217 then says "5 Attached" and design/219 says "4
// Files Attached". Both lists are stored, each on the screen that draws it.
// See data/advocateFir.ts note 4.
//
// ⚠ The PDF icon tile is status.redContainer — the design/210 red, which by this
// screen had appeared on four screens and is now in the shared palette.
//
// ⚠ The incident date is in the future. Note 5. The mobile is unmasked. Note 6.

function FixtureAdvocateFirDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const d = FIR_DOCUMENTS;

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
          {d.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.accept}>
          <View style={styles.acceptHead}>
            <View style={styles.acceptTick}>
              <Check size={t.acceptTickGlyph} color={colors.textPrimary} strokeWidth={3} />
            </View>
            <Text style={styles.acceptTitle} {...shrinkToFit(0.8)}>
              {d.accepted.title}
            </Text>
          </View>
          <Text style={styles.acceptBody}>{d.accepted.body}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {d.client.label}
            </Text>
            <View style={styles.vchip}>
              <BadgeCheck size={t.vchipIcon} color={t.vchipColour} />
              <Text style={styles.vchipText} {...shrinkToFit(0.75)}>
                {d.client.chip}
              </Text>
            </View>
          </View>
          <View style={styles.clientRow}>
            <View style={styles.initials}>
              <Text style={styles.initialsText} {...shrinkToFit(0.8)}>
                {d.client.initials}
              </Text>
            </View>
            <View style={styles.clientText}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {d.client.name}
              </Text>
              <Text style={styles.meta} {...shrinkToFit(0.75)}>
                {d.client.meta}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headingRow}>
          <Text style={styles.heading} {...shrinkToFit(0.8)}>
            {d.documents.heading}
          </Text>
          <View style={styles.filesChip}>
            <Text style={styles.filesChipText} {...shrinkToFit(0.8)}>
              {d.documents.chip}
            </Text>
          </View>
        </View>

        {d.documents.rows.map((row) => (
          <View key={row.name} style={styles.doc}>
            <View style={styles.docIconBox}>
              <FileText size={t.docIconGlyph} color={status.onRedContainer} />
            </View>
            <View style={styles.docText}>
              <Text style={styles.docName} {...shrinkToFit(0.7)}>
                {row.name}
              </Text>
              <Text style={styles.docMeta} {...shrinkToFit(0.8)}>
                {row.meta}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(advDocHref(row.name) as Href)}
              style={({ pressed }) => [styles.docView, pressed && styles.pressed]}
            >
              <Eye size={t.docViewIcon} color={colors.textPrimary} />
              <Text style={styles.docViewText} {...shrinkToFit(0.8)}>
                {d.documents.view}
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.headingRow}>
          <Text style={styles.heading} {...shrinkToFit(0.8)}>
            {d.info.heading}
          </Text>
        </View>
        <View style={[styles.card, styles.infoCard]}>
          {d.info.rows.map((row, i) => (
            <Fragment key={row.label}>
              {i > 0 && <View style={styles.divider} />}
              <View style={i > 0 ? styles.infoRowNext : undefined}>
                <Text style={styles.infoLabel} {...shrinkToFit(0.8)}>
                  {row.label}
                </Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            </Fragment>
          ))}
        </View>

        <View style={styles.headingRow}>
          <Text style={styles.heading} {...shrinkToFit(0.8)}>
            {d.description.heading}
          </Text>
          <View style={styles.descChip}>
            <Text style={styles.descChipText} {...shrinkToFit(0.75)}>
              {d.description.chip}
            </Text>
          </View>
        </View>
        <View style={[styles.card, styles.infoCard]}>
          <Text style={styles.desc}>{d.description.body}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/fir/generator?id=${id ?? ''}` as Href)}
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
        >
          <Text style={styles.continueText} {...shrinkToFit(0.8)}>
            {d.continue}
          </Text>
          <ArrowRight size={t.continueArrow} color={ink.onBrand} style={styles.continueArrow} />
        </Pressable>
        <Text style={styles.cap} {...shrinkToFit(0.75)}>
          {d.caption}
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

  accept: { borderRadius: t.acceptRadius, backgroundColor: t.acceptBg, padding: t.acceptPad },
  acceptHead: { flexDirection: 'row', alignItems: 'center' },
  acceptTick: {
    width: t.acceptTick,
    height: t.acceptTick,
    borderRadius: t.acceptTick / 2,
    backgroundColor: t.acceptTickBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptTitle: {
    marginLeft: t.acceptTickGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.acceptTitleSize,
    color: colors.textPrimary,
  },
  acceptBody: {
    marginTop: t.acceptBodyGap,
    fontFamily: font.appBody,
    fontSize: t.acceptBodySize,
    lineHeight: t.acceptBodyLineHeight,
    color: t.acceptBodyColour,
  },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  infoCard: { marginTop: t.docGap },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: {
    flexShrink: 1,
    marginRight: 10,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: t.labelColour,
  },
  vchip: {
    marginLeft: 'auto',
    minHeight: t.vchipHeight,
    borderRadius: t.vchipRadius,
    backgroundColor: t.vchipBg,
    paddingHorizontal: t.vchipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  vchipText: { marginLeft: t.vchipIconGap, fontFamily: font.appSemi, fontSize: t.vchipSize, color: t.vchipColour, flexShrink: 1 },

  clientRow: { marginTop: t.initialsGap, flexDirection: 'row', alignItems: 'center' },
  initials: {
    width: t.initials,
    height: t.initials,
    borderRadius: t.initials / 2,
    backgroundColor: t.initialsBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontFamily: font.appSemi, fontSize: t.initialsSize, color: t.initialsColour },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.initialsGapX },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  meta: { marginTop: t.metaGap, fontFamily: font.appBody, fontSize: t.metaSize, color: t.metaColour },

  headingRow: { marginTop: t.headingGap, flexDirection: 'row', alignItems: 'center' },
  heading: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.headingSize, color: colors.textPrimary },
  filesChip: {
    marginLeft: 'auto',
    minHeight: t.filesChipHeight,
    borderRadius: t.filesChipRadius,
    backgroundColor: t.filesChipBg,
    paddingHorizontal: t.filesChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  filesChipText: { fontFamily: font.appSemi, fontSize: t.filesChipSize, color: t.filesChipColour },

  doc: {
    marginTop: t.docGapY,
    borderRadius: t.docRadius,
    backgroundColor: t.cardBg,
    padding: t.docPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIconBox: {
    width: t.docIconBox,
    height: t.docIconBox,
    borderRadius: t.docIconRadius,
    backgroundColor: status.redContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginHorizontal: t.docIconGap },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: t.docMetaColour },
  docView: {
    minHeight: t.docViewHeight,
    borderRadius: t.docViewRadius,
    backgroundColor: t.docViewBg,
    paddingHorizontal: t.docViewPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  docViewText: { marginLeft: t.docViewIconGap, fontFamily: font.appSemi, fontSize: t.docViewSize, color: colors.textPrimary, flexShrink: 1 },

  infoRowNext: { marginTop: t.infoRowGap },
  infoLabel: { fontFamily: font.appBody, fontSize: t.infoLabelSize, color: t.infoLabelColour },
  infoValue: {
    marginTop: t.infoValueGap,
    fontFamily: font.appBody,
    fontSize: t.infoValueSize,
    lineHeight: t.infoValueLineHeight,
    color: colors.textPrimary,
  },
  divider: { marginTop: t.infoDividerGap, height: 1, backgroundColor: t.infoDivider },

  descChip: {
    marginLeft: 'auto',
    minHeight: t.descChipHeight,
    borderRadius: t.descChipRadius,
    backgroundColor: t.descChipBg,
    paddingHorizontal: t.descChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  descChipText: { fontFamily: font.appSemi, fontSize: t.descChipSize, color: t.descChipColour },
  desc: { fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: colors.textPrimary },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  continue: {
    minHeight: t.continueHeight,
    borderRadius: t.continueRadius,
    backgroundColor: t.continueBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { fontFamily: font.appHeading, fontSize: t.continueSize, color: ink.onBrand, flexShrink: 1 },
  continueArrow: { marginLeft: t.continueArrowGap },
  cap: { marginTop: t.capGap, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, color: t.capColour },
  pressed: { opacity: 0.85 },
});
import FirAdvocate from '../../../features/fir/FirAdvocate';
import {DATA_SOURCE} from '../../../lib/data-source';
export default function LiveFirScreen() { return DATA_SOURCE === 'api' ? <FirAdvocate/> : <FixtureAdvocateFirDocumentsScreen/>; }

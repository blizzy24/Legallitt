import { previewNotice } from '../../components/PreviewNotice';
import DemoPressable from '../../components/DemoPressable';
import { router, type Href } from 'expo-router';
import { ArrowRight, Check, Download, Eye, FileText, Gavel, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FirJourneyToggle from '../../components/FirJourneyToggle';
import FirResultHeader from '../../components/FirResultHeader';
import FirTimeline from '../../components/FirTimeline';
import RequestIdCard from '../../components/RequestIdCard';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firResult as t, font, ink } from '../../constants/theme';
import { FIR_REQUEST, READY_STAGE_CHIP, READY_TIMELINE } from '../../data/fir';
import { clientDocHref } from '../../data/docLinks';

// FIR draft ready (design/49) — the end state of the journey app/fir/status.tsx
// starts. Both are reachable through the dev toggle at the foot of each screen.
function FixtureFirReadyScreen() {
  const insets = useSafeAreaInsets();
  const file = FIR_REQUEST.draftFile;

  return (
    <View style={styles.screen}>
      <FirResultHeader title="Fir Draft" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.contentTop }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              DRAFT READY
            </Text>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroCircle}>
              <FileText size={t.heroDocGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.heroBadge}>
              <Check size={t.heroBadgeGlyph} color={ink.onBrand} strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.heading} {...shrinkToFit(0.75)}>
            Your FIR Draft Is Ready
          </Text>
          <Text style={styles.body}>
            Your formal First Information Report dossier has been compiled and certified for your
            preliminary inspection.
          </Text>

          <RequestIdCard requestId={FIR_REQUEST.requestId} style={styles.idCard} />
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              FINALIZED DRAFT DOSSIER
            </Text>
            <View style={styles.dossierChip}>
              <Text style={styles.dossierChipText} {...shrinkToFit(0.8)}>
                BNSS Compliant
              </Text>
            </View>
          </View>

          <View style={styles.file}>
            <View style={styles.fileIcon}>
              <FileText size={t.dossierIconGlyph} color={colors.textBody} />
            </View>
            <View style={styles.fileText}>
              <Text style={styles.fileName} {...shrinkToFit(0.75)}>
                {file.name}
              </Text>
              <Text style={styles.fileCaption} {...shrinkToFit(0.8)}>
                {file.caption}
              </Text>
              <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
                {file.meta}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Preview draft"
              onPress={() => router.push(clientDocHref(file.name, 'doc-fir-draft') as Href)}
              style={styles.eye}
            >
              <Eye size={t.dossierEyeIcon} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Pressable onPress={() => previewNotice("Download PDF")} accessibilityRole="button" style={styles.download}>
            <Download size={t.downloadIcon} color={t.downloadColour} />
            <Text style={styles.downloadLabel} {...shrinkToFit(0.8)}>
              Download PDF
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
              Request Progress
            </Text>
            <View style={styles.stageChip}>
              <Text style={styles.stageChipText} {...shrinkToFit(0.8)}>
                {READY_STAGE_CHIP}
              </Text>
            </View>
          </View>

          <FirTimeline items={READY_TIMELINE} variant="ready" />
        </View>

        <View style={styles.caution}>
          <View style={styles.cautionHead}>
            <Gavel size={t.helpIconGlyph} color={colors.textPrimary} style={styles.cautionIcon} />
            <View style={styles.cautionText}>
              <Text style={styles.cautionTitle} {...shrinkToFit(0.8)}>
                Please review your draft carefully
              </Text>
              <Text style={styles.cautionBody}>
                Cross-verify dates, timeline of occurrence, named parties, and stolen/affected
                property details before physical submission.
              </Text>
            </View>
          </View>

          <View style={styles.statutory}>
            <Text style={styles.statutoryText}>
              <Text style={styles.statutoryLead}>Statutory Notice: </Text>
              This document represents a vetted legal complaint draft. It becomes an official
              statutory FIR upon physical acceptance, verification, and registration by the Station
              House Officer (SHO) at your designated police station.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <DemoPressable
          onPress={() => router.push(clientDocHref(file.name, 'doc-fir-draft') as Href)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>View FIR Draft</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </DemoPressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.button, styles.buttonLight, pressed && styles.pressed]}
        >
          <Text style={[styles.buttonLabel, styles.buttonLightLabel]}>Back to Dashboard</Text>
        </Pressable>

        <View style={styles.footer}>
          <ShieldCheck size={t.footerIcon} color={colors.textBody} />
          <Text style={styles.footerText} {...shrinkToFit(0.75)}>
            256-Bit Encrypted • Bar Council Compliant • Confidential
          </Text>
        </View>

        <FirJourneyToggle value="ready" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: t.padX,
    paddingTop: t.contentTop,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  pill: {
    alignSelf: 'center',
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    marginRight: t.pillDotGap,
    backgroundColor: t.pillText,
  },
  pillText: {
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: t.pillText,
  },
  hero: {
    marginTop: t.heroTop,
    alignSelf: 'center',
  },
  heroCircle: {
    width: t.heroDocCircle,
    height: t.heroDocCircle,
    borderRadius: t.heroDocCircle / 2,
    backgroundColor: t.heroCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: t.heroBadge,
    height: t.heroBadge,
    borderRadius: t.heroBadge / 2,
    backgroundColor: t.heroBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: t.headingGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  idCard: {
    marginTop: t.idGap,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textBody,
  },
  dossierChip: {
    marginLeft: 8,
    minHeight: t.dossierChipHeight,
    borderRadius: t.dossierChipRadius,
    paddingHorizontal: t.dossierChipPadX,
    backgroundColor: t.dossierChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dossierChipText: {
    fontFamily: font.appSemi,
    fontSize: t.dossierChipSize,
    color: colors.textPrimary,
  },
  file: {
    marginTop: t.dossierRowGap,
    borderRadius: t.idRadius,
    backgroundColor: t.idBg,
    padding: t.idPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: t.dossierIcon,
    height: t.dossierIcon,
    borderRadius: t.dossierIconRadius,
    backgroundColor: t.dossierIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.dossierIconGap,
  },
  fileName: {
    fontFamily: font.appHeading,
    fontSize: t.dossierNameSize,
    color: colors.textPrimary,
  },
  fileCaption: {
    marginTop: t.dossierCaptionGap,
    fontFamily: font.appBody,
    fontSize: t.dossierCaptionSize,
    color: colors.textBody,
  },
  fileMeta: {
    marginTop: t.dossierMetaGap,
    fontFamily: font.appSemi,
    fontSize: t.dossierMetaSize,
    color: colors.textBody,
  },
  eye: {
    marginLeft: 10,
    width: t.dossierEye,
    height: t.dossierEye,
    borderRadius: t.dossierEye / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  download: {
    marginTop: t.downloadGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadLabel: {
    marginLeft: t.downloadIconGap,
    fontFamily: font.appSemi,
    fontSize: t.downloadSize,
    color: t.downloadColour,
  },
  sectionTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  stageChip: {
    marginLeft: 8,
    minHeight: t.stageChipHeight,
    borderRadius: t.stageChipRadius,
    paddingHorizontal: t.stageChipPadX,
    backgroundColor: t.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageChipText: {
    fontFamily: font.appBody,
    fontSize: t.stageChipSize,
    color: t.pillText,
  },
  caution: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
  },
  cautionHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cautionIcon: {
    marginTop: 2,
  },
  cautionText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.noteIconGap,
  },
  cautionTitle: {
    fontFamily: font.appHeading,
    fontSize: t.helpTitleSize,
    color: colors.textPrimary,
  },
  cautionBody: {
    marginTop: t.helpBodyGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },
  statutory: {
    marginTop: t.statutoryGap,
    borderRadius: t.statutoryRadius,
    backgroundColor: t.statutoryBg,
    padding: t.statutoryPad,
  },
  statutoryText: {
    fontFamily: font.appBody,
    fontSize: t.statutorySize,
    lineHeight: t.statutoryLineHeight,
    color: colors.textBody,
  },
  statutoryLead: {
    fontFamily: font.appHeading,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
    minHeight: t.buttonGap,
  },
  button: {
    marginTop: t.buttonStackGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLight: {
    backgroundColor: t.buttonLightBg,
  },
  buttonLightLabel: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  buttonIcon: {
    marginLeft: t.buttonIconGap,
  },
  footer: {
    marginTop: t.footerGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: t.footerIconGap,
    fontFamily: font.appBody,
    fontSize: t.footerSize,
    color: colors.textBody,
  },
});
import FirClient from '../../features/fir/FirClient';
import {DATA_SOURCE} from '../../lib/data-source';
export default function LiveFirScreen() { return DATA_SOURCE === 'api' ? <FirClient/> : <FixtureFirReadyScreen/>; }

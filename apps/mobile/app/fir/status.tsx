import { router } from 'expo-router';
import { ArrowRight, Bell, ClipboardList, Headset, Lock, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FirJourneyToggle from '../../components/FirJourneyToggle';
import FirResultHeader from '../../components/FirResultHeader';
import FirTimeline from '../../components/FirTimeline';
import RequestIdCard from '../../components/RequestIdCard';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firResult as t, font } from '../../constants/theme';
import { FIR_REQUEST, STATUS_STAGE_CHIP, STATUS_TIMELINE } from '../../data/fir';

// FIR draft status (design/48).
//
// REPORTED — the chip reads "Stage 2 of 4" while the timeline below it lists five
// items. Both are drawn as the file has them; STATUS_STAGE_CHIP in data/fir.ts is a
// one-line change once the client says which count is right.

function FixtureFirStatusScreen() {
  // Navigation follows the client's tap; time alone never advances FIR.
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <FirResultHeader title="Fir Draft Status" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.contentTop }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText} {...shrinkToFit(0.8)}>
                UNDER REVIEW
              </Text>
            </View>
            <View style={styles.verified}>
              <ShieldCheck size={t.verifiedIcon} color={colors.textBody} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                Verified Draft
              </Text>
            </View>
          </View>

          <Text style={styles.heading} {...shrinkToFit(0.75)}>
            FIR Draft Request Submitted
          </Text>
          <Text style={styles.body}>
            Your request has been securely logged and is currently under institutional intake
            review.
          </Text>

          <RequestIdCard requestId={FIR_REQUEST.requestId} style={styles.idCard} />
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              REQUEST DETAILS
            </Text>
            <ClipboardList size={t.noteIcon} color={colors.textBody} />
          </View>

          <Row label="Request Type" value={FIR_REQUEST.service} first />
          <Row label="Submitted On" value={FIR_REQUEST.submittedOn} />
          <Row label="Current Status" chip="Under Review" />
          <Row label="Estimated Turnaround" value={FIR_REQUEST.turnaround} note={FIR_REQUEST.turnaroundNote} />
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <View style={styles.sectionText}>
              <Text style={styles.label} {...shrinkToFit(0.8)}>
                REQUEST STATUS
              </Text>
              <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
                What happens next?
              </Text>
            </View>
            {/* REPORTED — "of 4" against five timeline items below. */}
            <View style={styles.stageChip}>
              <Text style={styles.stageChipText} {...shrinkToFit(0.8)}>
                {STATUS_STAGE_CHIP}
              </Text>
            </View>
          </View>

          <FirTimeline items={STATUS_TIMELINE} variant="status" />
        </View>

        <View style={styles.note}>
          <Bell size={t.noteIcon} color={colors.textBody} />
          <Text style={styles.noteText}>
            We&apos;ll notify you via SMS &amp; in-app notification the moment your FIR draft is
            compiled and ready for download.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.helpRow}>
            <View style={styles.helpIcon}>
              <Headset size={t.helpIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle} {...shrinkToFit(0.8)}>
                Need to update something?
              </Text>
              <Text style={styles.helpBody}>
                Forgot to mention a witness or critical detail? Contact Legalitt desk before
                drafting initiates.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/support-chat')}
            style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
          >
            <Text style={styles.helpButtonLabel} {...shrinkToFit(0.8)}>
              Contact Legalitt Support
            </Text>
            <ArrowRight size={t.helpButtonIcon} color={colors.textPrimary} style={styles.helpButtonIcon} />
          </Pressable>
        </View>

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Lock size={t.footerIcon} color={colors.textBody} />
          <Text style={styles.footerText} {...shrinkToFit(0.75)}>
            256-BIT ENCRYPTED FOLIO · Bar Council Compliant
          </Text>
        </View>
        <Text style={styles.footerLine} {...shrinkToFit(0.75)}>
          Drafts strictly curated under legal tech advisory protocols.
        </Text>

        <FirJourneyToggle value="status" />
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  chip,
  note,
  first,
}: {
  label: string;
  value?: string;
  chip?: string;
  note?: string;
  first?: boolean;
}) {
  return (
    <View style={[styles.row, first && styles.rowFirst]}>
      <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {chip ? (
          <View style={styles.rowChip}>
            <View style={styles.rowChipDot} />
            <Text style={styles.rowChipText} {...shrinkToFit(0.8)}>
              {chip}
            </Text>
          </View>
        ) : (
          <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
            {value}
          </Text>
        )}
        {note && (
          <Text style={styles.rowNote} {...shrinkToFit(0.8)}>
            {note}
          </Text>
        )}
      </View>
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
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
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
  verified: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  verifiedText: {
    marginLeft: t.verifiedIconGap,
    fontFamily: font.appBody,
    fontSize: t.verifiedSize,
    color: colors.textBody,
  },
  heading: {
    marginTop: t.pillGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  body: {
    marginTop: 6,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  idCard: {
    marginTop: t.pillGap,
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
  sectionText: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    marginTop: t.sectionLabelGap,
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  stageChip: {
    marginLeft: 8,
    minHeight: t.stageChipHeight,
    borderRadius: t.stageChipRadius,
    paddingHorizontal: t.stageChipPadX,
    backgroundColor: t.stageChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageChipText: {
    fontFamily: font.appBody,
    fontSize: t.stageChipSize,
    color: colors.textBody,
  },
  row: {
    marginTop: t.tableRowGap,
    paddingTop: t.tableRowGap,
    borderTopWidth: 1,
    borderTopColor: t.tableDivider,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowFirst: {
    marginTop: t.tableLabelGap,
    borderTopWidth: 0,
    paddingTop: 0,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.tableLabelSize,
    color: colors.textBody,
  },
  rowRight: {
    marginLeft: 10,
    flexShrink: 1,
    alignItems: 'flex-end',
  },
  rowValue: {
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.tableValueSize,
    color: colors.textPrimary,
  },
  rowNote: {
    marginTop: t.tableNoteGap,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.tableNoteSize,
    color: colors.textBody,
  },
  rowChip: {
    minHeight: t.statusChipHeight,
    borderRadius: t.statusChipRadius,
    paddingHorizontal: t.statusChipPadX,
    backgroundColor: t.statusChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowChipDot: {
    width: t.statusChipDot,
    height: t.statusChipDot,
    borderRadius: t.statusChipDot / 2,
    marginRight: t.statusChipDotGap,
    backgroundColor: t.pillText,
  },
  rowChipText: {
    fontFamily: font.appSemi,
    fontSize: t.statusChipSize,
    color: t.pillText,
  },
  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.noteIconGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpIcon: {
    width: t.helpIcon,
    height: t.helpIcon,
    borderRadius: t.helpIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.helpIconGap,
  },
  helpTitle: {
    fontFamily: font.appHeading,
    fontSize: t.helpTitleSize,
    color: colors.textPrimary,
  },
  helpBody: {
    marginTop: t.helpBodyGap,
    fontFamily: font.appBody,
    fontSize: t.helpBodySize,
    lineHeight: t.helpBodyLineHeight,
    color: colors.textBody,
  },
  helpButton: {
    marginTop: t.helpButtonGap,
    minHeight: t.helpButtonHeight,
    borderRadius: t.helpButtonRadius,
    backgroundColor: t.helpButtonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.helpButtonSize,
    color: colors.textPrimary,
  },
  helpButtonIcon: {
    marginLeft: t.helpButtonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  spacer: {
    flex: 1,
    minHeight: t.buttonGap,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: t.footerIconGap,
    fontFamily: font.appSemi,
    fontSize: t.footerSize,
    letterSpacing: 0.4,
    color: colors.textBody,
  },
  footerLine: {
    marginTop: t.footerLineGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footerLineSize,
    color: colors.textBody,
  },
});
import FirClient from '../../features/fir/FirClient';
import {DATA_SOURCE} from '../../lib/data-source';
export default function LiveFirScreen() { return DATA_SOURCE === 'api' ? <FirClient/> : <FixtureFirStatusScreen/>; }

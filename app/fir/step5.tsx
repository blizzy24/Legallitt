import { router } from 'expo-router';
import {
  ArrowRight,
  AtSign,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Folder,
  Gavel,
  Lock,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import FirShell from '../../components/FirShell';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firStep5 as t, font, ink } from '../../constants/theme';
import { FIR_REVIEW_SAMPLE as r } from '../../data/fir';

// FIR step 5 — Review & Submit (design/46).
//
// design/46 draws the header title left-aligned beside the back arrow, where steps
// 1–4 centre it. FirShell keeps it centred so the five steps read as one flow; the
// deviation is reported rather than forked into a shell prop for a single screen.

const TAG_STYLE = {
  PDF: { bg: t.pdfBg, text: t.pdfText },
  IMG: { bg: t.imgBg, text: t.imgText },
  DOC: { bg: t.docBg, text: t.docText },
};

export default function FirStep5Screen() {
  const [expanded, setExpanded] = useState(false);

  return (
    <FirShell step={5} title="Review & Submit">
      <Text style={styles.heading}>Review Your Request</Text>
      <Text style={styles.subtitle}>
        Review the information you provided before submitting your FIR Draft request.
      </Text>

      <Card icon={UserRound} title="Basic Details" link="Edit" first>
        <View style={styles.panel}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              COMPLAINANT NAME
            </Text>
            <View style={styles.kyc}>
              <ShieldCheck size={t.kycIcon} color={ink.onBrand} />
              <Text style={styles.kycText} {...shrinkToFit(0.8)}>
                Verified KYC
              </Text>
            </View>
          </View>
          <Text style={styles.name} {...shrinkToFit(0.75)}>
            {r.fullName}
          </Text>

          <View style={styles.cols}>
            <Field label="MOBILE NUMBER" value={r.mobile} />
            <Field label="OFFICIAL EMAIL" value={r.email} wide />
          </View>
        </View>
      </Card>

      <Card icon={Gavel} title="Incident Details" link="Edit">
        <View style={styles.panel}>
          <View style={styles.colsFirst}>
            {/* design/46 wraps this one onto two lines too. Left as drawn. */}
            <Field label="DATE & TIME" value={r.incidentDateTime} />
            <Field label="LOCATION / POLICE PS" value={r.location} wide />
          </View>

          {/* design/46 spells this "OFFENSE"; the rest of the app uses the Indian
              "offence". Drawn as the file has it. */}
          <Text style={[styles.label, styles.summaryLabel]} {...shrinkToFit(0.8)}>
            REPORTED OFFENSE SUMMARY
          </Text>
          <Text style={styles.summary}>
            {expanded ? r.offenceSummaryFull : r.offenceSummaryShort}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            hitSlop={8}
            onPress={() => setExpanded((v) => !v)}
            style={styles.more}
          >
            <Text style={styles.moreText}>{expanded ? 'Show less' : 'Show more'}</Text>
            {expanded ? (
              <ChevronUp size={t.moreIcon} color={colors.textBody} style={styles.moreIcon} />
            ) : (
              <ChevronDown size={t.moreIcon} color={colors.textBody} style={styles.moreIcon} />
            )}
          </Pressable>
        </View>
      </Card>

      <Card icon={UsersRound} title="People Involved" link="View / Edit">
        <View style={styles.panel}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              REGISTRY ENTRIES
            </Text>
            <View style={styles.countChip}>
              <Text style={styles.countChipText} {...shrinkToFit(0.8)}>
                {r.people.count}
              </Text>
            </View>
          </View>
          {r.people.entries.map((e) => (
            <View key={e.label} style={styles.pill}>
              <View
                style={[
                  styles.pillDot,
                  { backgroundColor: e.tone === 'primary' ? colors.brandCheck : colors.danger },
                ]}
              />
              <Text style={styles.pillText} {...shrinkToFit(0.8)}>
                {e.label}
              </Text>
            </View>
          ))}
          <Text style={styles.note}>{r.people.note}</Text>
        </View>
      </Card>

      <Card icon={Folder} title="Documents & Evidence" link="Manage">
        <View style={styles.panel}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              VALIDATED DOSSIER
            </Text>
            <View style={styles.dossier}>
              <CircleCheck size={t.dossierIcon} color={colors.textBody} />
              <Text style={styles.dossierText} {...shrinkToFit(0.8)}>
                {r.documents.count}
              </Text>
            </View>
          </View>

          {r.documents.files.map((f) => (
            <View key={f.name} style={styles.file}>
              <View style={[styles.tag, { backgroundColor: TAG_STYLE[f.tag].bg }]}>
                <Text style={[styles.tagText, { color: TAG_STYLE[f.tag].text }]}>{f.tag}</Text>
              </View>
              <Text style={styles.fileName} {...shrinkToFit(0.7)}>
                {f.name}
              </Text>
              <Text style={styles.fileSize} {...shrinkToFit(0.8)}>
                {f.size}
              </Text>
            </View>
          ))}

          <View style={styles.valid}>
            <Lock size={t.validIcon} color={colors.textBody} />
            <Text style={styles.validText} {...shrinkToFit(0.75)}>
              {r.documents.validation}
            </Text>
            <ShieldCheck size={t.validIcon} color={colors.textBody} />
          </View>
        </View>
      </Card>

      <View style={styles.privilege}>
        <View style={styles.privilegeRow}>
          <AtSign size={t.privilegeIcon} color={t.privilegeLabelColour} />
          <Text style={styles.privilegeLabel} {...shrinkToFit(0.8)}>
            LEGAL PRIVILEGE PROTECTED
          </Text>
        </View>
        <Text style={styles.privilegeBody}>
          By submitting, you confirm that the information provided is accurate and truthful to the
          best of your knowledge.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/fir/pay-placeholder')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonLabel}>Proceed To Pay</Text>
        <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
      </Pressable>
    </FirShell>
  );
}

function Card({
  icon: Icon,
  title,
  link,
  first,
  children,
}: {
  icon: LucideIcon;
  title: string;
  link: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.card, first && styles.firstCard]}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Icon size={t.headIconGlyph} color={colors.textPrimary} />
        </View>
        <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
          {title}
        </Text>
        {/* Edit / Manage links are inert in the prototype. */}
        <Pressable accessibilityRole="link" hitSlop={8}>
          <Text style={styles.link} {...shrinkToFit(0.8)}>
            {link}
          </Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

// The right-hand column carries the longer values (email, location), so it is given
// the larger share of the row rather than an even split.
function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <View style={[styles.col, { flex: wide ? t.colWide : t.colNarrow }]}>
      <Text style={styles.label} {...shrinkToFit(0.8)}>
        {label}
      </Text>
      <Text style={styles.value} {...shrinkToFit(0.7)}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: t.headingTop,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    lineHeight: t.subtitleLineHeight,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  firstCard: {
    marginTop: t.cardGap,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headIcon: {
    width: t.headIcon,
    height: t.headIcon,
    borderRadius: t.headIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.headIconGap,
    fontFamily: font.appHeading,
    fontSize: t.headTitleSize,
    color: colors.textPrimary,
  },
  link: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.linkSize,
    color: colors.textBody,
  },
  panel: {
    marginTop: t.panelGap,
    borderRadius: t.panelRadius,
    backgroundColor: t.panelBg,
    padding: t.panelPad,
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
  name: {
    marginTop: t.valueGap,
    fontFamily: font.appSemi,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  value: {
    marginTop: t.valueGap,
    fontFamily: font.appSemi,
    fontSize: t.valueSize,
    color: colors.textPrimary,
  },
  kyc: {
    marginLeft: 8,
    minHeight: t.kycHeight,
    borderRadius: t.kycRadius,
    paddingHorizontal: t.kycPadX,
    backgroundColor: t.kycBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycText: {
    marginLeft: t.kycIconGap,
    fontFamily: font.appSemi,
    fontSize: t.kycSize,
    color: ink.onBrand,
  },
  cols: {
    marginTop: t.rowGap,
    flexDirection: 'row',
    gap: t.colGap,
  },
  colsFirst: {
    flexDirection: 'row',
    gap: t.colGap,
  },
  col: {
    minWidth: 0,
  },
  summaryLabel: {
    marginTop: t.rowGap,
  },
  summary: {
    marginTop: t.summaryGap,
    fontFamily: font.appBody,
    fontSize: t.summarySize,
    lineHeight: t.summaryLineHeight,
    color: colors.textPrimary,
  },
  more: {
    marginTop: t.moreGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreText: {
    fontFamily: font.appBody,
    fontSize: t.moreSize,
    color: colors.textBody,
  },
  moreIcon: {
    marginLeft: t.moreIconGap,
  },
  countChip: {
    marginLeft: 8,
    minHeight: t.countChipHeight,
    borderRadius: t.countChipRadius,
    paddingHorizontal: t.countChipPadX,
    backgroundColor: colors.brandCheck,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countChipText: {
    fontFamily: font.appSemi,
    fontSize: t.countChipSize,
    color: ink.onBrand,
  },
  pill: {
    marginTop: t.pillGap,
    alignSelf: 'flex-start',
    maxWidth: '100%',
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
  },
  pillText: {
    flexShrink: 1,
    marginLeft: t.pillDotGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    color: colors.textPrimary,
  },
  note: {
    marginTop: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },
  dossier: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  dossierText: {
    marginLeft: t.dossierIconGap,
    fontFamily: font.appSemi,
    fontSize: t.dossierSize,
    color: colors.textPrimary,
  },
  file: {
    marginTop: t.fileGap,
    minHeight: t.fileHeight,
    borderRadius: t.fileRadius,
    backgroundColor: t.fileBg,
    paddingHorizontal: t.filePadX,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    width: t.tagWidth,
    minHeight: t.tagHeight,
    borderRadius: t.tagRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontFamily: font.appHeading,
    fontSize: t.tagSize,
    letterSpacing: t.tagSpacing,
  },
  fileName: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.tagGap,
    fontFamily: font.appSemi,
    fontSize: t.fileNameSize,
    color: colors.textPrimary,
  },
  fileSize: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.fileSizeSize,
    color: colors.textBody,
  },
  valid: {
    marginTop: t.validGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  validText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.validIconGap,
    fontFamily: font.appBody,
    fontSize: t.validSize,
    color: colors.textBody,
  },
  privilege: {
    marginTop: t.privilegeGap,
    borderRadius: t.privilegeRadius,
    backgroundColor: t.privilegeBg,
    padding: t.privilegePad,
    alignItems: 'center',
  },
  privilegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privilegeLabel: {
    marginLeft: t.privilegeIconGap,
    fontFamily: font.appSemi,
    fontSize: t.privilegeLabelSize,
    letterSpacing: t.privilegeLabelSpacing,
    color: t.privilegeLabelColour,
  },
  privilegeBody: {
    marginTop: t.privilegeBodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.privilegeBodySize,
    lineHeight: t.privilegeBodyLineHeight,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

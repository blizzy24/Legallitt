import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
import IdentityVerification from '../../components/IdentityVerification';
import { useKyc } from '../../context/kyc';
import { previewNotice } from '../../components/PreviewNotice';
import { router } from 'expo-router';
import {
  ArrowRight,
  BookText,
  CirclePlus,
  Crop,
  File,
  ShieldCheck,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import WizardShell from '../../components/WizardShell';
import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, lnUpload as t } from '../../constants/theme';

// Step 4, first screen — upload supporting documents (design/91).
//
// FLOW — design/91 is the upload screen that was missing from the original batch: it
// produces the state design/39 reviews. The chain is therefore
//   step3 -> step4 (upload) -> step4-review -> step5 -> step6
// and both step 4 screens draw the stepper on 4 of 6, so the wizard's six steps are
// unchanged. The designs do not state this directly; it is inferred from design/39
// showing files already present with no screen that could have added them.
//
// REPORTED — design/91 REMOVED design/39's Aadhaar Card upload row and replaced it
// with the Identity Verification card below, which routes to KYC. Identity now goes
// through DigiLocker or a video check rather than a document the user uploads, which
// changes what the app would hold — a verification result rather than a copy of an
// ID. design/39 still lists an Aadhaar Card document, so the two screens disagree.
//
// REPORTED — the brief describes a LEFT ACCENT BAR on the identity card. Measured,
// design/91 draws a uniform 1pt border in #F8DEC4 on all four edges (left 16.0-16.5,
// top 222.0-222.5, bottom 343.0-343.5, right 373.0-373.5), not a left bar. Rendered
// as a border.
//
// REPORTED — design/91 draws the identity card at x16 while the upload rows below sit
// at x22, the wizard's own margin. The card is normalised to the shell rather than
// rendered 6pt wider on each side than everything around it.
//
// Upload controls are inert; no upload mechanism is designed anywhere in the app.

const ROWS: { icon: LucideIcon; title: string; subtitle: string }[] = [
  { icon: File, title: 'Property Papers', subtitle: 'Sales Deed, Khata, etc' },
  // design/91 clips this to "Any agreement documen", as design/39 does. Full word.
  { icon: BookText, title: 'Agreement', subtitle: 'Any agreement document' },
  { icon: Crop, title: 'Screenshots', subtitle: 'WhatsApp, Email, etc' },
];

export function Step4ScreenView({ onContinue, onUpload }: {
  onContinue: () => void; onUpload: (kind: string) => void;
}) {
  return (
    <WizardShell
      step={4}
      align="top"
      background="tinted"
      buttonLabel="Continue"
      onContinue={onContinue}
    >
      <Text style={styles.heading}>Upload Supporting Documents</Text>

      <IdentityVerification returnTo="/legal-notice/step4" />

      <View style={styles.rows}>
        {ROWS.map((r, i) => (
          <Pressable onPress={() => onUpload(r.title)}
            key={r.title}
            accessibilityRole="button"
            accessibilityLabel={`Upload ${r.title}`}
            style={({ pressed }) => [styles.row, i > 0 && styles.rowSpaced, pressed && styles.pressed]}
          >
            <r.icon size={t.rowIcon} color={colors.textBody} strokeWidth={1.5} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle} {...shrinkToFit(0.8)}>
                {r.title}
              </Text>
              <Text style={styles.rowSub} {...shrinkToFit(0.8)}>
                {r.subtitle}
              </Text>
            </View>
            <UploadCloud size={t.rowUpload} color={colors.textPrimary} strokeWidth={1.5} />
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => onUpload("Add More Documents")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.add, pressed && styles.pressed]}
      >
        <CirclePlus size={t.addIcon} color={ink.accent} strokeWidth={1.5} />
        <Text style={styles.addLabel} {...shrinkToFit(0.8)}>
          Add More Documents
        </Text>
        <View style={styles.addChip}>
          <Text style={styles.addChipText} {...shrinkToFit(0.8)}>
            Optional
          </Text>
        </View>
      </Pressable>
    </WizardShell>
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
  identity: {
    marginTop: t.identityGap,
    borderRadius: t.identityRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.identityBorder,
    padding: t.identityPad,
  },
  identityHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identityIcon: {
    width: t.identityIcon,
    height: t.identityIcon,
    borderRadius: t.identityIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.identityIconGap,
    fontFamily: font.appHeading,
    fontSize: t.identityTitleSize,
    color: colors.textPrimary,
  },
  kycChip: {
    marginLeft: 8,
    minHeight: t.kycChipHeight,
    borderRadius: t.kycChipRadius,
    paddingHorizontal: t.kycChipPadX,
    backgroundColor: t.kycChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycChipText: {
    fontFamily: font.appSemi,
    fontSize: t.kycChipSize,
    letterSpacing: t.kycChipSpacing,
    color: t.kycChipText,
  },
  identityBody: {
    marginTop: t.identityBodyGap,
    fontFamily: font.appBody,
    fontSize: t.identityBodySize,
    lineHeight: t.identityBodyLineHeight,
    color: colors.textBody,
  },
  identityDivider: {
    marginTop: t.identityDividerGap,
    height: 1,
    backgroundColor: colors.border,
  },
  identityRow: {
    marginTop: t.identityRowGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  identityRowText: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  identityRowTitle: {
    fontFamily: font.appHeading,
    fontSize: t.identityRowTitleSize,
    color: colors.textPrimary,
  },
  identityRowSub: {
    marginTop: t.identityRowSubGap,
    fontFamily: font.appBody,
    fontSize: t.identityRowSubSize,
    color: colors.textBody,
  },
  kycButton: {
    minHeight: t.kycButtonHeight,
    borderRadius: t.kycButtonRadius,
    paddingHorizontal: t.kycButtonPadX,
    backgroundColor: t.kycButtonBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  kycButtonLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.kycButtonSize,
    color: ink.onBrand,
  },
  kycButtonIcon: {
    marginLeft: t.kycButtonIconGap,
  },
  rows: {
    marginTop: t.rowsGap,
  },
  row: {
    borderRadius: t.rowRadius,
    backgroundColor: colors.card,
    padding: t.rowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaced: {
    marginTop: t.rowGap,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.rowIconGap,
  },
  rowTitle: {
    fontFamily: font.appHeading,
    fontSize: t.rowTitleSize,
    color: colors.textPrimary,
  },
  rowSub: {
    marginTop: t.rowSubGap,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    color: colors.textBody,
  },
  add: {
    marginTop: t.addGap,
    borderRadius: t.addRadius,
    backgroundColor: colors.card,
    padding: t.addPad,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    marginLeft: t.addIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.addSize,
    color: colors.textPrimary,
  },
  addChip: {
    marginLeft: t.addChipGap,
    minHeight: t.addChipHeight,
    borderRadius: t.addChipRadius,
    paddingHorizontal: t.addChipPadX,
    backgroundColor: t.addChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChipText: {
    fontFamily: font.appBody,
    fontSize: t.addChipSize,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Step4Screen() {
  const { kyc, begin } = useKyc();
  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="upload" /> : <Step4ScreenView onContinue={() => kyc.completed ? router.push('/legal-notice/step4-review') : begin('/legal-notice/step4')} onUpload={title => previewNotice(title === 'Add More Documents' ? title : `Upload ${title}`)} />;
}

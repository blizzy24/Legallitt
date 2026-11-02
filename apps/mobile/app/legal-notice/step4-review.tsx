import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import { useUploadModel } from "../../features/legal-notice/useUploadModel";
import IdentityVerification from '../../components/IdentityVerification';
import { useKyc } from '../../context/kyc';
import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import { BookText, Check, CirclePlus, Crop, Eye, File, FingerprintPattern, RefreshCw, Trash, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import WizardShell from '../../components/WizardShell';
import { colors, font, ink, reviewDocs as r, wizardCardShadow } from '../../constants/theme';
import { useLegalNotice } from '../../context/legalNotice';
import { clientDocHref } from '../../data/docLinks';

export type Doc = { id?: string; title: string; subtitle: string; icon: LucideIcon };

// Documents from design/39. The upload screen that produces this state is design/91,
// now app/legal-notice/step4.tsx; these stand in for the user's files and are written
// to the flow so step 5 can count them.
//
// design/39 prints "Any agreement documen": the word is cut off in the file itself,
// so the full "document" is rendered here.
//
// REPORTED — design/91 REMOVED the Aadhaar Card upload row and replaced it with the
// Identity Verification card that routes to KYC. This review screen still lists
// Aadhaar Card, because design/39 still draws it. The two screens now disagree about
// whether an Aadhaar document is collected at all. Left as drawn, per instruction.
const SAMPLE_DOCS: Doc[] = [
  { title: 'Property Papers', subtitle: 'Sales Deed, Khata, etc', icon: File },
  { title: 'Agreement', subtitle: 'Any agreement document', icon: BookText },
  { title: 'Screenshots', subtitle: 'WhatsApp, Email, etc', icon: Crop },
];

// Step 4, second screen — review documents (design/39). Reached from the upload
// screen (design/91). Content fills from the top on the off-white background; the
// file's 16pt margins are normalised to the shell. View / replace / delete are
// non-functional.
//
// The instructed Documents step is step 5 of 7 and spans upload and review.
// The original exports numbered both of these screens step 4 of 6.
export function Step4ReviewScreenView({ onBack, documents, count, onContinue, onAdd, onView, onReplace, onDelete, returnTo = "/legal-notice/step4-review" }: {
  onBack?: () => void; returnTo?: Href; documents: Doc[]; count: number; onContinue: () => void; onAdd: () => void;
  onView: (doc: Doc) => void; onReplace: (doc: Doc) => void; onDelete: (doc: Doc) => void;
}) {
  return (
    <WizardShell onBack={onBack} step={5} totalSteps={7} align="top" background="tinted" buttonLabel="Continue" onContinue={onContinue}>
      <Text style={styles.title}>Review Your Documents</Text>
      <Text style={styles.subtitle}>Your documents have been uploaded successfully. Review them before continuing.</Text>

      <View style={styles.banner}>
        <View style={styles.disc}>
          <Check size={r.discIcon} color={ink.onBrand} strokeWidth={3} />
        </View>
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Documents uploaded successfully</Text>
          <Text style={styles.bannerSub}>{count} documents added</Text>
        </View>
      </View>

      <IdentityVerification returnTo={returnTo} />
      <View style={styles.list}>
        {documents.map((d) => (
          <DocRow key={d.id ?? d.title} doc={d} onView={() => onView(d)} onReplace={() => onReplace(d)} onDelete={() => onDelete(d)} />
        ))}
      </View>

      <Pressable onPress={onAdd} accessibilityRole="button" style={styles.add}>
        <CirclePlus size={r.addIcon} color={r.addText} />
        <Text style={styles.addText}>Add More Documents</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Optional</Text>
        </View>
      </Pressable>
    </WizardShell>
  );
}

function DocRow({ doc, onView, onReplace, onDelete }: { doc: Doc; onView: () => void; onReplace: () => void; onDelete: () => void }) {
  const Icon = doc.icon;
  return (
    <View style={styles.card}>
      <Icon size={r.icon} color={colors.brand} strokeWidth={1.5} />
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{doc.title}</Text>
        <Text style={styles.cardSub} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
          {doc.subtitle}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${doc.title}`}
          hitSlop={8}
          onPress={onView}
        >
          <Eye size={r.actionIcon + 2} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={onReplace} accessibilityRole="button" accessibilityLabel={`Replace ${doc.title}`} hitSlop={8}>
          <RefreshCw size={r.actionIcon} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel={`Delete ${doc.title}`} hitSlop={8}>
          <Trash size={r.actionIcon} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: font.appHeading,
    fontSize: r.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: r.subtitleGap,
    fontFamily: font.appBody,
    fontSize: r.subtitleSize,
    lineHeight: r.subtitleLineHeight,
    color: colors.textBody,
  },
  banner: {
    marginTop: r.bannerGap,
    height: r.bannerHeight,
    borderRadius: r.bannerRadius,
    backgroundColor: r.bannerBg,
    paddingHorizontal: r.bannerPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disc: {
    width: r.disc,
    height: r.disc,
    borderRadius: r.disc / 2,
    backgroundColor: r.checkDisc,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: r.bannerTextGap,
  },
  bannerText: {
    flex: 1,
    minWidth: 0,
  },
  bannerTitle: {
    fontFamily: font.appSemi,
    fontSize: r.bannerTitleSize,
    color: colors.textPrimary,
  },
  bannerSub: {
    marginTop: r.bannerLineGap,
    fontFamily: font.appBody,
    fontSize: r.bannerSubSize,
    color: colors.textBody,
  },
  list: {
    marginTop: r.listGap,
    gap: r.cardGap,
  },
  card: {
    height: r.cardHeight,
    borderRadius: r.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: r.cardPadLeft,
    paddingRight: r.cardPadRight,
    flexDirection: 'row',
    alignItems: 'center',
    ...wizardCardShadow,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    marginLeft: r.iconGap,
  },
  cardTitle: {
    fontFamily: font.appSemi,
    fontSize: r.titleTextSize,
    color: r.docText,
  },
  cardSub: {
    marginTop: 2,
    fontFamily: font.appBody,
    fontSize: r.subTextSize,
    color: r.docText,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r.actionGap,
  },
  add: {
    marginTop: r.addGap,
    height: r.addHeight,
    borderRadius: r.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...wizardCardShadow,
  },
  addText: {
    marginLeft: r.addIconGap,
    fontFamily: font.appSemi,
    fontSize: r.addTextSize,
    color: r.addText,
  },
  chip: {
    marginLeft: r.chipGap,
    height: r.chipHeight,
    borderRadius: r.chipHeight / 2,
    paddingHorizontal: r.chipPadX,
    backgroundColor: r.chipBg,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: font.appSemi,
    fontSize: r.chipTextSize,
    color: r.chipText,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Step4ReviewScreen() {
  const model = useUploadModel('step4-review');
  return <NoticeScreenFeedback error={model.error}><Step4ReviewScreenView {...model} /></NoticeScreenFeedback>;
}

import { router } from 'expo-router';
import { BookText, Check, CirclePlus, Crop, Eye, File, FingerprintPattern, RefreshCw, Trash, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import WizardShell from '../../components/WizardShell';
import { colors, font, ink, reviewDocs as r, wizardCardShadow } from '../../constants/theme';
import { useLegalNotice } from '../../context/legalNotice';

type Doc = { title: string; subtitle: string; icon: LucideIcon };

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
  { title: 'Aadhaar Card', subtitle: 'Upload Aadhaar', icon: FingerprintPattern },
  { title: 'Property Papers', subtitle: 'Sales Deed, Khata, etc', icon: File },
  { title: 'Agreement', subtitle: 'Any agreement document', icon: BookText },
  { title: 'Screenshots', subtitle: 'WhatsApp, Email, etc', icon: Crop },
];

// Step 4, second screen — review documents (design/39). Reached from the upload
// screen (design/91). Content fills from the top on the off-white background; the
// file's 16pt margins are normalised to the shell. View / replace / delete are
// non-functional.
//
// Both this screen and the upload screen sit at "Step 4 of 6": design/91 and
// design/39 each draw the stepper on 4, so the wizard's six steps are unchanged and
// step 4 simply spans two screens.
export default function Step4ReviewScreen() {
  const { form, update } = useLegalNotice();

  useEffect(() => {
    if (form.documents.length === 0) update({ documents: SAMPLE_DOCS.map((d) => d.title) });
    // Seed once; the flow has no real upload step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = form.documents.length || SAMPLE_DOCS.length;

  return (
    <WizardShell step={4} align="top" background="tinted" buttonLabel="Continue" onContinue={() => router.push('/legal-notice/step5')}>
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

      <View style={styles.list}>
        {SAMPLE_DOCS.map((d) => (
          <DocRow key={d.title} doc={d} />
        ))}
      </View>

      <Pressable accessibilityRole="button" style={styles.add}>
        <CirclePlus size={r.addIcon} color={r.addText} />
        <Text style={styles.addText}>Add More Documents</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Optional</Text>
        </View>
      </Pressable>
    </WizardShell>
  );
}

function DocRow({ doc }: { doc: Doc }) {
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
        <Pressable accessibilityRole="button" accessibilityLabel={`View ${doc.title}`} hitSlop={8}>
          <Eye size={r.actionIcon + 2} color={colors.textPrimary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Replace ${doc.title}`} hitSlop={8}>
          <RefreshCw size={r.actionIcon} color={colors.textPrimary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${doc.title}`} hitSlop={8}>
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

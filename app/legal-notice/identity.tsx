import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, CreditCard, Eye, FileUp, IdCard, Lock, Plus, RefreshCw, ShieldCheck, Trash, Upload, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SegmentedControl from '../../components/SegmentedControl';
import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, ink, lnIdentity as v } from '../../constants/theme';

type IdentityState = 'empty' | 'uploaded';

const STATE_SEGMENTS: { key: IdentityState; label: string }[] = [
  { key: 'empty', label: 'Not uploaded' },
  { key: 'uploaded', label: 'Uploaded' },
];

const DOCUMENTS: { title: string; icon: LucideIcon; meta: string }[] = [
  { title: 'Aadhaar Card', icon: IdCard, meta: 'PDF · 2.4 MB' },
  { title: 'PAN Card', icon: CreditCard, meta: 'PDF · 1.1 MB' },
  { title: 'Voter ID', icon: FileUp, meta: 'JPG · 1.8 MB' },
];

// Verify Your Identity (design/38 empty, design/37 uploaded). Deliberately NOT built
// on WizardShell: the file uses its own header and its own "Step 4 of 5" counter,
// which conflicts with the 6-step Legal Notice wizard. A prototype-only toggle
// switches the two designed states (also ?state=uploaded).
export default function IdentityScreen() {
  const params = useLocalSearchParams<{ state?: string }>();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<IdentityState>(params.state === 'uploaded' ? 'uploaded' : 'empty');
  const uploaded = state === 'uploaded';

  return (
    <View style={styles.screen}>
      <ServiceHeader title="Legal Notice Detail" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + v.listGap }]} showsVerticalScrollIndicator={false}>
        <View style={styles.stepRow}>
          <Text style={styles.stepText}>STEP 4 OF 5 · IDENTITY CHECK</Text>
          <Text style={styles.stepText}>80% COMPLETED</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={styles.barFill} />
        </View>

        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>Provide your identity documents to verify your legal notice request.</Text>

        <Text style={styles.label}>Identity Documents</Text>
        <View style={styles.list}>
          {DOCUMENTS.map((doc, idx) => {
            const Icon = doc.icon;
            return (
              <View key={doc.title} style={[styles.row, idx > 0 && styles.rowDivided]}>
                <View style={styles.rowIcon}>
                  <Icon size={v.rowIconGlyph} color={ink.accent} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{doc.title}</Text>
                  <Text style={styles.rowStatus}>{uploaded ? 'Uploaded successfully' : 'REQUIRED'}</Text>
                  {uploaded && <Text style={styles.rowMeta}>{doc.meta}</Text>}
                </View>
                {uploaded ? (
                  <View style={styles.actions}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`View ${doc.title}`} hitSlop={8}>
                      <Eye size={v.actionIcon + 2} color={colors.textPrimary} />
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Replace ${doc.title}`} hitSlop={8}>
                      <RefreshCw size={v.actionIcon} color={colors.textPrimary} />
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${doc.title}`} hitSlop={8}>
                      <Trash size={v.actionIcon} color={colors.textPrimary} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable accessibilityRole="button" style={styles.upload}>
                    <Upload size={v.uploadIcon} color={colors.textPrimary} />
                    <Text style={styles.uploadText}>Upload</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <Pressable accessibilityRole="button" style={styles.add}>
          <Plus size={v.addIcon} color={colors.textPrimary} />
          <Text style={styles.addText}>Add supporting document (Optional)</Text>
        </Pressable>

        <View style={styles.note}>
          <Lock size={v.noteIcon} color={colors.textPrimary} />
          <Text style={styles.noteText}>Your documents are encrypted and used only for verification.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-notice/step1')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ArrowRight size={v.buttonIcon} color={ink.onBrand} />
        </Pressable>

        <View style={styles.footerRow}>
          <ShieldCheck size={v.footerIcon} color={colors.textBody} />
          <Text style={styles.footerText}>256-BIT ENCRYPTED · BAR COUNCIL COMPLIANT FLOW</Text>
        </View>

        {/* Prototype-only: both designed states until real uploads exist. */}
        <View style={styles.toggle}>
          <Text style={styles.toggleLabel}>Preview state</Text>
          <SegmentedControl segments={STATE_SEGMENTS} value={state} onChange={setState} style={styles.toggleControl} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  content: {
    paddingHorizontal: v.padX,
    paddingTop: v.stepGap,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepText: {
    fontFamily: font.appSemi,
    fontSize: v.stepSize,
    letterSpacing: v.stepSpacing,
    color: colors.textPrimary,
  },
  barTrack: {
    marginTop: v.barGap,
    height: v.barHeight,
    borderRadius: v.barRadius,
    backgroundColor: v.barTrack,
    overflow: 'hidden',
  },
  barFill: {
    width: '80%',
    height: '100%',
    borderRadius: v.barRadius,
    backgroundColor: colors.brand,
  },
  title: {
    marginTop: v.titleGap,
    fontFamily: font.appHeading,
    fontSize: v.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: v.subtitleGap,
    fontFamily: font.appBody,
    fontSize: v.subtitleSize,
    lineHeight: v.subtitleLineHeight,
    color: colors.textBody,
  },
  label: {
    marginTop: v.labelGap,
    fontFamily: font.appSemi,
    fontSize: v.labelSize,
    color: colors.textPrimary,
  },
  list: {
    marginTop: v.listGap,
  },
  row: {
    minHeight: v.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: v.divider,
  },
  rowIcon: {
    width: v.rowIcon,
    height: v.rowIcon,
    borderRadius: v.rowIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: v.rowTextGap,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: font.appHeading,
    fontSize: v.rowTitleSize,
    color: colors.textPrimary,
  },
  rowStatus: {
    marginTop: v.rowStatusGap,
    fontFamily: font.appBody,
    fontSize: v.rowStatusSize,
    color: v.required,
  },
  rowMeta: {
    marginTop: v.rowMetaGap,
    fontFamily: font.appBody,
    fontSize: v.rowMetaSize,
    color: v.meta,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: v.actionGap,
  },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: v.uploadIconGap,
  },
  uploadText: {
    fontFamily: font.appSemi,
    fontSize: v.uploadSize,
    color: colors.textPrimary,
  },
  add: {
    marginTop: v.addGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: v.addIconGap,
    borderTopWidth: 1,
    borderTopColor: v.divider,
    paddingTop: v.addGap,
  },
  addText: {
    fontFamily: font.appBody,
    fontSize: v.addSize,
    color: colors.textPrimary,
  },
  note: {
    marginTop: v.noteGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: v.noteIconGap,
  },
  noteText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: v.noteSize,
    lineHeight: v.noteLineHeight,
    color: colors.textBody,
  },
  button: {
    marginTop: v.buttonGap,
    height: v.buttonHeight,
    borderRadius: v.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: v.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: v.buttonTextSize,
    color: ink.onBrand,
  },
  footerRow: {
    marginTop: v.footerGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: v.footerIconGap,
  },
  footerText: {
    fontFamily: font.appSemi,
    fontSize: v.footerSize,
    letterSpacing: v.footerSpacing,
    color: colors.textBody,
  },
  toggle: {
    marginTop: v.toggleGap,
    alignItems: 'center',
    gap: 8,
  },
  toggleControl: {
    alignSelf: 'stretch',
  },
  toggleLabel: {
    fontFamily: font.appBody,
    fontSize: v.stepSize,
    letterSpacing: v.stepSpacing,
    color: colors.textMuted,
  },
});

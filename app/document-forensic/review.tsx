import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  ChevronLeft,
  CircleCheck,
  Clock,
  Copy,
  FileStack,
  FileText,
  IdCard,
  Plus,
  RefreshCw,
  ScanSearch,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, dfReview as t, dfUpload as u, font, ink } from '../../constants/theme';
import { useDocumentForensic } from '../../context/documentForensic';
import { DF_SAMPLE, PAGE_OVERAGE_NOTE, dfDocTypeLabel } from '../../data/documentForensic';
import { clientDocHref } from '../../data/docLinks';

// Review Request (design/85).
//
// REPORTED — OVERLAPPING ACTION ROWS. design/85 draws the reference document with an
// action row INLINE beside the file (View / Replace) and a SECOND action row below it
// (View / Replace / Remove). The two overlap in the file. Built as one action row per
// file, which is the cleaner reading and matches design/84's own reference row: the
// primary document gets View / Replace / Remove, the reference gets View / Replace.
//
// Every action here is inert — no upload flow exists anywhere in the app.

export default function DocumentForensicReviewScreen() {
  const insets = useSafeAreaInsets();
  const { form } = useDocumentForensic();

  const rows: { icon: LucideIcon; label: string; value: string }[] = [
    {
      icon: FileText,
      label: 'Document Type',
      // design/85 reads "PDF Agreement" where design/84's picker reads
      // "Agreement / Contract". The picker's value is used when one is chosen.
      value: dfDocTypeLabel(form.docType) || 'PDF Agreement',
    },
    { icon: FileStack, label: 'Number of Files', value: '1 File' },
    { icon: ScanSearch, label: 'Requested Analysis', value: 'Comprehensive Forensic Analysis' },
    { icon: Clock, label: 'Estimated Report Delivery', value: '24 - 48 Hours' },
    { icon: IdCard, label: 'Request ID (After Payment)', value: 'Will be generated' },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/document-forensic/upload')
          }
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Review Request
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.block}>
          <View style={styles.attachedHead}>
            <CircleCheck size={u.attachedTick} color={colors.textPrimary} />
            <Text style={styles.attachedLabel} {...shrinkToFit(0.8)}>
              Document Attached
            </Text>
            <View style={styles.attachedChip}>
              <Text style={styles.attachedChipText} {...shrinkToFit(0.8)}>
                {DF_SAMPLE.documentFormat} • {DF_SAMPLE.documentSize}
              </Text>
            </View>
          </View>

          <View style={styles.file}>
            <View style={styles.fileIcon}>
              <FileText size={u.fileIconGlyph} color={ink.accent} />
            </View>
            <View style={styles.fileText}>
              <Text style={styles.fileName} {...shrinkToFit(0.75)}>
                {DF_SAMPLE.documentName}
              </Text>
              <Text style={styles.fileSub} {...shrinkToFit(0.8)}>
                {DF_SAMPLE.documentMeta}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Action icon={FileText} label="View" onPress={() => router.push(clientDocHref(DF_SAMPLE.documentName) as Href)} />
            <Action icon={RefreshCw} label="Replace" />
            <Action icon={Trash2} label="Remove" danger />
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.attachedHead}>
            <CircleCheck size={u.attachedTick} color="#12B76A" />
            <View style={styles.refText}>
              <Text style={styles.fileName} {...shrinkToFit(0.75)}>
                {DF_SAMPLE.referenceName}
              </Text>
              <Text style={styles.fileSub} {...shrinkToFit(0.8)}>
                {DF_SAMPLE.referenceSize} • {DF_SAMPLE.referenceState}
              </Text>
            </View>
          </View>

          {/* One action row, not two — see the note at the top of the file. */}
          <View style={styles.actions}>
            <Action icon={FileText} label="View" onPress={() => router.push(clientDocHref(DF_SAMPLE.referenceName) as Href)} />
            <Action icon={RefreshCw} label="Replace" />
          </View>
        </View>

        <Text style={styles.overage}>{PAGE_OVERAGE_NOTE}</Text>

        <Pressable onPress={() => previewNotice("Upload More")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.uploadMore, pressed && styles.pressed]}
        >
          <Plus size={t.uploadMoreIcon} color={ink.accent} />
          <Text style={styles.uploadMoreLabel} {...shrinkToFit(0.8)}>
            Upload More
          </Text>
        </Pressable>

        <View style={styles.summary}>
          {rows.map((r, i) => (
            <View key={r.label} style={i > 0 ? styles.row : styles.rowFirst}>
              <r.icon size={t.rowIcon} color={colors.textBody} style={styles.rowIcon} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                  {r.label}
                </Text>
                <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
                  {r.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/document-forensic/payment')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Proceed to Payment</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Action({
  icon: Icon,
  label,
  danger,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, danger && styles.actionDanger, pressed && styles.pressed]}
    >
      <Icon size={u.actionIcon} color={danger ? u.removeText : colors.textPrimary} />
      <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]} {...shrinkToFit(0.75)}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: t.backIcon,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  block: {
    marginTop: t.blockGap,
    borderRadius: u.attachedRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: u.attachedPad,
  },
  attachedHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachedLabel: {
    flex: 1,
    minWidth: 0,
    marginLeft: u.attachedTickGap,
    fontFamily: font.appHeading,
    fontSize: u.attachedLabelSize,
    color: colors.textPrimary,
  },
  attachedChip: {
    marginLeft: 8,
    minHeight: u.attachedChipHeight,
    borderRadius: u.attachedChipRadius,
    paddingHorizontal: u.attachedChipPadX,
    backgroundColor: u.attachedChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachedChipText: {
    fontFamily: font.appSemi,
    fontSize: u.attachedChipSize,
    color: colors.textBody,
  },
  refText: {
    flex: 1,
    minWidth: 0,
    marginLeft: u.attachedTickGap,
  },
  file: {
    marginTop: u.fileGap,
    borderRadius: u.fileRadius,
    backgroundColor: u.fileBg,
    padding: u.filePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: u.fileIcon,
    height: u.fileIcon,
    borderRadius: u.fileIconRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: {
    flex: 1,
    minWidth: 0,
    marginLeft: u.fileIconGap,
  },
  fileName: {
    fontFamily: font.appHeading,
    fontSize: u.fileNameSize,
    color: colors.textPrimary,
  },
  fileSub: {
    marginTop: u.fileSubGap,
    fontFamily: font.appBody,
    fontSize: u.fileSubSize,
    color: colors.textBody,
  },
  actions: {
    marginTop: u.actionGap,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: u.actionColGap,
  },
  action: {
    minHeight: u.actionHeight,
    borderRadius: u.actionRadius,
    paddingHorizontal: u.actionPadX,
    backgroundColor: u.actionBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionDanger: {
    backgroundColor: u.removeBg,
  },
  actionLabel: {
    marginLeft: u.actionIconGap,
    fontFamily: font.appSemi,
    fontSize: u.actionSize,
    color: colors.textPrimary,
  },
  actionLabelDanger: {
    color: u.removeText,
  },
  overage: {
    marginTop: t.overageGap,
    fontFamily: font.appBody,
    fontSize: t.overageSize,
    color: t.overageColour,
  },
  uploadMore: {
    marginTop: t.uploadMoreGap,
    alignSelf: 'center',
    minHeight: t.uploadMoreHeight,
    borderRadius: t.uploadMoreRadius,
    paddingHorizontal: t.uploadMorePadX,
    borderWidth: 1,
    borderColor: t.uploadMoreBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadMoreLabel: {
    marginLeft: t.uploadMoreIconGap,
    fontFamily: font.appSemi,
    fontSize: t.uploadMoreSize,
    color: ink.accent,
  },
  summary: {
    marginTop: t.summaryGap,
    borderRadius: t.summaryRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.summaryPad,
  },
  rowFirst: {
    flexDirection: 'row',
  },
  row: {
    marginTop: t.rowGap,
    flexDirection: 'row',
  },
  rowIcon: {
    marginTop: 2,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.rowIconGap,
  },
  rowLabel: {
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: {
    marginTop: t.rowValueGap,
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
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
});

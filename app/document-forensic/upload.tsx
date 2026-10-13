import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  FileText,
  FolderOpen,
  Images,
  PenLine,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, dfUpload as t, font, ink } from '../../constants/theme';
import { useDocumentForensic } from '../../context/documentForensic';
import { DF_DOC_TYPES, DF_SAMPLE, dfDocTypeLabel } from '../../data/documentForensic';
import { clientDocHref } from '../../data/docLinks';

// Upload Document (design/84).
//
// REPORTED — TENTH HEADER STYLE. Back arrow, a caps eyebrow over the title, and an
// avatar, with a separate strip below carrying a left-hand label and a step pill. No
// other screen in the app draws this; built as its own header.
//
// REPORTED — NOTHING HERE UPLOADS. Browse Files, Camera, Gallery, Files, Upload
// Reference Document, View, Replace and Remove are all inert. No upload flow is
// designed anywhere in the app, and the prototype cannot read files. The attached
// document and reference shown are the file's own samples, drawn as already present.
//
// REPORTED — the brief describes a DASHED drop card. Measured, design/84's card edge
// shows no dash pattern: it is a plain light border. Rendered solid, as drawn.

const SOURCES: { icon: LucideIcon; label: string }[] = [
  { icon: Camera, label: 'Camera' },
  { icon: Images, label: 'Gallery' },
  { icon: FolderOpen, label: 'Files' },
];

export default function DocumentForensicUploadScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = useDocumentForensic();
  const [picking, setPicking] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/document-forensic'))}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow} {...shrinkToFit(0.8)}>
            FORENSIC WORKFLOW
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Upload Document
          </Text>
        </View>
        <View style={styles.avatar}>
          <UserRound size={t.avatarIcon} color={ink.onBrand} />
        </View>
      </View>

      <View style={styles.strip}>
        <ShieldCheck size={t.stripIcon} color={ink.accent} />
        <Text style={styles.stripLabel} {...shrinkToFit(0.8)}>
          FORENSIC AUTHENTICATION
        </Text>
        <View style={styles.step}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText} {...shrinkToFit(0.8)}>
            Step 2 of 3
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.groupGap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
            Document to Examine
          </Text>
          <Text style={styles.sectionHint} {...shrinkToFit(0.75)}>
            PDF, JPG, PNG up to 25MB
          </Text>
        </View>

        <View style={styles.drop}>
          <View style={styles.dropIcon}>
            <Upload size={t.dropIconGlyph} color={ink.accent} />
          </View>
          <Text style={styles.dropText}>
            Upload a high-resolution scan or photo of the questioned document.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.browse, pressed && styles.pressed]}
          >
            <FolderOpen size={t.browseIcon} color={ink.onBrand} />
            <Text style={styles.browseLabel}>Browse Files</Text>
          </Pressable>
          <View style={styles.sources}>
            {SOURCES.map((s) => (
              <Pressable
                key={s.label}
                accessibilityRole="button"
                style={({ pressed }) => [styles.source, pressed && styles.pressed]}
              >
                <s.icon size={t.sourceIcon} color={colors.textPrimary} />
                <Text style={styles.sourceLabel} {...shrinkToFit(0.75)}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.attached}>
          <View style={styles.attachedHead}>
            <CircleCheck size={t.attachedTick} color={colors.textPrimary} />
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
              <FileText size={t.fileIconGlyph} color={ink.accent} />
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

        <Text style={[styles.sectionTitle, styles.groupTitle]} {...shrinkToFit(0.8)}>
          Document Type
        </Text>
        <Text style={styles.sectionDesc}>
          Select the legal category of the document being examined.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: picking }}
          onPress={() => setPicking(true)}
          style={styles.select}
        >
          <Text style={styles.selectValue} {...shrinkToFit(0.8)}>
            {dfDocTypeLabel(form.docType) || DF_SAMPLE.docType}
          </Text>
          <ChevronDown size={t.sourceIcon + 2} color={colors.textPrimary} />
        </Pressable>

        <Text style={[styles.sectionTitle, styles.groupTitle]} {...shrinkToFit(0.8)}>
          Government Document
        </Text>
        <View style={styles.refRow}>
          <View style={styles.refIcon}>
            <PenLine size={t.refIconGlyph} color={ink.accent} />
          </View>
          <Text style={styles.refText}>
            Upload a previously signed document containing the same person&apos;s known signature.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.refButton, pressed && styles.pressed]}
        >
          <Upload size={t.refButtonIcon} color={colors.textPrimary} />
          <Text style={styles.refButtonLabel} {...shrinkToFit(0.75)}>
            Upload Reference Document
          </Text>
          <Text style={styles.refHint} {...shrinkToFit(0.75)}>
            PDF, JPG, PNG
          </Text>
        </Pressable>

        <View style={styles.refFile}>
          <CircleCheck size={t.attachedTick} color="#12B76A" />
          <View style={styles.refFileText}>
            <Text style={styles.fileName} {...shrinkToFit(0.7)}>
              {DF_SAMPLE.referenceName}
            </Text>
            <Text style={styles.fileSub} {...shrinkToFit(0.8)}>
              {DF_SAMPLE.referenceSize} • {DF_SAMPLE.referenceState}
            </Text>
          </View>
          <Action icon={FileText} label="View" compact onPress={() => router.push(clientDocHref(DF_SAMPLE.referenceName) as Href)} />
          <Action icon={RefreshCw} label="Replace" compact />
        </View>

        <Pressable accessibilityRole="button" hitSlop={8} style={styles.noSample}>
          <CircleHelp size={t.noSampleIcon} color={colors.textMuted} />
          <Text style={styles.noSampleText} {...shrinkToFit(0.8)}>
            I don&apos;t have a reference sample
          </Text>
        </Pressable>

        <Text style={[styles.sectionTitle, styles.groupTitle]} {...shrinkToFit(0.8)}>
          Specific Instructions
        </Text>
        <Text style={styles.sectionDesc}>
          Provide any notes, specific clauses, or focal areas for our forensic expert.
        </Text>
        <TextInput
          multiline
          textAlignVertical="top"
          placeholder="E.g., Compare signature on page 3 clause 12 against known signature in reference agreement..."
          placeholderTextColor={colors.textMuted}
          value={form.instructions}
          onChangeText={(v) => update({ instructions: v })}
          style={styles.area}
        />

        <View style={styles.note}>
          <CircleCheck size={t.noteIcon} color={ink.accent} />
          <Text style={styles.noteText}>
            <Text style={styles.noteLead}>Scientific Document Verification: </Text>
            All submitted records are processed in encrypted ISO/IEC-compliant environments. Handled
            strictly by accredited forensic document examiners.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/document-forensic'))}
          style={({ pressed }) => [styles.barButton, styles.barBack, pressed && styles.pressed]}
        >
          <ArrowLeft size={t.barIcon} color={colors.textPrimary} />
          <Text style={styles.barBackLabel}>Back</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/document-forensic/review')}
          style={({ pressed }) => [styles.barButton, styles.barNext, pressed && styles.pressed]}
        >
          <Text style={styles.barNextLabel}>Continue</Text>
          <ArrowRight size={t.barIcon} color={ink.onBrand} style={styles.barNextIcon} />
        </Pressable>
      </View>

      <Modal visible={picking} transparent animationType="fade" onRequestClose={() => setPicking(false)}>
        <Pressable style={styles.scrim} accessibilityLabel="Dismiss" onPress={() => setPicking(false)}>
          <Pressable style={styles.panel} onPress={() => {}}>
            {DF_DOC_TYPES.map((d, i) => {
              const on = form.docType === d.id;
              return (
                <View key={d.id}>
                  {i > 0 && <View style={styles.panelDivider} />}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      update({ docType: d.id });
                      setPicking(false);
                    }}
                    style={({ pressed }) => [styles.panelRow, pressed && styles.pressed]}
                  >
                    <Text style={styles.panelText} {...shrinkToFit(0.8)}>
                      {d.label}
                    </Text>
                    {on && <Check size={t.sourceIcon + 3} color={colors.textPrimary} strokeWidth={2.5} />}
                  </Pressable>
                </View>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Action({
  icon: Icon,
  label,
  danger,
  compact,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  compact?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        compact && styles.actionCompact,
        danger && styles.actionDanger,
        pressed && styles.pressed,
      ]}
    >
      {!compact && (
        <Icon size={t.actionIcon} color={danger ? t.removeText : colors.textPrimary} />
      )}
      <Text
        style={[styles.actionLabel, !compact && styles.actionLabelGap, danger && styles.actionLabelDanger]}
        {...shrinkToFit(0.75)}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    marginRight: 10,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowSpacing,
    color: colors.textMuted,
  },
  headerTitle: {
    marginTop: t.eyebrowGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strip: {
    paddingHorizontal: t.padX,
    paddingTop: t.stripTop,
    paddingBottom: t.stripPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stripLabel: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.stripIconGap,
    fontFamily: font.appSemi,
    fontSize: t.stripLabelSize,
    letterSpacing: t.stripLabelSpacing,
    color: colors.textBody,
  },
  step: {
    marginLeft: 10,
    minHeight: t.stepHeight,
    borderRadius: t.stepRadius,
    paddingHorizontal: t.stepPadX,
    backgroundColor: t.stepBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: t.stepDot,
    height: t.stepDot,
    borderRadius: t.stepDot / 2,
    marginRight: t.stepDotGap,
    backgroundColor: t.stepText,
  },
  stepText: {
    fontFamily: font.appSemi,
    fontSize: t.stepSize,
    color: t.stepText,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  groupTitle: {
    marginTop: t.groupGap,
  },
  sectionHint: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.sectionHintSize,
    color: colors.textBody,
  },
  sectionDesc: {
    marginTop: t.sectionDescGap,
    fontFamily: font.appBody,
    fontSize: t.sectionDescSize,
    lineHeight: t.sectionDescLineHeight,
    color: colors.textBody,
  },
  drop: {
    marginTop: t.dropGap,
    borderRadius: t.dropRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.dropBorder,
    padding: t.dropPad,
    alignItems: 'center',
  },
  dropIcon: {
    width: t.dropIcon,
    height: t.dropIcon,
    borderRadius: t.dropIcon / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropText: {
    marginTop: t.dropTextGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.dropTextSize,
    lineHeight: t.dropTextLineHeight,
    color: colors.textBody,
  },
  browse: {
    alignSelf: 'stretch',
    marginTop: t.browseGap,
    minHeight: t.browseHeight,
    borderRadius: t.browseRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseLabel: {
    marginLeft: t.browseIconGap,
    fontFamily: font.appSemi,
    fontSize: t.browseSize,
    color: ink.onBrand,
  },
  sources: {
    alignSelf: 'stretch',
    marginTop: t.sourceGap,
    flexDirection: 'row',
    gap: t.sourceColGap,
  },
  source: {
    flex: 1,
    minWidth: 0,
    minHeight: t.sourceHeight,
    borderRadius: t.sourceRadius,
    backgroundColor: t.sourceBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sourceLabel: {
    marginLeft: t.sourceIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.sourceSize,
    color: colors.textPrimary,
  },
  attached: {
    marginTop: t.attachedGap,
    borderRadius: t.attachedRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.attachedPad,
  },
  attachedHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachedLabel: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.attachedTickGap,
    fontFamily: font.appHeading,
    fontSize: t.attachedLabelSize,
    color: colors.textPrimary,
  },
  attachedChip: {
    marginLeft: 8,
    minHeight: t.attachedChipHeight,
    borderRadius: t.attachedChipRadius,
    paddingHorizontal: t.attachedChipPadX,
    backgroundColor: t.attachedChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachedChipText: {
    fontFamily: font.appSemi,
    fontSize: t.attachedChipSize,
    color: colors.textBody,
  },
  file: {
    marginTop: t.fileGap,
    borderRadius: t.fileRadius,
    backgroundColor: t.fileBg,
    padding: t.filePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: t.fileIcon,
    height: t.fileIcon,
    borderRadius: t.fileIconRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.fileIconGap,
  },
  fileName: {
    fontFamily: font.appHeading,
    fontSize: t.fileNameSize,
    color: colors.textPrimary,
  },
  fileSub: {
    marginTop: t.fileSubGap,
    fontFamily: font.appBody,
    fontSize: t.fileSubSize,
    color: colors.textBody,
  },
  actions: {
    marginTop: t.actionGap,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: t.actionColGap,
  },
  action: {
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    paddingHorizontal: t.actionPadX,
    backgroundColor: t.actionBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCompact: {
    paddingHorizontal: 11,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionDanger: {
    backgroundColor: t.removeBg,
  },
  actionLabel: {
    fontFamily: font.appSemi,
    fontSize: t.actionSize,
    color: colors.textPrimary,
  },
  actionLabelGap: {
    marginLeft: t.actionIconGap,
  },
  actionLabelDanger: {
    color: t.removeText,
  },
  select: {
    marginTop: t.dropGap,
    minHeight: t.browseHeight,
    borderRadius: t.browseRadius,
    backgroundColor: t.sourceBg,
    paddingHorizontal: t.filePad + 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValue: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.browseSize - 1,
    color: colors.textPrimary,
  },
  refRow: {
    marginTop: t.refRowGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refIcon: {
    width: t.refIcon,
    height: t.refIcon,
    borderRadius: t.refIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.refIconGap,
    fontFamily: font.appBody,
    fontSize: t.refTextSize,
    lineHeight: t.refTextLineHeight,
    color: colors.textBody,
  },
  refButton: {
    marginTop: t.refButtonGap,
    minHeight: t.refButtonHeight,
    borderRadius: t.refButtonRadius,
    backgroundColor: t.refButtonBg,
    paddingHorizontal: t.filePad + 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refButtonLabel: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.refButtonIconGap,
    fontFamily: font.appSemi,
    fontSize: t.refButtonSize,
    color: colors.textPrimary,
  },
  refHint: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.refHintSize,
    color: colors.textBody,
  },
  refFile: {
    marginTop: t.refButtonGap,
    borderRadius: t.fileRadius,
    backgroundColor: t.fileBg,
    padding: t.filePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refFileText: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
  },
  noSample: {
    marginTop: t.noSampleGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noSampleText: {
    marginLeft: t.noSampleIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.noSampleSize,
    color: colors.textBody,
  },
  area: {
    marginTop: t.areaGap,
    minHeight: t.areaHeight,
    borderRadius: t.areaRadius,
    backgroundColor: t.areaBg,
    borderWidth: 1,
    borderColor: t.areaBorder,
    padding: t.areaPad,
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    lineHeight: t.areaLineHeight,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
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
  noteLead: {
    fontFamily: font.appHeading,
    color: colors.textPrimary,
  },
  bar: {
    paddingHorizontal: t.padX,
    paddingTop: t.barPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: t.barColGap,
  },
  barButton: {
    minHeight: t.barHeight,
    borderRadius: t.barRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barBack: {
    paddingHorizontal: 22,
    backgroundColor: t.barBackBg,
  },
  barBackLabel: {
    marginLeft: t.barIconGap,
    fontFamily: font.appSemi,
    fontSize: t.barSize,
    color: colors.textPrimary,
  },
  barNext: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.brand,
  },
  barNextLabel: {
    fontFamily: font.appSemi,
    fontSize: t.barSize,
    color: ink.onBrand,
  },
  barNextIcon: {
    marginLeft: t.barIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(28, 24, 20, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: t.padX + 8,
  },
  panel: {
    borderRadius: t.dropRadius,
    backgroundColor: colors.card,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  panelDivider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: colors.border,
  },
  panelRow: {
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  panelText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: 14.5,
    color: colors.textPrimary,
  },
});

import { previewNotice } from '../../../../components/PreviewNotice';
import DemoPressable from '../../../../components/DemoPressable';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  Brain,
  Check,
  CirclePlus,
  FileText,
  FolderOpen,
  Gavel,
  Pencil,
  Receipt,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_PSR_EDITOR } from '../../../../data/advocateSide';
import { advPsrEditor as t, colors, font, ink } from '../../../../constants/theme';

// Property search report editor (design/208).
//
// ⚠⚠ THIS IS NOT THE PROPERTY FROM designs 206/207. Owner, acquisition, scheme,
// khasra, plot, village and reference all differ for the same journey. Rendered
// exactly as design/208 draws it; see the table in data/advocateSide.ts.
//
// ⚠ design/208 also contradicts itself, as design/207 does: Property Address reads
// "Plot No. 42, Scheme No. 54" while the Plot Number cell reads "42-B".
//
// ⚠ EIGHTH AI SURFACE. The Legalitt AI card is static — the "Suggested Revision"
// was not generated, and Apply Revision changes nothing. Its disclaimer is the most
// specific in the project and is worth adopting across the other seven surfaces.
//
// ⚠ "Step 3 of 5 · Report Editor" is a SEVENTH STEPPER IDIOM, a bare label inside
// no counter — the same shape as design/188's "Step 3 of 5".
//
// ⚠ design/208 shows the client's FULL mobile and email where design/207 masks both.
//
// ⚠ The header title, three Documents Checked names and the third suggestion chip
// are clipped in the export; completions are INFERRED and flagged in the data file.
//
// All pencils, the AI panel and Add Document Record are inert.

const DOC_ICONS = { deed: FileText, folder: FolderOpen, receipt: Receipt, seal: BadgeCheck };

function Field({
  label,
  value,
  style,
}: {
  label: string;
  value: string;
  style?: object;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel} {...shrinkToFit(0.75)}>
        {label}
      </Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function Section({
  n,
  title,
  sub,
  icon,
  children,
}: {
  n: number;
  title: string;
  sub?: string;
  icon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.secRow}>
        {icon ? (
          <View style={styles.secIcon}>
            <ShieldCheck size={t.secIconGlyph} color={colors.brandDark} />
          </View>
        ) : (
          <View style={styles.secDot} />
        )}
        <View style={styles.secText}>
          <Text style={styles.secTitle} {...shrinkToFit(0.75)}>
            {n}. {title}
          </Text>
          {sub && (
            <Text style={styles.secSub} {...shrinkToFit(0.75)}>
              {sub}
            </Text>
          )}
        </View>
        {/* Inert — no editor is specified. */}
        <Pressable onPress={() => previewNotice(`Edit ${title}`)} accessibilityRole="button" accessibilityLabel={`Edit ${title}`} hitSlop={8}>
          <Pencil size={t.pencil} color={colors.textPrimary} />
        </Pressable>
      </View>
      {children}
    </View>
  );
}

export default function AdvocatePsrEditorScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = ADV_PSR_EDITOR;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} {...shrinkToFit(0.7)}>
            {e.title}
          </Text>
          {/* ⚠ Seventh stepper idiom — see the note at the top. */}
          <Text style={styles.step} {...shrinkToFit(0.75)}>
            {e.step}
          </Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText} {...shrinkToFit(0.8)}>
            {e.statusChip}
          </Text>
        </View>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.matterRow}>
            <View style={styles.matterText}>
              <Text style={styles.matter}>{e.matter}</Text>
              <Text style={styles.matterRef}>{e.matterRef}</Text>
            </View>
            {/* ⚠ design/208 draws this in brand brown with sparkles, not the purple mark. */}
            <Pressable onPress={() => previewNotice(e.assistChip)} accessibilityRole="button" style={styles.assist}>
              <Sparkles size={t.assistIcon} color={colors.brandDark} />
              <Text style={styles.assistText} {...shrinkToFit(0.8)}>
                {e.assistChip}
              </Text>
            </Pressable>
          </View>
        </View>

        <Section n={1} title={e.client.title}>
          <View style={styles.row}>
            {e.client.cells.map((c) => (
              <Field key={c.label} {...c} style={styles.half} />
            ))}
          </View>
          {e.client.wide.map((c) => (
            <Field key={c.label} {...c} />
          ))}
        </Section>

        <Section n={2} title={e.property.title}>
          {e.property.wide.map((c) => (
            <Field key={c.label} {...c} />
          ))}
          <View style={styles.row}>
            {e.property.cells.slice(0, 2).map((c) => (
              <Field key={c.label} {...c} style={styles.half} />
            ))}
          </View>
          <View style={styles.row}>
            {e.property.cells.slice(2).map((c) => (
              <Field key={c.label} {...c} style={styles.half} />
            ))}
          </View>
          <Field {...e.property.area} />
        </Section>

        <Section n={3} title={e.owner.title}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel} {...shrinkToFit(0.75)}>
              {e.owner.current.label}
            </Text>
            <Text style={styles.fieldValue}>{e.owner.current.name}</Text>
            <Text style={styles.relation} {...shrinkToFit(0.75)}>
              {e.owner.current.relation}
            </Text>
          </View>
          <View style={styles.row}>
            {e.owner.cells.map((c) => (
              <Field key={c.label} {...c} style={styles.half} />
            ))}
          </View>
          <Field {...e.owner.previous} />
        </Section>

        <Section n={4} title={e.documents.title}>
          {e.documents.rows.map((d) => {
            const Icon = DOC_ICONS[d.icon];
            return (
              <View key={d.name} style={styles.docRow}>
                <Icon size={t.docIcon} color={colors.brandDark} />
                <View style={styles.docText}>
                  <Text style={styles.docName} {...shrinkToFit(0.7)}>
                    {d.name}
                  </Text>
                  <Text style={styles.docSub}>{d.sub}</Text>
                </View>
                <View style={styles.checked}>
                  <Check size={t.checkedIcon} color={t.checkedColour} />
                  <Text style={styles.checkedText} {...shrinkToFit(0.8)}>
                    {e.documents.chip}
                  </Text>
                </View>
              </View>
            );
          })}
          {/* Inert — no add flow is designed. */}
          <Pressable onPress={() => previewNotice(e.documents.add)} accessibilityRole="button" style={styles.add}>
            <CirclePlus size={t.addIcon} color={t.addColour} />
            <Text style={styles.addText} {...shrinkToFit(0.8)}>
              {e.documents.add}
            </Text>
          </Pressable>
          <Text style={styles.docFoot}>{e.documents.footnote}</Text>
        </Section>

        <Section n={5} title={e.search.title}>
          <View style={styles.row}>
            {e.search.cells.map((c) => (
              <Field key={c.label} {...c} style={styles.half} />
            ))}
          </View>
          {e.search.wide.map((c) => (
            <Field key={c.label} {...c} />
          ))}
          <Field {...e.search.notes} />
        </Section>

        <Section n={6} title={e.history.title}>
          <View style={styles.field}>
            {/* ⚠ design/208 cuts this off mid-sentence. Kept as drawn. */}
            <Text style={styles.histBody}>{e.history.body}</Text>
            <View style={styles.histMeta}>
              <ShieldCheck size={t.histIcon} color={colors.textBody} />
              <Text style={styles.histMetaText} {...shrinkToFit(0.75)}>
                {e.history.verified}
              </Text>
              <Text style={styles.histEdit} {...shrinkToFit(0.8)}>
                {e.history.edit}
              </Text>
            </View>
          </View>
        </Section>

        <Section n={7} title={e.findings.title}>
          <View style={styles.field}>
            {e.findings.rows.map((f, i) => (
              <View key={f.lead} style={[styles.findRow, i > 0 && styles.findNext]}>
                <View style={styles.findBullet} />
                <Text style={styles.findText}>
                  <Text style={styles.findLead}>{f.lead}</Text> {f.body}
                </Text>
              </View>
            ))}
            <Text style={styles.findFoot}>{e.findings.footnote}</Text>
          </View>
        </Section>

        <Section n={8} title={e.conclusion.title} sub={e.conclusion.sub} icon>
          <View style={styles.field}>
            <Text style={styles.concBody}>{e.conclusion.body}</Text>
            <View style={styles.concCells}>
              <View style={styles.concCell}>
                <Gavel size={t.concIcon} color={colors.brandDark} />
                <Text style={styles.concCellText}>{e.conclusion.cells[0].label}</Text>
              </View>
              <View style={styles.concCell}>
                <Text style={[styles.concCellText, styles.concPlain]}>
                  {e.conclusion.cells[1].label}
                </Text>
              </View>
            </View>
          </View>
        </Section>

        {/* ⚠ EIGHTH AI SURFACE — static. Nothing here was generated. */}
        <View style={styles.ai}>
          <View style={styles.aiHead}>
            <View style={styles.aiDot} />
            <Text style={styles.aiLabel} {...shrinkToFit(0.75)}>
              {e.ai.label}
            </Text>
            <View style={styles.aiChip}>
              <Text style={styles.aiChipText} {...shrinkToFit(0.75)}>
                {e.ai.chip}
              </Text>
            </View>
          </View>
          <Text style={styles.aiTitle} {...shrinkToFit(0.75)}>
            {e.ai.title}
          </Text>
          <Text style={styles.aiSub}>{e.ai.sub}</Text>

          <View style={styles.aiInput}>
            <Text style={styles.aiInputText} {...shrinkToFit(0.7)}>
              {e.ai.placeholder}
            </Text>
            <View style={styles.aiSend}>
              <SendHorizontal size={t.aiSendIcon} color={ink.onBrand} />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.aiSuggRow}
            contentContainerStyle={styles.aiSuggContent}
          >
            {e.ai.suggestions.map((s) => (
              <Pressable key={s} accessibilityRole="button" style={styles.aiSugg}>
                <Text style={styles.aiSuggText} numberOfLines={1}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.rev}>
            <View style={styles.revHead}>
              <View style={styles.revIcon}>
                <Brain size={t.revIconGlyph} color={colors.textPrimary} />
              </View>
              <Text style={styles.revTitle} {...shrinkToFit(0.7)}>
                {e.ai.revisionTitle}
              </Text>
              <Text style={styles.revPreview} {...shrinkToFit(0.75)}>
                {e.ai.livePreview}
              </Text>
            </View>

            <View style={[styles.revBlock, styles.revOrig]}>
              <View style={[styles.revTag, styles.revTagOrig]}>
                <Text style={styles.revTagText} {...shrinkToFit(0.8)}>
                  {e.ai.originalChip}
                </Text>
              </View>
              <Text style={styles.revText}>{e.ai.original}</Text>
            </View>

            <View style={[styles.revBlock, styles.revAi]}>
              <View style={[styles.revTag, styles.revTagAi]}>
                <Text style={[styles.revTagText, styles.revTagAiText]} {...shrinkToFit(0.8)}>
                  {e.ai.revisionChip}
                </Text>
              </View>
              <Text style={styles.revText}>{e.ai.revision}</Text>
            </View>

            <View style={styles.revBtns}>
              <Pressable onPress={() => previewNotice(e.ai.apply)} accessibilityRole="button" style={[styles.revBtn, styles.revApply]}>
                <Check size={t.revBtnIcon} color={ink.onBrand} />
                <Text style={styles.revApplyText} {...shrinkToFit(0.8)}>
                  {e.ai.apply}
                </Text>
              </Pressable>
              <Pressable onPress={() => previewNotice(e.ai.keep)} accessibilityRole="button" style={[styles.revBtn, styles.revKeep]}>
                <Text style={styles.revKeepText} {...shrinkToFit(0.8)}>
                  {e.ai.keep}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ⚠ The most specific AI scope statement in the project. */}
          <View style={styles.aiDisc}>
            <BadgeCheck size={t.aiDiscIcon} color={colors.textPrimary} />
            <Text style={styles.aiDiscText}>{e.ai.disclaimer}</Text>
          </View>
        </View>

        <Text style={styles.comp1}>{e.compliance.line1}</Text>
        <Text style={styles.comp2}>{e.compliance.line2}</Text>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.btnRow}>
          <DemoPressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.btn, styles.save, pressed && styles.pressed]}
          >
            <Text style={styles.saveText} {...shrinkToFit(0.8)}>
              {e.saveDraft}
            </Text>
          </DemoPressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/property-search/${id}/response` as Href)}
            style={({ pressed }) => [styles.btn, styles.continue, pressed && styles.pressed]}
          >
            <Text style={styles.continueText} {...shrinkToFit(0.8)}>
              {e.continue}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap, marginRight: 8 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  step: { marginTop: t.stepGap, fontFamily: font.appBody, fontSize: t.stepSize, color: colors.textBody },
  status: {
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    backgroundColor: t.statusBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { fontFamily: font.appBody, fontSize: t.statusSize, color: t.statusColour },
  avatar: {
    marginLeft: t.avatarGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 28 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  matterRow: { flexDirection: 'row', alignItems: 'center' },
  matterText: { flex: 1, minWidth: 0, marginRight: 10 },
  matter: {
    fontFamily: font.appHeading,
    fontSize: t.matterSize,
    lineHeight: t.matterLineHeight,
    color: colors.textPrimary,
  },
  matterRef: {
    marginTop: t.matterRefGap,
    fontFamily: font.appBody,
    fontSize: t.matterRefSize,
    lineHeight: t.matterRefLineHeight,
    color: colors.textBody,
  },
  assist: {
    minHeight: t.assistHeight,
    borderRadius: t.assistRadius,
    paddingHorizontal: t.assistPadX,
    backgroundColor: t.assistBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  assistText: {
    marginLeft: t.assistIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.assistSize,
    color: colors.brandDark,
  },

  secRow: { flexDirection: 'row', alignItems: 'center' },
  secDot: {
    width: t.secDot,
    height: t.secDot,
    borderRadius: t.secDot / 2,
    marginRight: t.secDotGap,
    backgroundColor: colors.brandDark,
  },
  secIcon: {
    width: t.secIcon,
    height: t.secIcon,
    borderRadius: t.secIconRadius,
    marginRight: t.secIconGap,
    backgroundColor: t.secIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secText: { flex: 1, minWidth: 0, marginRight: 8 },
  secTitle: { fontFamily: font.appHeading, fontSize: t.secTitleSize, color: colors.textPrimary },
  secSub: { marginTop: t.secSubGap, fontFamily: font.appBody, fontSize: t.secSubSize, color: colors.brandDark },

  row: { flexDirection: 'row', gap: t.fieldGapX },
  half: { flex: 1, minWidth: 0 },
  field: {
    marginTop: t.fieldGap,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    padding: t.fieldPad,
  },
  fieldLabel: { fontFamily: font.appBody, fontSize: t.fieldLabelSize, color: colors.textBody },
  fieldValue: {
    marginTop: t.fieldValueGap,
    fontFamily: font.appHeading,
    fontSize: t.fieldValueSize,
    lineHeight: t.fieldValueLineHeight,
    color: colors.textPrimary,
  },
  relation: {
    marginTop: t.fieldValueGap,
    fontFamily: font.appBody,
    fontSize: t.fieldValueSize,
    color: colors.textBody,
  },

  docRow: {
    marginTop: t.docRowGap,
    borderRadius: t.docRowRadius,
    backgroundColor: t.docRowBg,
    padding: t.docRowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginLeft: t.docIconGap, marginRight: 8 },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docSub: {
    marginTop: t.docSubGap,
    fontFamily: font.appBody,
    fontSize: t.docSubSize,
    lineHeight: t.docSubLineHeight,
    color: colors.textBody,
  },
  checked: {
    minHeight: t.checkedHeight,
    borderRadius: t.checkedRadius,
    paddingHorizontal: t.checkedPadX,
    backgroundColor: t.checkedBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedText: {
    marginLeft: t.checkedIconGap,
    fontFamily: font.appBody,
    fontSize: t.checkedSize,
    color: t.checkedColour,
  },
  add: {
    marginTop: t.addGap,
    minHeight: t.addHeight,
    borderRadius: t.addRadius,
    backgroundColor: t.addBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { marginLeft: t.addIconGap, fontFamily: font.appSemi, fontSize: t.addSize, color: t.addColour },
  docFoot: {
    marginTop: t.docFootGap,
    fontFamily: font.appBody,
    fontStyle: 'italic',
    fontSize: t.docFootSize,
    lineHeight: t.docFootLineHeight,
    color: colors.textPrimary,
  },

  histBody: {
    fontFamily: font.appBody,
    fontSize: t.histBodySize,
    lineHeight: t.histBodyLineHeight,
    color: colors.textPrimary,
  },
  histMeta: { marginTop: t.histMetaGap, flexDirection: 'row', alignItems: 'center' },
  histMetaText: {
    marginLeft: t.histIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.histMetaSize,
    color: colors.textBody,
  },
  histEdit: { fontFamily: font.appBody, fontSize: t.histMetaSize, color: colors.brandDark },

  findRow: { flexDirection: 'row' },
  findNext: { marginTop: t.findGapY },
  findBullet: {
    width: t.findBullet,
    height: t.findBullet,
    borderRadius: t.findBullet / 2,
    marginTop: 8,
    marginRight: t.findBulletGap,
    backgroundColor: colors.brandDark,
  },
  findText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.findSize,
    lineHeight: t.findLineHeight,
    color: colors.textPrimary,
  },
  findLead: { fontFamily: font.appHeading },
  findFoot: {
    marginTop: t.findFootGap,
    fontFamily: font.appBody,
    fontStyle: 'italic',
    fontSize: t.findFootSize,
    lineHeight: t.findFootLineHeight,
    color: colors.textBody,
  },

  concBody: {
    fontFamily: font.appBody,
    fontSize: t.concBodySize,
    lineHeight: t.concBodyLineHeight,
    color: colors.textPrimary,
  },
  concCells: { marginTop: t.concCellGap, flexDirection: 'row', gap: t.concCellGapX },
  concCell: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start' },
  concCellText: {
    marginLeft: t.concIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.concCellSize,
    lineHeight: t.concCellLineHeight,
    color: colors.brandDark,
  },
  concPlain: { marginLeft: 0, fontFamily: font.appBody, color: colors.textPrimary },

  ai: {
    marginBottom: t.cardGap,
    borderRadius: t.aiRadius,
    backgroundColor: t.aiBg,
    padding: t.aiPad,
  },
  aiHead: { flexDirection: 'row', alignItems: 'center' },
  aiDot: {
    width: t.aiDot,
    height: t.aiDot,
    borderRadius: t.aiDot / 2,
    marginRight: t.aiDotGap,
    backgroundColor: '#6B5A45',
  },
  aiLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.aiLabelSize,
    letterSpacing: t.aiLabelSpacing,
    color: colors.textPrimary,
  },
  aiChip: {
    minHeight: t.aiChipHeight,
    borderRadius: t.aiChipRadius,
    paddingHorizontal: t.aiChipPadX,
    backgroundColor: t.aiChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  aiChipText: {
    fontFamily: font.appBody,
    fontStyle: 'italic',
    fontSize: t.aiChipSize,
    color: t.aiChipColour,
  },
  aiTitle: { marginTop: t.aiTitleGap, fontFamily: font.appHeading, fontSize: t.aiTitleSize, color: colors.textPrimary },
  aiSub: {
    marginTop: t.aiSubGap,
    fontFamily: font.appBody,
    fontSize: t.aiSubSize,
    lineHeight: t.aiSubLineHeight,
    color: colors.textBody,
  },
  aiInput: {
    marginTop: t.aiInputGap,
    minHeight: t.aiInputHeight,
    borderRadius: t.aiInputRadius,
    paddingLeft: t.aiInputPadLeft,
    paddingRight: t.aiInputPadRight,
    backgroundColor: t.aiInputBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiInputText: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.aiInputSize,
    color: colors.textBody,
  },
  aiSend: {
    width: t.aiSend,
    height: t.aiSend,
    borderRadius: t.aiSendRadius,
    backgroundColor: t.aiSendBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSuggRow: { marginTop: t.aiSuggGap, flexGrow: 0, height: t.aiSuggHeight, overflow: 'hidden' },
  aiSuggContent: { gap: t.aiSuggGapX },
  aiSugg: {
    height: t.aiSuggHeight,
    borderRadius: t.aiSuggRadius,
    paddingHorizontal: t.aiSuggPadX,
    backgroundColor: t.aiSuggBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSuggText: { fontFamily: font.appSemi, fontSize: t.aiSuggSize, color: colors.textPrimary },

  rev: {
    marginTop: t.revGap,
    borderRadius: t.revRadius,
    backgroundColor: t.revBg,
    padding: t.revPad,
  },
  revHead: { flexDirection: 'row', alignItems: 'center' },
  revIcon: {
    width: t.revIcon,
    height: t.revIcon,
    borderRadius: t.revIcon / 2,
    backgroundColor: t.revIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revTitle: {
    marginLeft: t.revIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.revTitleSize,
    lineHeight: t.revTitleLineHeight,
    color: colors.textPrimary,
  },
  revPreview: { fontFamily: font.appBody, fontSize: t.revPreviewSize, color: colors.textBody },
  revBlock: { marginTop: t.revBlockGap, borderRadius: t.revBlockRadius, padding: t.revBlockPad },
  revOrig: { backgroundColor: t.revOrigBg },
  revAi: { backgroundColor: t.revAiBg },
  revTag: {
    alignSelf: 'flex-start',
    minHeight: t.revTagHeight,
    borderRadius: t.revTagRadius,
    paddingHorizontal: t.revTagPadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revTagOrig: { backgroundColor: t.revTagOrigBg },
  revTagAi: { backgroundColor: t.revTagAiBg },
  revTagText: { fontFamily: font.appBody, fontSize: t.revTagSize, color: colors.textPrimary },
  revTagAiText: { color: t.revTagAiColour },
  revText: {
    marginTop: t.revTextGap,
    fontFamily: font.appBody,
    fontSize: t.revTextSize,
    lineHeight: t.revTextLineHeight,
    color: colors.textPrimary,
  },
  revBtns: { marginTop: t.revBtnGap, flexDirection: 'row', gap: t.revBtnGapX },
  revBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: t.revBtnHeight,
    borderRadius: t.revBtnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  revApply: { backgroundColor: t.revApplyBg },
  revApplyText: {
    marginLeft: t.revBtnIconGap,
    fontFamily: font.appHeading,
    fontSize: t.revBtnSize,
    color: ink.onBrand,
  },
  revKeep: { backgroundColor: t.revKeepBg },
  revKeepText: { fontFamily: font.appHeading, fontSize: t.revBtnSize, color: colors.textPrimary },

  aiDisc: { marginTop: t.aiDiscGap, flexDirection: 'row' },
  aiDiscText: {
    marginLeft: t.aiDiscIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.aiDiscSize,
    lineHeight: t.aiDiscLineHeight,
    color: colors.textPrimary,
  },

  comp1: {
    marginTop: t.compGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.compSize,
    lineHeight: t.compLineHeight,
    color: colors.brandDark,
  },
  comp2: {
    marginTop: t.compGap2,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.compSize,
    lineHeight: t.compLineHeight,
    color: colors.textPrimary,
  },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  btnRow: { flexDirection: 'row', gap: t.btnGapX },
  btn: {
    flex: 1,
    minWidth: 0,
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  save: { backgroundColor: t.saveBg },
  saveText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: colors.textPrimary },
  continue: { backgroundColor: t.continueBg },
  continueText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand },
  pressed: { opacity: 0.85 },
});

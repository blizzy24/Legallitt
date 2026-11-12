import { useState } from 'react';
import { Pencil } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { ADV_NOTICE_DRAFT } from '../data/advocateSide';
import { advNoticeDraft as t, colors, font } from '../constants/theme';
import { instructedCopy } from '../copy/instructed';
import { NOTICE_EDITABLE_DRAFT_FIELDS, NOTICE_FILING_DRAFT_FIELDS } from '@legalitt/shared';

const sectionKeys = ['sender', 'recipient', 'subject', 'facts', 'demand', 'closing'] as const;
const filingSections = sectionKeys.map((key, index) => NOTICE_FILING_DRAFT_FIELDS.some(field => field === key) ? index : -1);
const editableSections = sectionKeys.map((key, index) => NOTICE_EDITABLE_DRAFT_FIELDS.some(field => field === key) ? index : -1);

/**
 * The six numbered section cards of the drafted legal notice.
 *
 * Shared by design/188 (app/advocate/notice/[id]/draft.tsx) and design/266
 * (app/advocate/notice/draft-editor.tsx). A pixel diff of the two exports found
 * the whole body identical — same six sections, same copy, same card geometry —
 * and only the AI pill and the footer different. Extracted rather than copied.
 *
 * All six editable sections are persisted and reach the PDF. Closing also has
 * the structured compliance-period input. No Offences section is rendered.
 */
export default function NoticeDraftSections({ sections = ADV_NOTICE_DRAFT.sections, onEdit, onChange, offences, onChangeOffences, intakeSections = [], complianceDays, onChangeComplianceDays }: {
  complianceDays?: string; onChangeComplianceDays?: (value: string) => void;
  sections?: typeof ADV_NOTICE_DRAFT.sections;
  onEdit?: (index: number) => void;
  onChange?: (index: number, value: string) => void;
  offences?: string;
  onChangeOffences?: (value: string) => void;
  intakeSections?: readonly number[];
}) {
  const [editing, setEditing] = useState<number | null>(null);
  return (
    <>
      {sections.map((s, index) => (
        <View key={s.n} style={styles.card}>
          <View style={styles.secHead}>
            <Text style={styles.secTitle} {...shrinkToFit(0.75)}>
              {s.n}. {s.title}
            </Text>
            {editableSections.includes(index) && <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${s.title}`} hitSlop={8} onPress={() => {setEditing(index);onEdit?.(index);}}>
              <Pencil size={t.pencil} color={colors.textPrimary} />
            </Pressable>}
          </View>
          {filingSections.includes(index) ? <Text style={styles.intakeNote}>{instructedCopy.legalNoticeDraft.fromFiling}</Text>
            : intakeSections.includes(index) && <Text style={styles.intakeNote}>{instructedCopy.legalNoticeDraft.fromIntake}</Text>}
          {sectionKeys[index] === 'closing' && complianceDays !== undefined && <>
            <Text style={styles.intakeNote}>{instructedCopy.legalNoticeDraft.complianceDays}</Text>
            <View style={styles.body}>
              <TextInput accessibilityLabel={instructedCopy.legalNoticeDraft.complianceDays}
                inputMode="numeric" value={complianceDays} onChangeText={onChangeComplianceDays}
                style={[styles.bodyText,{padding:0}]} />
            </View>
          </>}
          <View style={styles.body}>
            <>{onChange && editing === index && editableSections.includes(index) ? <TextInput accessibilityLabel={s.title} multiline autoFocus value={s.body} onChangeText={value=>onChange(index,value)} style={[styles.bodyText,{padding:0}]} /> : <Text style={styles.bodyText}>{s.body}</Text>}</>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  secHead: { flexDirection: 'row', alignItems: 'center' },
  intakeNote: { marginTop: t.bodyGap, fontFamily: font.appBody, fontSize: t.stepSize, color: colors.textBody },
  secTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.secTitleSize,
    color: colors.brandDark,
  },
  body: {
    marginTop: t.bodyGap,
    borderRadius: t.bodyRadius,
    borderWidth: 1,
    borderColor: t.bodyBorder,
    backgroundColor: t.bodyBg,
    padding: t.bodyPad,
  },
  bodyText: {
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textPrimary,
  },
});

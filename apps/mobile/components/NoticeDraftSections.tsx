import { useState } from 'react';
import { Pencil } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { ADV_NOTICE_DRAFT } from '../data/advocateSide';
import { advNoticeDraft as t, colors, font } from '../constants/theme';
import { instructedCopy } from '../copy/instructed';

/**
 * The six numbered section cards of the drafted legal notice.
 *
 * Shared by design/188 (app/advocate/notice/[id]/draft.tsx) and design/266
 * (app/advocate/notice/draft-editor.tsx). A pixel diff of the two exports found
 * the whole body identical — same six sections, same copy, same card geometry —
 * and only the AI pill and the footer different. Extracted rather than copied.
 *
 * Editor values and callbacks come from the controller. The owner-instructed
 * Offences field is separate from the six designed working sections.
 */
export default function NoticeDraftSections({ sections = ADV_NOTICE_DRAFT.sections, onEdit, onChange, offences, onChangeOffences }: {
  sections?: typeof ADV_NOTICE_DRAFT.sections;
  onEdit?: (index: number) => void;
  onChange?: (index: number, value: string) => void;
  offences?: string;
  onChangeOffences?: (value: string) => void;
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
            <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${s.title}`} hitSlop={8} onPress={() => {setEditing(index);onEdit?.(index);}}>
              <Pencil size={t.pencil} color={colors.textPrimary} />
            </Pressable>
          </View>
          <View style={styles.body}>
            <>{onChange && editing === index ? <TextInput accessibilityLabel={s.title} multiline autoFocus value={s.body} onChangeText={value=>onChange(index,value)} style={[styles.bodyText,{padding:0}]} /> : <Text style={styles.bodyText}>{s.body}</Text>}</>
          </View>
        </View>
      ))}
      {offences !== undefined && <View style={styles.card}>
        <Text style={styles.secTitle}>{instructedCopy.legalNoticeDraft.offences}</Text>
        <View style={styles.body}>
          <TextInput accessibilityLabel={instructedCopy.legalNoticeDraft.offences}
            multiline value={offences} onChangeText={onChangeOffences}
            style={[styles.bodyText, {padding: 0}]} />
        </View>
      </View>}
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

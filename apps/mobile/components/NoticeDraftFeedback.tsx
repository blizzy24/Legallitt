import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NOTICE_PDF_FIELD_LABELS, type NoticePdfField } from '@legalitt/shared';
import { advNoticeDraft as t, colors, font } from '../constants/theme';
import { instructedCopy } from '../copy/instructed';

export type NoticeDraftFeedbackProps = {
  error?: string;
  missingFields?: readonly NoticePdfField[];
  onContactClient?: () => void;
};
/** Action feedback belongs beside Generate/Preview/Send, never above the header.
 * No fake edit links: paid intake and profile corrections have no working UI yet. */
export default function NoticeDraftFeedback({error, missingFields = [], onContactClient}: NoticeDraftFeedbackProps) {
  if (!error) return null;
  const copy = instructedCopy.legalNoticeDraft;
  const filing = missingFields.some(field => !['place','service_fee'].includes(field));
  return <View style={styles.box} testID="notice-draft-feedback">
    <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>
      {missingFields.length ? `${copy.missingTitle}\n${missingFields.map(field => `• ${NOTICE_PDF_FIELD_LABELS[field]}`).join('\n')}` : error}
    </Text>
    {filing && <Text style={styles.text}>{copy.filingCorrection}</Text>}
    {missingFields.includes('place') && <Text style={styles.text}>{copy.placeCorrection}</Text>}
    {missingFields.includes('service_fee') && <Text style={styles.text}>{copy.feeCorrection}</Text>}
    {filing && onContactClient && <Pressable accessibilityRole="button" onPress={onContactClient}>
      <Text style={[styles.text,styles.link]}>{copy.contactClient}</Text>
    </Pressable>}
  </View>;
}
const styles = StyleSheet.create({
  box: {padding:t.bodyPad, marginBottom:t.cardGap, gap:t.bodyGap, borderRadius:t.bodyRadius,
    borderWidth:1,borderColor:t.bodyBorder,backgroundColor:t.bodyBg},
  text: {fontFamily:font.appBody,fontSize:t.bodySize,lineHeight:t.bodyLineHeight,color:colors.textPrimary},
  link: {color:colors.brandDark,textDecorationLine:'underline'},
});

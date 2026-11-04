import {instructedCopy} from '../copy/instructed';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, tracking as t } from '../constants/theme';

/** Nonmodal screen feedback. Keep the screen mounted so failed saves preserve
 * fields, chat drafts and the existing navigation controls. No data-source logic. */
export type NoticeScreenState = {loading:boolean;ready:boolean;hasId:boolean;emptyMessage?:string;onRetry:()=>void;onCases:()=>void};
export default function NoticeScreenFeedback({ error, children, state }: { error?: string; children: ReactNode; state?:NoticeScreenState }) {
  if(state && !state.ready) return <View style={styles.screen}>
    <View style={styles.empty}>
      <Pressable accessibilityRole="button" onPress={state.onCases}><Text style={styles.link}>‹ {instructedCopy.advocateWork.myCases}</Text></Pressable>
      <Text accessibilityRole={error?'alert':undefined} accessibilityLiveRegion="polite" style={styles.error}>{state.loading?instructedCopy.advocateWork.loadingCase:state.emptyMessage??(state.hasId?instructedCopy.advocateWork.unavailableCase:instructedCopy.advocateWork.selectCase)}</Text>
      {!state.loading && state.hasId && <Pressable accessibilityRole="button" onPress={state.onRetry}><Text style={styles.link}>{instructedCopy.advocateWork.retry}</Text></Pressable>}
    </View>
  </View>;
  return <View style={styles.screen}>
    {Boolean(error) && !state && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    {children}
    {Boolean(error) && state && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  empty: {flex:1,justifyContent:'center',padding:t.padX,backgroundColor:colors.screenBg},
  link: {padding:t.descGap,fontFamily:font.appSemi,fontSize:t.descSize,color:colors.brandDark},
  error: { paddingHorizontal: t.padX, paddingVertical: t.descGap, backgroundColor: colors.screenBg,
    fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: colors.textMuted },
});

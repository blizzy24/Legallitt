import { instructedCopy } from '../copy/instructed';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, profile as t, tabs, services } from '../constants/theme';
import { useSession } from '../context/session';
import { DATA_SOURCE } from '../lib/data-source';
import { unavailableSection } from '../lib/unavailable-sections';
import TabBar from './TabBar';
import {consultationRoute} from '../features/consultation/router';
import {reportRoute} from '../features/reports/router';
import {courtRoute} from '../features/court/router';

/** Navigator boundary: blocked fixture screens never mount, including deep links.
 * Uses the existing header, profile card and button tokens. No pretend zero data. */
export default function AccountDataBoundary({ name, params, children }: { name: string; params?: Readonly<object>; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { role } = useSession();
  const court=DATA_SOURCE==='api'?courtRoute(name,params as Readonly<Record<string,unknown>>|undefined):null;
  if(court)return court;
  const consultation=DATA_SOURCE==='api'?consultationRoute(name,params as Readonly<Record<string,unknown>>|undefined):null;
  if(consultation)return consultation;
  const report=DATA_SOURCE==='api'?reportRoute(name,params as Readonly<Record<string,unknown>>|undefined):null;
  if(report)return report;
  const section = DATA_SOURCE === 'api' ? unavailableSection(name, params as Readonly<Record<string, unknown>> | undefined) : undefined;
  if (!section) return <>{children}</>;
  const advocate = role === 'lawyer';
  const home = () => router.navigate(advocate ? '/dashboard' : '/home');
  const cases = () => router.navigate(advocate ? '/matters' : '/cases');
  const directory = name === 'advocates/index';
  return <View style={styles.screen} testID="account-data-unavailable">
    <ScrollView contentContainerStyle={[styles.content,{paddingTop:insets.top+t.top,paddingBottom:insets.bottom+tabs.bottom+tabs.iconOnly.height+t.sectionGap}]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={home} style={styles.back}><ChevronLeft color={colors.textPrimary} size={services.backIcon}/></Pressable>
        <Text style={styles.title}>{section.title}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>{instructedCopy.navigationAvailability.heading}</Text>
        <Text style={styles.body}>{section.body}</Text>
        <Pressable accessibilityRole="button" onPress={cases} style={styles.button}><Text style={styles.buttonText}>My Cases</Text></Pressable>
      </View>
    </ScrollView>
    {directory && <TabBar/>}
  </View>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.appBg},content:{paddingHorizontal:t.padX},header:{flexDirection:'row',alignItems:'center',gap:t.avatarGap},
  title:{flex:1,fontFamily:font.appHeading,fontSize:t.titleSize,color:colors.textPrimary},
  back:{width:services.headerButton,height:services.headerButton,borderRadius:services.headerButton/2,backgroundColor:colors.card,alignItems:'center',justifyContent:'center'},
  card:{marginTop:t.cardGap,padding:t.cardPad,borderRadius:t.cardRadius,backgroundColor:colors.card},
  heading:{fontFamily:font.appHeading,fontSize:t.rowTitleSize,color:colors.textPrimary},
  body:{marginTop:t.cardGap,fontFamily:font.appBody,fontSize:t.rowSubSize,color:colors.textBody},
  button:{marginTop:t.editGap,minHeight:t.editHeight,borderRadius:t.editRadius,backgroundColor:t.editBg,alignItems:'center',justifyContent:'center'},
  buttonText:{fontFamily:font.appSemi,fontSize:t.editSize,color:colors.textPrimary},
});

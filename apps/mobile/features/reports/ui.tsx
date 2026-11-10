import type {ReactNode} from 'react';
import {Pressable,ScrollView,Text,TextInput,View,StyleSheet} from 'react-native';
import {router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft,Mail,Phone,ShieldCheck,UserRound,type LucideIcon} from 'lucide-react-native';
import type {ReportServiceCode} from '@legalitt/shared';
import {colors,font,ink} from '../../constants/theme';
import {s} from '../consultation/ui';
export {Button,Card,Choice,ErrorBox,Field,Value,s} from '../consultation/ui';

/** The distinct headers and form groups in designs 74 and 84, using live data. */
export function Screen({title,subtitle,children,back,service,step}:{title:string;subtitle?:string;children:ReactNode;back?:()=>void;service?:ReportServiceCode;step?:string}){
 const inset=useSafeAreaInsets(),ps=service==='property_search',df=service==='document_forensic';
 const intake=['request','upload','review','payment'].includes(step??'');
 return <View style={[s.screen,ps&&{backgroundColor:'#fff'}]}>
  <View style={[s.header,{paddingTop:inset.top+16}]}>
   <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back??(()=>router.canGoBack()?router.back():router.navigate('/home'))}><ArrowLeft color={colors.textPrimary}/></Pressable>
   <View style={{flex:1}}>{df&&<Text style={styles.eyebrow}>FORENSIC WORKFLOW</Text>}<Text style={[s.title,ps&&intake&&styles.propertyHeader]}>{ps&&intake?'PROPERTY SEARCH REPORT':df&&step==='upload'?'Upload Document':title}</Text>{subtitle&&<Text style={s.muted}>{subtitle}</Text>}</View>
   {df&&<View style={styles.avatar}><UserRound color="white" size={22}/></View>}
  </View>
  {df&&intake&&<View style={styles.strip}><ShieldCheck size={17} color={ink.accent}/><Text style={[styles.eyebrow,{flex:1}]}>FORENSIC AUTHENTICATION</Text><Text style={styles.pill}>{step==='payment'?'Payment':step==='review'?'Review':'Step 2 of 3'}</Text></View>}
  <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content,{paddingBottom:inset.bottom+30}]}>{children}</ScrollView>
 </View>;
}
export function ContactField({label,value,onChange,onBlur}:{label:'Full Name'|'Mobile Number'|'Email Address';value:string;onChange:(v:string)=>void;onBlur:()=>void}){
 const Icon:LucideIcon=label==='Full Name'?UserRound:label==='Mobile Number'?Phone:Mail;
 return <View style={styles.contact}><Icon size={23} color={ink.accent}/><View style={{flex:1,gap:3}}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} onBlur={onBlur} keyboardType={label==='Mobile Number'?'phone-pad':label==='Email Address'?'email-address':'default'} autoCapitalize={label==='Full Name'?'words':'none'} placeholder={`Enter Your ${label}`} style={styles.contactInput}/></View></View>;
}
export function TwoColumns({children}:{children:ReactNode}){return <View style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>{children}</View>;}
export const Column=({children}:{children:ReactNode})=><View style={{flex:1,minWidth:0,gap:7}}>{children}</View>;
const styles=StyleSheet.create({propertyHeader:{fontFamily:font.appSemi,fontSize:17},eyebrow:{fontFamily:font.appSemi,fontSize:12,letterSpacing:1,color:ink.accent},avatar:{width:38,height:38,borderRadius:19,backgroundColor:colors.brandDark,alignItems:'center',justifyContent:'center'},strip:{paddingHorizontal:20,paddingVertical:12,flexDirection:'row',alignItems:'center',gap:8},pill:{paddingHorizontal:12,paddingVertical:5,borderRadius:16,backgroundColor:'#F5DCBB',fontFamily:font.appSemi,fontSize:12,color:colors.brandDark},contact:{borderWidth:1,borderColor:'#E2E0DE',borderRadius:13,padding:15,flexDirection:'row',alignItems:'center',gap:16,marginHorizontal:10},contactInput:{fontFamily:font.appBody,fontSize:15,color:colors.textPrimary,padding:0,minHeight:28}});

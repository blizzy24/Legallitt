import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NoticeHeader, NoticeButton } from '../../components/NoticeDeliveryScreen';
import { noticeDelivery as t } from '../../constants/tokens/noticeDelivery';
import { font } from '../../constants/theme';
import { INVOICE, TRACKING, tierFor } from '../../data/legalNotice';
import { formatDate } from '../../data/cases';
import { useLegalNotice } from '../../context/legalNotice';
// design/438 — request changes, not a second approval step.
export default function RequestChanges() {
 const [message,setMessage]=useState(''); const {form}=useLegalNotice(); const tier=tierFor(form.tier);
 return <View style={s.screen}><NoticeHeader title="Legal Notice Tracking"/><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
 <Text style={s.id}>REQUEST ID   #{INVOICE.requestId}</Text>
 <View style={s.summary}><Text style={s.label}>● Awaiting Your Approval                 {tier.tierLabel}</Text><Text style={s.title}>Your Legal Notice Draft is Ready</Text><Text style={s.body}>Your advocate has prepared the legal notice. Please review the draft carefully before approving it for dispatch.</Text></View>
 <View style={s.row}><Text style={s.label}>NOTICE DETAILS</Text><Text style={s.label}>Ref: {TRACKING.ref}</Text></View>
 <View style={s.card}>{[['Notice Type','Legal Notice'],['Service',`${tier.label}  ${tier.trackingSpeed}`],['Submitted On',formatDate(TRACKING.submittedOn)],['Current Status','● Awaiting Your Approval']].map(([a,b])=><View key={a} style={s.detail}><Text style={s.body}>{a}</Text><Text style={s.value}>{b}</Text></View>)}</View>
 <Text style={s.title}>Your Decision</Text><TextInput value={message} onChangeText={setMessage} multiline accessibilityLabel="Describe what you would like to change" placeholder="Describe what you would like to change" style={s.input}/>
 <NoticeButton onPress={() => { if(message.trim()) router.push({pathname:'/chat/advocate',params:{message:message.trim()}}); }}>Request Changes</NoticeButton>
 </ScrollView></View>;
}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:t.bg},content:{padding:t.pad,gap:t.decisionGap},id:{alignSelf:'flex-start',fontFamily:font.appSemi,fontSize:12,padding:10,borderRadius:24,borderWidth:1,borderColor:'#E5E2E1',backgroundColor:t.card},summary:{padding:t.summaryPad,gap:t.summaryGap,borderRadius:t.radius,borderWidth:1,borderColor:'#E5E2E1',backgroundColor:'#F8F5F1'},title:{fontFamily:font.appHeading,fontSize:t.decisionTitle,color:t.ink},body:{fontFamily:font.appBody,fontSize:t.body,lineHeight:t.line,color:t.muted},label:{fontFamily:font.appSemi,fontSize:t.label,color:t.brand},row:{flexDirection:'row',justifyContent:'space-between'},card:{padding:12,borderRadius:t.radius,backgroundColor:t.card,gap:8},detail:{minHeight:t.detailRowH,padding:10,backgroundColor:t.bg,borderRadius:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},value:{fontFamily:font.appSemi,fontSize:12,color:t.ink,flexShrink:1},input:{height:t.decisionAreaH,borderWidth:1,borderColor:t.action,borderRadius:20,padding:12,fontFamily:font.appBody,fontSize:t.body,textAlignVertical:'top',color:t.ink}});

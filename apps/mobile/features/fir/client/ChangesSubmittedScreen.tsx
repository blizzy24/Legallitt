// C13 Change Request Submitted (design/client/fir-draft/F8-change-request-submitted.png).
// Everything shown is the client's latest saved change request from the flow (its
// sections and time) and the draft it was made on. Back arrow and Back to FIR
// Request go to C10 — never back into the form. Left out per flow C13 [REMOVE]:
// "logged securely", "Securely recorded on ledger", "Logged & Dispatched" and
// "securely transmitted" (the plain sentence replaces the last).
import {router,useLocalSearchParams,type Href} from 'expo-router';
import {ArrowRight,CalendarClock,Check,Clock,ExternalLink,FileQuestion,FileText,MessageSquareText,Route,Send,User,Users,type LucideIcon} from 'lucide-react-native';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {firSectionLabel,type FirFlowReview,type FirFlowView} from '@legalitt/shared';
import FirResultHeader from '../../../components/FirResultHeader';
import RequestIdCard from '../../../components/RequestIdCard';
import {colors,font,ink} from '../../../constants/theme';
import {firHref,firPdfName,useFirFlow} from '../flow';
import {backTo,dayTime,goHome,hashRef} from './format';
import {InlineError,LoadingState,StatePanel} from './ui';
import {firChangesDone as t,firInk} from './tokens';

const SECTION_ICONS:Record<string,LucideIcon>={complainant:User,incident:Clock,date_time_place:CalendarClock,people:Users,missing_data:FileQuestion,other:MessageSquareText};

function latestChangeRequest(flow:FirFlowView):FirFlowReview|null{
  return [...flow.reviews].reverse().find(r=>r.role==='client'&&r.decision==='changes_requested')??null;
}
/** The advocate has released a newer draft since this request (or the case moved past review). */
function revised(flow:FirFlowView,review:FirFlowReview){
  if(flow.stage.client.stage===5)return true;
  return flow.stage.client.decision_due&&!!flow.draft&&review.version!=null&&flow.draft.version>review.version;
}

export default function FirChangesSubmittedScreen(){
  const {caseId}=useLocalSearchParams<{caseId?:string}>();
  const insets=useSafeAreaInsets();
  const f=useFirFlow(caseId),flow=f.flow;
  const toStatus=()=>caseId?backTo(firHref('status',caseId)):goHome();
  const header=<FirResultHeader title="Change Request Submitted" avatar="dark" onBack={toStatus}/>;
  const support=()=>router.push((`/support?caseId=${encodeURIComponent(caseId??'')}`) as Href);

  if(f.loading&&!flow)return <View style={styles.screen}>{header}<LoadingState label="Loading your change request…"/></View>;
  if(!flow)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    <StatePanel tone="error" title="We couldn’t load your change request" body={f.error||'Something went wrong loading your request.'}
      actions={[...(caseId?[{label:'Try again',onPress:f.reload,primary:true}]:[]),{label:'Go to Home',onPress:goHome}]}/>
  </ScrollView></View>;
  const review=latestChangeRequest(flow);
  if(!review)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    <StatePanel title="No change request yet" body={`You haven’t requested changes on ${hashRef(flow.reference)}. You can do that when a draft is sent to you for review.`}
      actions={[{label:'Back to FIR Request',onPress:toStatus,primary:true}]}/>
  </ScrollView></View>;

  const done=revised(flow,review);
  const version=review.version??flow.draft?.version??null;
  const steps:{title:string;desc:string;state:'done'|'active'|'pending'}[]=[
    {title:'Change Request Submitted',desc:dayTime(review.created_at),state:'done'},
    {title:'Legal Team Review',desc:'The relevant team will review the requested corrections and verify statutory particulars.',state:done?'done':'active'},
    {title:'Updated Draft Released',desc:'The revised FIR draft will be made available directly in your app for your review when ready.',state:done?'done':'pending'},
  ];

  return <View style={styles.screen}>
    {header}
    <ScrollView contentContainerStyle={[styles.content,{paddingBottom:insets.bottom+28}]} showsVerticalScrollIndicator={false}>
      {!!f.error&&<InlineError style={styles.refreshError} message={`Couldn’t refresh this request. ${f.error}`} onRetry={f.reload}/>}
      <View style={styles.heroOuter}><View style={styles.heroInner}><View style={styles.heroDisc}><Check size={t.heroGlyph} color={ink.onBrand} strokeWidth={3}/></View></View></View>
      <View style={styles.pill}><View style={styles.pillDot}/><Text style={styles.pillText}>{done?'UPDATED DRAFT RELEASED':'CHANGES UNDER REVIEW'}</Text></View>
      <Text style={styles.title}>Change Request Submitted Successfully</Text>
      <Text style={styles.body}>Your requested revisions have been sent. You will be notified the moment your updated draft is ready for review.</Text>

      <View style={styles.card}>
        <View style={styles.typeRow}>
          <Text style={styles.cardLabel}>Request Type</Text>
          <View style={styles.type}><View style={styles.typeDot}/><Text style={styles.typeText}>FIR Draft Revision</Text></View>
        </View>
        <RequestIdCard requestId={flow.reference} label="Draft Reference ID" variant="icon" style={styles.idBox}/>
        {version!=null&&<View style={styles.fileRow}>
          <View style={styles.fileTile}><FileText size={t.fileIcon} color={firInk.danger}/></View>
          <View style={styles.fileText}>
            <Text style={styles.fileName} numberOfLines={1}>{firPdfName(flow.reference,version)}</Text>
            <Text style={styles.fileStatus}>Status: {done?'Updated draft released':'Awaiting Revision'}</Text>
          </View>
        </View>}
        {review.sections.length>0&&<>
          <Text style={styles.sectionsLabel}>Selected Sections for Review:</Text>
          <View style={styles.chips}>{review.sections.map(code=>{const Icon=SECTION_ICONS[code]??FileText;return <View key={code} style={styles.chip}><Icon size={t.chipIcon} color={colors.textBody}/><Text style={styles.chipText}>{firSectionLabel(code)}</Text></View>;})}</View>
        </>}
        <View style={styles.stamp}><Clock size={t.stampIcon} color={firInk.green}/><Text style={styles.stampText}>Submitted: {dayTime(review.created_at)}</Text></View>
      </View>

      <View style={styles.card}>
        <View style={styles.nextHead}><View style={styles.nextIcon}><Route size={t.nextIcon} color={firInk.peachText}/></View><Text style={styles.nextTitle}>What Happens Next?</Text></View>
        {steps.map((s,i)=><View key={s.title} style={styles.step}>
          <View style={styles.rail}>
            <View style={[styles.marker,s.state==='done'?styles.markerDone:s.state==='active'?styles.markerActive:styles.markerPending]}>
              {s.state==='done'?<Check size={12} color={ink.onBrand} strokeWidth={3}/>:<Text style={[styles.markerText,s.state==='active'&&styles.markerTextActive]}>{i+1}</Text>}
            </View>
            {i<steps.length-1&&<View style={styles.line}/>}
          </View>
          <View style={[styles.stepBody,i<steps.length-1&&styles.stepGap]}>
            <Text style={styles.stepTitle}>{s.title}</Text>
            {!!s.desc&&<Text style={[styles.stepDesc,i===0&&styles.stepDescDone]}>{s.desc}</Text>}
          </View>
        </View>)}
        <View style={styles.note}>
          <Send size={15} color={colors.textBody} style={styles.noteIcon}/>
          <Text style={styles.noteText}>{review.attachment?'Your notes and attachments have been sent to your assigned advocate.':'Your notes have been sent to your assigned advocate.'}</Text>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={toStatus} style={({pressed})=>[styles.primary,pressed&&styles.pressed]}>
        <Text style={styles.primaryText}>Back to FIR Request</Text><ArrowRight size={18} color={ink.onBrand}/>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={goHome} style={({pressed})=>[styles.secondary,pressed&&styles.pressed]}>
        <Text style={styles.secondaryText}>Go to Home</Text>
      </Pressable>
      <View style={styles.linkRow}>
        <Text style={styles.linkLead}>Need to add more details? </Text>
        <Pressable accessibilityRole="link" onPress={support} style={styles.link}><Text style={styles.linkText}>Contact Support</Text><ExternalLink size={13} color={firInk.peachText}/></Pressable>
      </View>
    </ScrollView>
  </View>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:firInk.bg},
  content:{paddingHorizontal:t.padX},
  pressed:{opacity:0.85},
  refreshError:{marginTop:12},
  heroOuter:{marginTop:t.heroTop,alignSelf:'center',width:t.heroOuter,height:t.heroOuter,borderRadius:t.heroOuter/2,backgroundColor:'#F4F1EE',alignItems:'center',justifyContent:'center'},
  heroInner:{width:t.heroInner,height:t.heroInner,borderRadius:t.heroInner/2,backgroundColor:firInk.greenSoft,alignItems:'center',justifyContent:'center'},
  heroDisc:{width:t.heroDisc,height:t.heroDisc,borderRadius:t.heroDisc/2,backgroundColor:firInk.green,alignItems:'center',justifyContent:'center'},
  pill:{marginTop:t.pillTop,alignSelf:'center',minHeight:t.pillH,borderRadius:t.pillRadius,paddingHorizontal:t.pillPadX,backgroundColor:'#F7EBDD',flexDirection:'row',alignItems:'center',gap:7},
  pillDot:{width:7,height:7,borderRadius:3.5,backgroundColor:firInk.deep},
  pillText:{fontFamily:font.appSemi,fontSize:t.pillSize,letterSpacing:t.pillSpacing,color:firInk.deep},
  title:{marginTop:t.titleTop,textAlign:'center',fontFamily:font.appHeading,fontSize:t.titleSize,lineHeight:t.titleLine,color:colors.textPrimary},
  body:{marginTop:t.bodyTop,textAlign:'center',fontFamily:font.appBody,fontSize:t.bodySize,lineHeight:t.bodyLine,color:colors.textBody},
  card:{marginTop:t.cardTop,borderRadius:t.cardRadius,backgroundColor:colors.card,padding:t.cardPad},
  typeRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  cardLabel:{fontFamily:font.appBody,fontSize:t.labelSize,color:colors.textBody},
  type:{height:t.typeH,borderRadius:t.typeRadius,paddingHorizontal:t.typePadX,backgroundColor:'#F9EBDD',flexDirection:'row',alignItems:'center',gap:6},
  typeDot:{width:6,height:6,borderRadius:3,backgroundColor:firInk.deep},
  typeText:{fontFamily:font.appSemi,fontSize:t.typeSize,color:firInk.deep},
  idBox:{marginTop:t.idTop,backgroundColor:firInk.soft,borderRadius:t.idRadius,padding:t.idPad},
  fileRow:{marginTop:t.fileTop,flexDirection:'row',alignItems:'center'},
  fileTile:{width:t.fileTile,height:t.fileTile,borderRadius:8,backgroundColor:firInk.dangerSoft,alignItems:'center',justifyContent:'center'},
  fileText:{flex:1,minWidth:0,marginLeft:t.fileGap},
  fileName:{fontFamily:font.appSemi,fontSize:t.fileNameSize,color:colors.textPrimary},
  fileStatus:{marginTop:2,fontFamily:font.appBody,fontSize:t.fileStatusSize,color:colors.textBody},
  sectionsLabel:{marginTop:t.sectionsTop,fontFamily:font.appSemi,fontSize:t.sectionsLabelSize,color:firInk.deepText},
  chips:{marginTop:t.chipTop,flexDirection:'row',flexWrap:'wrap',gap:t.chipGap},
  chip:{minHeight:t.chipH,borderRadius:t.chipRadius,paddingHorizontal:t.chipPadX,backgroundColor:firInk.chip,flexDirection:'row',alignItems:'center',gap:5},
  chipText:{fontFamily:font.appBody,fontSize:t.chipSize,color:firInk.deepText},
  stamp:{marginTop:t.stampTop,flexDirection:'row',alignItems:'center',gap:6},
  stampText:{flex:1,minWidth:0,fontFamily:font.appBody,fontSize:t.stampSize,color:colors.textBody},
  nextHead:{flexDirection:'row',alignItems:'center',gap:10},
  nextIcon:{width:t.nextIconBox,height:t.nextIconBox,borderRadius:t.nextIconBox/2,backgroundColor:firInk.peach,alignItems:'center',justifyContent:'center'},
  nextTitle:{fontFamily:font.appHeading,fontSize:t.nextTitleSize,color:colors.textPrimary},
  step:{marginTop:t.stepTop,flexDirection:'row'},
  rail:{alignItems:'center'},
  marker:{width:t.stepMarker,height:t.stepMarker,borderRadius:t.stepMarker/2,alignItems:'center',justifyContent:'center'},
  markerDone:{backgroundColor:firInk.green},
  markerActive:{backgroundColor:firInk.deep},
  markerPending:{backgroundColor:firInk.chip},
  markerText:{fontFamily:font.appSemi,fontSize:t.stepMarkerSize,color:firInk.deepText},
  markerTextActive:{color:ink.onBrand},
  line:{flex:1,width:2,marginTop:2,marginBottom:-t.stepTop+2,backgroundColor:firInk.chip},
  stepBody:{flex:1,minWidth:0,marginLeft:t.stepGap},
  stepGap:{paddingBottom:2},
  stepTitle:{fontFamily:font.appSemi,fontSize:t.stepTitleSize,color:colors.textPrimary},
  stepDesc:{marginTop:2,fontFamily:font.appBody,fontSize:t.stepDescSize,lineHeight:t.stepDescLine,color:colors.textBody},
  stepDescDone:{color:firInk.green},
  note:{marginTop:t.noteTop,borderRadius:t.noteRadius,backgroundColor:firInk.soft,padding:t.notePad,flexDirection:'row',alignItems:'flex-start'},
  noteIcon:{marginTop:2},
  noteText:{flex:1,minWidth:0,marginLeft:10,fontFamily:font.appBody,fontSize:t.noteSize,lineHeight:t.noteLine,color:colors.textBody},
  primary:{marginTop:t.buttonsTop,height:t.buttonH,borderRadius:t.buttonRadius,backgroundColor:firInk.deep,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10},
  primaryText:{fontFamily:font.appHeading,fontSize:t.buttonSize,color:ink.onBrand},
  secondary:{marginTop:10,height:t.secondaryH,borderRadius:t.buttonRadius,backgroundColor:'#F1EEEA',alignItems:'center',justifyContent:'center'},
  secondaryText:{fontFamily:font.appSemi,fontSize:t.buttonSize-1,color:firInk.deepText},
  linkRow:{marginTop:t.linkTop,flexDirection:'row',alignItems:'center',justifyContent:'center',flexWrap:'wrap'},
  linkLead:{fontFamily:font.appBody,fontSize:t.linkSize,color:colors.textBody},
  link:{flexDirection:'row',alignItems:'center',gap:4},
  linkText:{fontFamily:font.appSemi,fontSize:t.linkSize,color:firInk.peachText},
});

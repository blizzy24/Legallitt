// C14 FIR Draft Approved (design/client/fir-draft/F9-draft-approved.png).
// The client always takes the approved draft to the police (ISHAAN-ANSWERS
// 2026-11-12 Q119/Q120: the advocate's job ends at the draft; no police
// submission by the advocate, no "within 24 hours"): Draft Authorization ✓ ·
// Download your approved draft · Submit it at <police station>, and the notice
// says the draft becomes an official FIR only when the SHO registers it.
// Left out per flow C14 [REMOVE]: "Verification Confirmed", "recorded on the
// ledger", "Signed & Certified", "E-SIGNED", "biometric sign-off", "affixing
// statutory bar credentials", the online dot, and the verified tick unless the
// advocate is admin-verified. "e-Filing" is also left out. The advocate's photo
// shows when advocate_profiles.photo_key names a bundled portrait, else initials.
import {router,useLocalSearchParams,type Href} from 'expo-router';
import {ArrowRight,BadgeCheck,Check,CircleHelp,ClipboardList,Clock,Download,FileText,Info,MessageSquareText,Shield,TrendingUp} from 'lucide-react-native';
import {useState} from 'react';
import {Image,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FirResultHeader from '../../../components/FirResultHeader';
import RequestIdCard from '../../../components/RequestIdCard';
import {colors,font,ink} from '../../../constants/theme';
import {advocatePortrait} from '../../../data/advocates';
import {backOr,firHref,firPdfName,formatSize,initials,useFirFlow} from '../flow';
import {downloadDocument} from './api';
import {dayTime,errorText,goHome,hashRef} from './format';
import {InlineError,LoadingState,StatePanel} from './ui';
import {firApproved as t,firInk} from './tokens';

type Step={title:string;desc?:string;state:'done'|'active'|'pending';action?:{label:string;onPress():void}};

const advocateName=(name:string)=>/^adv\.?\s/i.test(name)?name:`Adv. ${name}`;

export default function FirApprovedScreen(){
  const {caseId}=useLocalSearchParams<{caseId?:string}>();
  const insets=useSafeAreaInsets();
  const f=useFirFlow(caseId),flow=f.flow;
  const [fileError,setFileError]=useState('');
  const back=()=>{if(caseId)backOr(firHref('status',caseId));else goHome();};
  const header=<FirResultHeader title="Fir Draft Approved" align="left" avatar="dark" onBack={back}/>;
  const support=()=>router.push((`/support?caseId=${encodeURIComponent(caseId??'')}`) as Href);
  const open=async(action:()=>Promise<void>,failed:string)=>{setFileError('');try{await action();}catch(e){setFileError(`${failed} ${errorText(e,'')}`.trim());}};

  if(f.loading&&!flow)return <View style={styles.screen}>{header}<LoadingState label="Loading your approved draft…"/></View>;
  if(!flow)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    <StatePanel tone="error" title="We couldn’t load your approved draft" body={f.error||'Something went wrong loading your request.'}
      actions={[...(caseId?[{label:'Try again',onPress:f.reload,primary:true}]:[]),{label:'Back to Home',onPress:goHome}]}/>
  </ScrollView></View>;

  const approval=[...flow.events].reverse().find(e=>e.type==='fir_client_approved');
  if(flow.stage.client.stage<5||!approval)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    {flow.stage.client.decision_due
      ?<StatePanel title="Your draft is waiting for your approval" body="Review your FIR draft, then approve it or request changes." actions={[{label:'Review Your Draft',onPress:()=>router.replace(firHref('ready',flow.case_id)),primary:true}]}/>
      :flow.stage.client.stage===5
        ?<StatePanel title="No approval on this request" body={`${hashRef(flow.reference)} was completed before client approval was part of the service.`} actions={[{label:'View FIR Draft',onPress:()=>router.replace(firHref('ready',flow.case_id)),primary:true}]}/>
        :<StatePanel title="Your draft isn’t approved yet" body={`Request ${hashRef(flow.reference)} is ${flow.stage.client.status.toLowerCase()}.`} actions={[{label:'Track Request',onPress:()=>router.replace(firHref('status',flow.case_id)),primary:true}]}/>}
  </ScrollView></View>;

  const advocate=flow.advocate,draft=flow.draft;
  const portrait=advocatePortrait(advocate?.photo_key);
  const station=flow.police_station?.trim()||null;
  const steps:Step[]=[
    {title:'Draft Authorization',desc:'Completed by applicant',state:'done'},
    {title:'Download your approved draft',desc:draft?'Use the download button above to save the PDF.':'Your approved draft will appear above once it’s ready to download.',state:'active'},
    {title:station?`Submit it at ${station}`:'Submit it at your police station',desc:'It becomes an official FIR once the Station House Officer (SHO) registers it.',state:'pending'},
  ];
  const notice=`Approving this draft certifies your statement accuracy. You submit the approved draft at ${station??'your police station'} yourself; it becomes an official FIR only when the Station House Officer (SHO) registers it.`;
  const name=draft?firPdfName(flow.reference,draft.version):'';
  const size=draft?formatSize(draft.document.size_bytes):'';

  return <View style={styles.screen}>
    {header}
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {!!f.error&&<InlineError style={styles.refreshError} message={`Couldn’t refresh this request. ${f.error}`} onRetry={f.reload}/>}
      <View style={styles.heroGlow}><View style={styles.heroDisc}><Check size={t.heroGlyph} color={ink.onBrand} strokeWidth={3}/></View></View>
      <Text style={styles.title}>FIR Draft Approved Successfully</Text>
      <Text style={styles.body}>You have approved your legal draft.</Text>

      {advocate&&<View style={styles.advocate}>
        <View style={styles.avatar}>{portrait?<Image source={portrait} style={styles.avatarImage} accessibilityIgnoresInvertColors/>:<Text style={styles.avatarText}>{initials(advocate.name)}</Text>}</View>
        <View style={styles.advocateText}>
          <View style={styles.nameRow}><Text style={styles.name} numberOfLines={1}>{advocateName(advocate.name)}</Text>{advocate.verified&&<View accessible accessibilityLabel="Verified by Legalitt"><BadgeCheck size={16} color={firInk.green}/></View>}</View>
          <Text style={styles.role}>Assigned Lead Legal Counsel</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Chat with ${advocate.name}`} onPress={()=>router.push((`/messages/thread?caseId=${encodeURIComponent(flow.case_id)}`) as Href)}
          style={({pressed})=>[styles.chat,pressed&&styles.pressed]}>
          <MessageSquareText size={t.chatIcon} color={colors.textPrimary}/><Text style={styles.chatText}>Chat</Text>
        </Pressable>
      </View>}

      <View style={styles.card}>
        <View style={styles.headRow}>
          <View style={styles.headTile}><ClipboardList size={t.headIcon} color={colors.textBody}/></View>
          <Text style={styles.headTitle}>Reference Details</Text>
          <View style={styles.badge}><View style={styles.badgeDot}/><Text style={styles.badgeText}>Approved</Text></View>
        </View>
        <RequestIdCard requestId={flow.reference} label="FIR Request ID" variant="icon" style={styles.idBox}/>
        {draft&&<View style={styles.fileRow}>
          <View style={styles.fileTile}><FileText size={t.fileIcon} color={firInk.peachText}/></View>
          <View style={styles.fileText}>
            <Text style={styles.fileName} numberOfLines={1}>{name}</Text>
            {!!size&&<Text style={styles.fileMeta}>{size}</Text>}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Download ${name}`} hitSlop={8} onPress={()=>void open(()=>downloadDocument(draft.document.id,name),'The draft couldn’t be downloaded.')}>
            <Download size={20} color={colors.textBody}/>
          </Pressable>
        </View>}
        <InlineError style={styles.fileError} message={fileError}/>
        <View style={styles.stamp}><Clock size={t.stampIcon} color={firInk.green}/><Text style={styles.stampText}>Recorded: {dayTime(approval.created_at)} IST</Text></View>
      </View>

      <View style={styles.card}>
        <View style={styles.headRow}>
          <View style={[styles.headTile,styles.headTilePeach]}><TrendingUp size={t.headIcon} color={firInk.peachText}/></View>
          <View style={styles.headTextBlock}>
            <Text style={styles.headTitle}>What Happens Next?</Text>
            <Text style={styles.headSub}>FIR multi-tier statutory progression</Text>
          </View>
        </View>
        {steps.map((s,i)=><View key={s.title} style={styles.step}>
          <View style={styles.rail}>
            <View style={[styles.marker,s.state==='done'?styles.markerDone:s.state==='active'?styles.markerActive:styles.markerPending]}>
              {s.state==='done'?<Check size={13} color={ink.onBrand} strokeWidth={3}/>:s.state==='active'?<View style={styles.activeDot}/>:<Shield size={12} color={colors.textBody}/>}
            </View>
            {i<steps.length-1&&<View style={styles.line}/>}
          </View>
          <View style={[styles.stepBody,i<steps.length-1&&styles.stepGap]}>
            <View style={styles.stepTitleRow}>
              <Text style={[styles.stepTitle,s.state==='active'&&styles.stepTitleActive]}>{s.title}</Text>
              {s.state==='active'&&<View style={styles.activeChip}><Text style={styles.activeChipText}>Active</Text></View>}
            </View>
            {!!s.desc&&<Text style={styles.stepDesc}>{s.desc}</Text>}
            {s.action&&<Pressable accessibilityRole="button" onPress={s.action.onPress} hitSlop={6}><Text style={styles.stepAction}>{s.action.label}</Text></Pressable>}
          </View>
        </View>)}
        <View style={styles.notice}>
          <Info size={16} color={firInk.peachText} style={styles.noticeIcon}/>
          <Text style={styles.noticeText}><Text style={styles.noticeLead}>Statutory Notice: </Text>{notice}</Text>
        </View>
      </View>

      <View style={styles.supportRow}>
        <CircleHelp size={15} color={colors.textBody}/>
        <Text style={styles.supportLead}>Questions regarding your filing? </Text>
        <Pressable accessibilityRole="link" onPress={support}><Text style={styles.supportLink}>Contact Support</Text></Pressable>
      </View>
    </ScrollView>
    <View style={[styles.bar,{paddingBottom:insets.bottom+16}]}>
      <Pressable accessibilityRole="button" onPress={goHome} style={({pressed})=>[styles.home,pressed&&styles.pressed]}>
        <Text style={styles.homeText}>Back to Home</Text><ArrowRight size={18} color={ink.onBrand}/>
      </Pressable>
    </View>
  </View>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:firInk.bg},
  scroll:{flex:1},
  content:{paddingHorizontal:t.padX,paddingBottom:24},
  pressed:{opacity:0.85},
  refreshError:{marginTop:12},
  heroGlow:{marginTop:t.heroTop,alignSelf:'center',width:t.heroGlow,height:t.heroGlow,borderRadius:t.heroGlow/2,backgroundColor:'#D5F0E2',alignItems:'center',justifyContent:'center'},
  heroDisc:{width:t.heroDisc,height:t.heroDisc,borderRadius:t.heroDisc/2,backgroundColor:firInk.greenBright,alignItems:'center',justifyContent:'center'},
  title:{marginTop:t.titleTop,textAlign:'center',fontFamily:font.appHeading,fontSize:t.titleSize,lineHeight:t.titleLine,color:colors.textPrimary},
  body:{marginTop:t.bodyTop,textAlign:'center',fontFamily:font.appBody,fontSize:t.bodySize,lineHeight:t.bodyLine,color:colors.textBody},
  advocate:{marginTop:t.cardTop,borderRadius:t.cardRadius,backgroundColor:t.advocateBg,padding:12,flexDirection:'row',alignItems:'center'},
  avatar:{width:t.avatar,height:t.avatar,borderRadius:t.avatar/2,backgroundColor:t.avatarBg,alignItems:'center',justifyContent:'center',overflow:'hidden'},
  avatarImage:{width:t.avatar,height:t.avatar},
  avatarText:{fontFamily:font.appHeading,fontSize:t.avatarSize,color:firInk.deep},
  advocateText:{flex:1,minWidth:0,marginLeft:t.advocateGap},
  nameRow:{flexDirection:'row',alignItems:'center',gap:6},
  name:{flexShrink:1,fontFamily:font.appHeading,fontSize:t.nameSize,color:colors.textPrimary},
  role:{marginTop:2,fontFamily:font.appBody,fontSize:t.roleSize,color:colors.textBody},
  chat:{marginLeft:8,height:t.chatH,borderRadius:t.chatRadius,paddingHorizontal:t.chatPadX,backgroundColor:t.chatBg,flexDirection:'row',alignItems:'center',gap:6},
  chatText:{fontFamily:font.appSemi,fontSize:t.chatSize,color:colors.textPrimary},
  card:{marginTop:t.cardGap,borderRadius:t.cardRadius,backgroundColor:colors.card,padding:t.cardPad},
  headRow:{flexDirection:'row',alignItems:'center',gap:10},
  headTile:{width:t.headTile,height:t.headTile,borderRadius:t.headTileRadius,backgroundColor:'#F1EFEC',alignItems:'center',justifyContent:'center'},
  headTilePeach:{backgroundColor:firInk.peach},
  headTextBlock:{flex:1,minWidth:0},
  headTitle:{flex:1,minWidth:0,fontFamily:font.appHeading,fontSize:t.headTitleSize,color:colors.textPrimary},
  headSub:{marginTop:2,fontFamily:font.appBody,fontSize:t.headSubSize,color:colors.textBody},
  badge:{height:t.badgeH,borderRadius:t.badgeRadius,paddingHorizontal:t.badgePadX,backgroundColor:t.badgeBg,flexDirection:'row',alignItems:'center',gap:6},
  badgeDot:{width:6,height:6,borderRadius:3,backgroundColor:firInk.greenBright},
  badgeText:{fontFamily:font.appSemi,fontSize:t.badgeSize,color:firInk.green},
  idBox:{marginTop:t.idTop,backgroundColor:firInk.soft,borderRadius:t.idRadius,padding:t.idPad},
  fileRow:{marginTop:t.fileTop,flexDirection:'row',alignItems:'center'},
  fileTile:{width:t.fileTile,height:t.fileTile,borderRadius:8,backgroundColor:firInk.peach,alignItems:'center',justifyContent:'center'},
  fileText:{flex:1,minWidth:0,marginLeft:t.fileGap},
  fileName:{fontFamily:font.appSemi,fontSize:t.fileNameSize,color:colors.textPrimary},
  fileMeta:{marginTop:2,fontFamily:font.appBody,fontSize:t.fileMetaSize,color:colors.textBody},
  fileError:{marginTop:10},
  stamp:{marginTop:t.stampTop,flexDirection:'row',alignItems:'center',gap:6},
  stampText:{flex:1,minWidth:0,fontFamily:font.appBody,fontSize:t.stampSize,color:colors.textBody},
  step:{marginTop:t.stepTop,flexDirection:'row'},
  rail:{alignItems:'center'},
  marker:{width:t.stepMarker,height:t.stepMarker,borderRadius:t.stepMarker/2,alignItems:'center',justifyContent:'center'},
  markerDone:{backgroundColor:firInk.greenBright},
  markerActive:{backgroundColor:firInk.deep},
  markerPending:{backgroundColor:firInk.chip},
  activeDot:{width:8,height:8,borderRadius:4,backgroundColor:ink.onBrand},
  line:{flex:1,width:2,marginTop:2,marginBottom:-t.stepTop+2,backgroundColor:firInk.chip},
  stepBody:{flex:1,minWidth:0,marginLeft:t.stepGap},
  stepGap:{paddingBottom:2},
  stepTitleRow:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:8},
  stepTitle:{flexShrink:1,fontFamily:font.appSemi,fontSize:t.stepTitleSize,color:colors.textPrimary},
  stepTitleActive:{color:firInk.peachText},
  activeChip:{height:t.activeChipH,borderRadius:t.activeChipRadius,paddingHorizontal:t.activeChipPadX,backgroundColor:t.activeChipBg,justifyContent:'center'},
  activeChipText:{fontFamily:font.appSemi,fontSize:t.activeChipSize,color:firInk.peachText},
  stepDesc:{marginTop:2,fontFamily:font.appBody,fontSize:t.stepDescSize,lineHeight:t.stepDescLine,color:colors.textBody},
  stepAction:{marginTop:4,fontFamily:font.appSemi,fontSize:t.stepDescSize,color:firInk.peachText,textDecorationLine:'underline'},
  notice:{marginTop:t.noticeTop,borderRadius:t.noticeRadius,backgroundColor:t.noticeBg,padding:t.noticePad,flexDirection:'row',alignItems:'flex-start'},
  noticeIcon:{marginTop:2},
  noticeText:{flex:1,minWidth:0,marginLeft:10,fontFamily:font.appBody,fontSize:t.noticeSize,lineHeight:t.noticeLine,color:firInk.peachText},
  noticeLead:{fontFamily:font.appHeading},
  supportRow:{marginTop:t.supportTop,flexDirection:'row',alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:4},
  supportLead:{fontFamily:font.appBody,fontSize:t.supportSize,color:colors.textBody},
  supportLink:{fontFamily:font.appSemi,fontSize:t.supportSize,color:firInk.peachText,textDecorationLine:'underline'},
  bar:{paddingTop:t.barPadTop,paddingHorizontal:t.padX,backgroundColor:firInk.bg,borderTopWidth:1,borderTopColor:firInk.border},
  home:{height:t.buttonH,borderRadius:t.buttonRadius,backgroundColor:firInk.deep,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10},
  homeText:{fontFamily:font.appHeading,fontSize:t.buttonSize,color:ink.onBrand},
});

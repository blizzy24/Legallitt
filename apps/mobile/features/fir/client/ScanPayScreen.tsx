// C8a Scan & Pay (design/client/fir-draft/F4-scan-pay.png), service name "FIR Draft"
// (the design's "Legal Notice" is a copy slip). The QR is a drawing, not a payable
// code: payment is simulated until Razorpay (§2.11) and happens only on an explicit
// tap of "Simulate successful payment" or "Pay using UPI App" — never on the timer
// (§2.12). The 10:00 countdown is real; at 00:00 the QR expires and "Generate new
// QR" starts a fresh one.
//
// Built here rather than on components/ScanPayScreen: that shared screen freezes or
// auto-advances its countdown, and FIR needs a live countdown that never advances.
import {useCallback,useState} from 'react';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import {Clock,QrCode,RefreshCw,Smartphone} from 'lucide-react-native';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PayHeader from '../../../components/PayHeader';
import QrGlyph from '../../../components/QrGlyph';
import Spinner from '../../../components/Spinner';
import {colors,font,ink,scanPay as s} from '../../../constants/theme';
import {backOr,firHref,useFirFlow} from '../flow';
import {payFirServiceFee,useFirQuote} from './api';
import {errorText,hashRef,isPaid,money} from './format';
import {InlineError,LoadingState,StatePanel,TestPaymentLabel} from './ui';
import {firInk} from './tokens';

const UPI_APPS=['Google Pay','PhonePe','Paytm','BHIM'];
const FAILED='Payment didn’t go through. You haven’t been charged.';
const mmss=(total:number)=>`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;

export default function FirScanPayScreen(){
  const {caseId}=useLocalSearchParams<{caseId?:string}>();
  const insets=useSafeAreaInsets();
  const f=useFirFlow(caseId),flow=f.flow;
  const payable=flow?.status==='payment_pending';
  const q=useFirQuote(caseId,payable);
  const ready=q.quote?.status==='ready'?q.quote:null;
  const [left,setLeft]=useState<number>(s.validSeconds),[qr,setQr]=useState(0);
  const [paying,setPaying]=useState<null|'qr'|'app'>(null),[failure,setFailure]=useState<string|null>(null);
  const expired=left<=0;

  // The visible countdown: one tick a second while this screen is in front.
  useFocusEffect(useCallback(()=>{
    if(!payable)return;
    const tick=setInterval(()=>setLeft(v=>Math.max(0,v-1)),1000);
    return()=>clearInterval(tick);
  },[payable,qr]));

  const newQr=()=>{setLeft(s.validSeconds);setQr(n=>n+1);setFailure(null);q.reload();};
  const back=()=>caseId?backOr(firHref('payment',caseId)):router.back();
  const pay=async(kind:'qr'|'app')=>{
    if(!caseId||!ready||paying)return;
    setPaying(kind);setFailure(null);
    try{
      const result=await payFirServiceFee(caseId,ready.id);
      if(result==='paid')router.replace(firHref('payment-success',caseId));
      else f.reload();
    }catch(e){setFailure(errorText(e,''));q.reload();}
    finally{setPaying(null);}
  };

  const header=<PayHeader padX={s.padX} title="Scan & Pay" subtitle="UPI Dynamic QR" intro="Scan the QR code using any UPI app to complete your payment." onBack={back}/>;
  if(f.loading&&!flow)return <View style={styles.screen}>{header}<LoadingState label="Loading your payment…"/></View>;
  if(!flow)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    <StatePanel tone="error" title="We couldn’t load this payment" body={f.error||'Something went wrong loading your request.'}
      actions={[...(caseId?[{label:'Try again',onPress:f.reload,primary:true}]:[]),{label:'Back to payment',onPress:back}]}/>
  </ScrollView></View>;
  if(!payable)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    {isPaid(flow)
      ?<StatePanel title="Payment already received" body={`Your payment for ${hashRef(flow.reference)} has been received. You won’t be charged again.`} actions={[{label:'Track Request',onPress:()=>router.replace(firHref('status',flow.case_id)),primary:true}]}/>
      :<StatePanel title="This request isn’t waiting for payment" body={`Request ${hashRef(flow.reference)} is ${flow.stage.client.status.toLowerCase()}.`} actions={[{label:'Back to payment',onPress:back,primary:true}]}/>}
  </ScrollView></View>;

  return <View style={styles.screen}>
    {header}
    <ScrollView contentContainerStyle={[styles.content,{paddingBottom:insets.bottom+s.cardGap}]} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.chips}>
          <View style={styles.scanChip}><QrCode size={s.chipIcon} color={ink.accent}/><Text style={styles.scanChipText}>Scan to Pay</Text></View>
          <View style={[styles.timer,expired&&styles.timerExpired]} accessibilityLiveRegion={expired?'polite':'none'}>
            <Clock size={s.chipIcon} color={expired?firInk.danger:colors.textBody}/>
            {expired?<Text style={[styles.timerText,styles.expiredText]}>QR expired</Text>
              :<Text style={styles.timerText}>QR valid for <Text style={styles.timerValue}>{mmss(left)}</Text></Text>}
          </View>
        </View>

        <View style={[styles.qr,expired&&styles.qrExpired]}><QrGlyph/></View>
        {expired&&<Pressable accessibilityRole="button" onPress={newQr} style={({pressed})=>[styles.newQr,pressed&&styles.pressed]}>
          <RefreshCw size={16} color={ink.onBrand}/><Text style={styles.newQrText}>Generate new QR</Text>
        </Pressable>}

        {ready?<Text style={styles.amount}>{money(ready.breakdown.total_paise)}</Text>
          :q.loading?<View style={styles.amountState}><Spinner/><Text role="status" style={styles.instr}>Calculating amount…</Text></View>
          :q.error?<InlineError style={styles.amountError} message={`We couldn’t calculate the amount. ${q.error}`} onRetry={q.reload}/>
          :q.quote?.status==='blocked'?<InlineError style={styles.amountError} message={q.quote.message} retryLabel="Review payment details" onRetry={back}/>:null}
        <Text style={styles.service}>FIR Draft</Text>
        <Text style={styles.instr}>Open your UPI app and scan the QR code to complete the payment.</Text>

        {!expired&&<View style={styles.wait}><Spinner/><Text style={styles.waitText}>Waiting for payment…</Text></View>}

        <View style={styles.simulate}>
          <TestPaymentLabel/>
          <Pressable accessibilityRole="button" accessibilityState={{disabled:!ready||expired||!!paying,busy:paying==='qr'}} disabled={!ready||expired||!!paying}
            onPress={()=>void pay('qr')} style={({pressed})=>[styles.simulateButton,(!ready||expired||!!paying)&&styles.disabled,pressed&&styles.pressed]}>
            {paying==='qr'&&<Spinner size={14}/>}
            <Text style={styles.simulateText}>{paying==='qr'?'Processing payment…':'Simulate successful payment'}</Text>
          </Pressable>
          {expired&&<Text style={styles.simulateHint}>Generate a new QR to continue.</Text>}
        </View>

        {failure!==null&&<View accessibilityRole="alert" style={styles.failure}>
          <Text style={styles.failureTitle}>{FAILED}</Text>
          {!!failure&&<Text style={styles.failureDetail}>{failure}</Text>}
        </View>}

        <View style={styles.divider}/>
        <View style={styles.apps}>{UPI_APPS.map((a,i)=><View key={a} style={styles.appItem}>{i>0&&<Text style={styles.appDot}>·</Text>}<Text style={styles.appText}>{a}</Text></View>)}</View>
      </View>

      <View style={[styles.card,styles.altCard]}>
        <Text style={styles.altTitle}>Prefer another method?</Text>
        <Pressable accessibilityRole="button" accessibilityState={{disabled:!ready||!!paying,busy:paying==='app'}} disabled={!ready||!!paying}
          onPress={()=>void pay('app')} style={({pressed})=>[styles.altButton,(!ready||!!paying)&&styles.disabled,pressed&&styles.pressed]}>
          {paying==='app'?<Spinner size={14}/>:<Smartphone size={s.altIcon} color={ink.accent}/>}
          <Text style={styles.altButtonText}>{paying==='app'?'Processing payment…':'Pay using UPI App'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  </View>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.appBg},
  content:{paddingHorizontal:s.padX,paddingTop:s.cardGap,gap:s.cardGap},
  pressed:{opacity:0.85},
  disabled:{opacity:0.5},
  card:{borderRadius:s.cardRadius,backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,padding:s.cardPad,alignItems:'center'},
  chips:{alignSelf:'stretch',flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  scanChip:{height:s.chipH,borderRadius:s.chipRadius,paddingHorizontal:s.chipPadX,backgroundColor:colors.iconChipBg,flexDirection:'row',alignItems:'center',gap:s.chipIconGap},
  scanChipText:{fontFamily:font.appSemi,fontSize:s.chipTextSize,color:ink.accent},
  timer:{height:s.timerH,borderRadius:s.timerH/2,paddingHorizontal:s.timerPadX,borderWidth:1,borderColor:colors.border,backgroundColor:colors.card,flexDirection:'row',alignItems:'center',gap:s.chipIconGap},
  timerExpired:{borderColor:firInk.dangerSoft,backgroundColor:firInk.dangerSoft},
  timerText:{fontFamily:font.appBody,fontSize:s.timerTextSize,color:colors.textBody},
  timerValue:{fontFamily:font.appHeading,color:colors.textPrimary},
  expiredText:{fontFamily:font.appSemi,color:firInk.danger},
  qr:{marginTop:s.qrGap},
  qrExpired:{opacity:0.25},
  newQr:{marginTop:12,height:40,borderRadius:10,paddingHorizontal:16,backgroundColor:colors.brand,flexDirection:'row',alignItems:'center',gap:8},
  newQrText:{fontFamily:font.appSemi,fontSize:14,color:ink.onBrand},
  amount:{marginTop:s.amountGap,fontFamily:font.appHeading,fontSize:s.amountSize,color:colors.textPrimary},
  amountState:{marginTop:s.amountGap,flexDirection:'row',alignItems:'center',gap:8},
  amountError:{marginTop:s.amountGap,alignSelf:'stretch'},
  service:{marginTop:s.serviceGap,fontFamily:font.appSemi,fontSize:s.serviceSize,color:ink.accent},
  instr:{marginTop:s.instrGap,textAlign:'center',fontFamily:font.appBody,fontSize:s.instrSize,lineHeight:s.instrLineHeight,color:colors.textBody,maxWidth:250},
  wait:{marginTop:s.waitGap,alignSelf:'stretch',height:s.waitH,borderRadius:s.waitRadius,borderWidth:1,borderColor:colors.border,backgroundColor:s.waitBg,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:s.spinnerGap},
  waitText:{fontFamily:font.appHeading,fontSize:s.waitTextSize,color:colors.textPrimary},
  simulate:{marginTop:14,alignSelf:'stretch',borderRadius:s.waitRadius,borderWidth:1,borderStyle:'dashed',borderColor:'#E3D3A6',padding:12,gap:10,alignItems:'center'},
  simulateButton:{alignSelf:'stretch',minHeight:42,borderRadius:10,borderWidth:1,borderColor:s.altBorder,backgroundColor:colors.card,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
  simulateText:{fontFamily:font.appSemi,fontSize:14,color:colors.textPrimary},
  simulateHint:{fontFamily:font.appBody,fontSize:12,color:colors.textBody},
  failure:{marginTop:12,alignSelf:'stretch',borderRadius:10,backgroundColor:firInk.dangerSoft,padding:10},
  failureTitle:{fontFamily:font.appSemi,fontSize:12.5,lineHeight:18,color:firInk.danger},
  failureDetail:{marginTop:2,fontFamily:font.appBody,fontSize:12,lineHeight:17,color:firInk.danger},
  divider:{marginTop:s.dividerGap,alignSelf:'stretch',height:1,backgroundColor:colors.border},
  apps:{marginTop:s.appsGap,flexDirection:'row',alignItems:'center',flexWrap:'wrap',justifyContent:'center'},
  appItem:{flexDirection:'row',alignItems:'center'},
  appDot:{marginHorizontal:s.appsDotGap,fontFamily:font.appBody,fontSize:s.appsSize,color:colors.textMuted},
  appText:{fontFamily:font.appSemi,fontSize:s.appsSize,color:s.appsText},
  altCard:{paddingBottom:s.cardPad-1},
  altTitle:{fontFamily:font.appBody,fontSize:s.altTitleSize,color:s.altTitle},
  altButton:{marginTop:s.altButtonGap,alignSelf:'stretch',height:s.altButtonH,borderRadius:s.altButtonRadius,borderWidth:s.altButtonBorder,borderColor:s.altBorder,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:s.altIconGap},
  altButtonText:{fontFamily:font.appSemi,fontSize:s.altTextSize,color:ink.accent},
});

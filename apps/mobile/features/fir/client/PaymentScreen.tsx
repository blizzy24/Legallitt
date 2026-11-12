// C8 Complete Payment (design/client/fir-draft/F3-complete-payment.png).
// Every figure comes from the live quote; nothing from the design's sample maths.
// Scan QR Code goes to F4; UPI App, Cards and Net Banking are simulated in place
// (§2.11): the Pay button shows "Processing payment…" for as long as the real
// payment call takes, then F5 opens. Nothing advances on a timer (§2.12).
import {useState} from 'react';
import {router,useLocalSearchParams} from 'expo-router';
import {ArrowLeft,ArrowRight,FileText,ShieldCheck} from 'lucide-react-native';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {QuoteBreakdown} from '@legalitt/shared';
import PaymentMethods,{DEFAULT_PAYMENT_SELECTION,type PaymentSelection} from '../../../components/PaymentMethods';
import Spinner from '../../../components/Spinner';
import {shrinkToFit} from '../../../constants/textFit';
import {courierPayment as t,font,ink} from '../../../constants/theme';
import {backend} from '../../../lib/auth';
import {firHref,useFirFlow} from '../flow';
import {payFirServiceFee,useFirQuote} from './api';
import {addPaise,backTo,errorText,hashRef,isPaid,isZero,money} from './format';
import {InlineError,LoadingState,StatePanel,TestPaymentLabel} from './ui';
import {firInk} from './tokens';

const FAILED='Payment didn’t go through. You haven’t been charged.';

function priceRows(b:QuoteBreakdown):[string,string][]{
  return [
    ['Service Fee',b.service_fee_paise],
    ['Platform Fee',b.platform_fee_paise],
    ['Goods & Services Tax (GST 18%)',addPaise(b.gst_paise,b.page_overage_gst_paise)],
    ...(b.charged_pages>0?[[`Extra Pages (${b.charged_pages} × ${money(b.page_unit_paise)})`,b.page_overage_paise] as [string,string]]:[]),
    // An FIR has no courier; shown only if a tariff ever charges one, so rows add up.
    ...(!isZero(b.delivery_fee_paise)?[['Delivery Fee',b.delivery_fee_paise] as [string,string]]:[]),
  ];
}

export default function FirPaymentScreen(){
  const {caseId}=useLocalSearchParams<{caseId?:string}>();
  const insets=useSafeAreaInsets();
  const f=useFirFlow(caseId),flow=f.flow;
  const payable=flow?.status==='payment_pending';
  const q=useFirQuote(caseId,payable);
  const [selection,setSelection]=useState<PaymentSelection>(DEFAULT_PAYMENT_SELECTION);
  const [paying,setPaying]=useState(false),[failure,setFailure]=useState<string|null>(null);
  const [removing,setRemoving]=useState(''),[removeError,setRemoveError]=useState('');
  const ready=q.quote?.status==='ready'?q.quote:null;

  const back=()=>caseId?backTo(firHref('step5',caseId)):router.back();
  const header=<View style={[styles.header,{paddingTop:insets.top+t.headerTop}]}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.circle}><ArrowLeft size={t.backIcon} color={t.ink} strokeWidth={2.1}/></Pressable>
    <Text style={styles.headerTitle} {...shrinkToFit(0.8)}>Complete Payment</Text>
  </View>;

  const pay=async()=>{
    if(!caseId||!ready||paying)return;
    if(selection.method==='upi'&&selection.upiMode==='qr'){router.push(firHref('scan-pay',caseId));return;}
    setPaying(true);setFailure(null);
    try{
      const result=await payFirServiceFee(caseId,ready.id);
      if(result==='paid')router.replace(firHref('payment-success',caseId));
      else f.reload();
    }catch(e){setFailure(errorText(e,''));q.reload();}
    finally{setPaying(false);}
  };
  const removeUpload=async(id:string)=>{
    setRemoving(id);setRemoveError('');
    try{await backend.deleteDocument(id);q.reload();}
    catch(e){setRemoveError(errorText(e,'That file couldn’t be removed. Try again.'));}
    finally{setRemoving('');}
  };

  if(f.loading&&!flow)return <View style={styles.screen}>{header}<LoadingState label="Loading your payment details…"/></View>;
  if(!flow)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.stateContent}>
    <StatePanel tone="error" title="We couldn’t load this payment" body={f.error||'Something went wrong loading your request.'}
      actions={[...(caseId?[{label:'Try again',onPress:f.reload,primary:true}]:[]),{label:'Go to My Requests',onPress:()=>router.replace('/cases')}]}/>
  </ScrollView></View>;
  if(!payable){
    const paid=isPaid(flow);
    return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.stateContent}>
      {flow.status==='draft'
        ?<StatePanel title="Finish your request first" body="Submit your FIR draft request from the Review step, then pay here." actions={[{label:'Go to Review',onPress:()=>router.replace(firHref('step5',flow.case_id)),primary:true}]}/>
        :paid
          ?<StatePanel title="Payment already received" body={`Your payment for ${hashRef(flow.reference)} has been received. You won’t be charged again.`} actions={[{label:'Track Request',onPress:()=>router.replace(firHref('status',flow.case_id)),primary:true}]}/>
          :<StatePanel title="This request can’t be paid" body={`Request ${hashRef(flow.reference)} is ${flow.stage.client.status.toLowerCase()}.`} actions={[{label:'Track Request',onPress:()=>router.replace(firHref('status',flow.case_id)),primary:true}]}/>}
    </ScrollView></View>;
  }

  return <View style={styles.screen}>
    {header}
    <ScrollView style={styles.scroll} contentContainerStyle={{paddingBottom:t.bottomPad}} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.tile}><FileText size={t.tileIcon} color={t.brand} strokeWidth={2}/></View>
        <View style={styles.chip}><FileText size={t.chipIcon} color={t.brand} strokeWidth={2}/></View>
        <Text style={styles.cardTitle} {...shrinkToFit(0.75)}>FIR</Text>
        <Text style={styles.ref} {...shrinkToFit(0.8)}>Ref ID: {hashRef(flow.reference)}</Text>
        <View style={styles.divider}/>

        {q.loading&&!q.quote?<View style={styles.quoteState}><Spinner/><Text role="status" style={styles.quoteStateText}>Calculating your fee…</Text></View>
        :q.error?<InlineError style={styles.quoteError} message={`We couldn’t calculate your fee. ${q.error}`} onRetry={q.reload}/>
        :q.quote?.status==='blocked'?<View style={styles.blocked}>
          <InlineError message={q.quote.message}/>
          {q.quote.documents.map(d=><View key={d.id} style={styles.blockedRow}>
            <View style={styles.blockedText}><Text style={styles.blockedName} numberOfLines={1}>{d.filename}</Text><Text style={styles.blockedReason}>{d.reason}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${d.filename}`} disabled={!!removing} onPress={()=>void removeUpload(d.id)} hitSlop={6}>
              <Text style={styles.blockedAction}>{removing===d.id?'Removing…':'Remove'}</Text>
            </Pressable>
          </View>)}
          <InlineError message={removeError}/>
          <View style={styles.blockedLinks}>
            <Pressable accessibilityRole="button" onPress={()=>router.push(firHref('step4',flow.case_id))}><Text style={styles.blockedAction}>Open Documents</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={q.reload}><Text style={styles.blockedAction}>Recalculate</Text></Pressable>
          </View>
        </View>
        :ready?<>
          {priceRows(ready.breakdown).map(([label,value],i)=><View key={label} style={[styles.row,i>0&&styles.rowNext]}>
            <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>{label}</Text>
            <Text style={styles.rowValue} {...shrinkToFit(0.8)}>{money(value)}</Text>
          </View>)}
          <View style={styles.divider}/>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel} {...shrinkToFit(0.8)}>Total Payable</Text>
            <Text style={styles.totalValue} {...shrinkToFit(0.8)}>{money(ready.breakdown.total_paise)}</Text>
          </View>
          <Text style={styles.note} {...shrinkToFit(0.8)}>Inclusive of all legal taxes</Text>
        </>:null}
      </View>

      <View style={styles.methodHead}><Text style={styles.methodLabel} {...shrinkToFit(0.8)}>SELECT PAYMENT METHOD</Text></View>
      <View style={styles.methods}><PaymentMethods value={selection} onChange={next=>{setSelection(next);setFailure(null);}} disabled={paying}/></View>

      <View style={styles.secure}>
        <ShieldCheck size={t.secureIcon} color={t.inkMuted} strokeWidth={2}/>
        <Text style={styles.secureText}>Your payment is processed securely through our payment provider.</Text>
      </View>
      <TestPaymentLabel style={styles.test}/>
    </ScrollView>

    <View style={[styles.bar,{paddingBottom:insets.bottom+t.barPadBottom}]}>
      {failure!==null&&<View accessibilityRole="alert" style={styles.failure}>
        <Text style={styles.failureTitle}>{FAILED}</Text>
        {!!failure&&<Text style={styles.failureDetail}>{failure}</Text>}
      </View>}
      {ready&&<View style={styles.barRow}>
        <Text style={styles.barLabel} {...shrinkToFit(0.8)}>Amount to pay</Text>
        <Text style={styles.barAmount} {...shrinkToFit(0.8)}>{money(ready.breakdown.total_paise)}</Text>
      </View>}
      <Pressable accessibilityRole="button" accessibilityLabel={paying?'Processing payment':failure!==null?'Try again':'Pay'} accessibilityState={{disabled:!ready||paying,busy:paying}}
        disabled={!ready||paying} onPress={()=>void pay()} style={({pressed})=>[styles.pay,(!ready||paying)&&styles.payDisabled,pressed&&styles.pressed]}>
        {paying?<><Spinner size={18}/><Text style={[styles.payText,styles.payBusy]}>Processing payment…</Text></>
          :<><Text style={styles.payText} {...shrinkToFit(0.8)}>{failure!==null?'Try again':'Pay'}</Text><ArrowRight size={t.payIcon} color={ink.onBrand} strokeWidth={2.2}/></>}
      </Pressable>
    </View>
  </View>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:t.bg},
  stateContent:{paddingHorizontal:t.padX,paddingBottom:40},
  pressed:{opacity:0.9},
  header:{flexDirection:'row',alignItems:'center',paddingHorizontal:t.padX,paddingBottom:12,backgroundColor:t.bg,borderBottomWidth:1,borderBottomColor:t.divider},
  circle:{width:t.backButton,height:t.backButton,borderRadius:t.backButton/2,backgroundColor:t.cardBg,alignItems:'center',justifyContent:'center'},
  headerTitle:{marginLeft:t.backGap,fontFamily:font.appSemi,fontSize:t.titleSize,color:t.ink},
  card:{marginTop:t.cardTop,marginHorizontal:t.padX,borderRadius:t.cardRadius,backgroundColor:t.cardBg,paddingHorizontal:t.cardPadX,paddingTop:t.cardPadTop,paddingBottom:t.cardPadBottom},
  chip:{alignSelf:'flex-start',width:t.chipW,height:t.chipH,borderRadius:t.chipRadius,backgroundColor:t.tileBg,alignItems:'center',justifyContent:'center'},
  tile:{position:'absolute',right:t.cardPadX,top:t.cardPadTop,width:t.tile,height:t.tile,borderRadius:t.tileRadius,backgroundColor:t.tileBg,alignItems:'center',justifyContent:'center'},
  cardTitle:{marginTop:t.titleTop,fontFamily:font.appHeading,fontSize:t.cardTitleSize,color:t.ink},
  ref:{marginTop:t.refTop,fontFamily:font.appBody,fontSize:t.refSize,color:t.inkMuted},
  divider:{marginTop:t.dividerTop,height:1,backgroundColor:'#EDE9E3'},
  quoteState:{marginTop:t.rowTop,flexDirection:'row',alignItems:'center',gap:10},
  quoteStateText:{fontFamily:font.appBody,fontSize:t.rowSize,color:t.inkMuted},
  quoteError:{marginTop:t.rowTop},
  blocked:{marginTop:t.rowTop,gap:10},
  blockedRow:{flexDirection:'row',alignItems:'center',gap:10},
  blockedText:{flex:1,minWidth:0},
  blockedName:{fontFamily:font.appSemi,fontSize:t.rowSize,color:t.ink},
  blockedReason:{marginTop:2,fontFamily:font.appBody,fontSize:t.rowSize-1,lineHeight:17,color:t.inkMuted},
  blockedAction:{fontFamily:font.appSemi,fontSize:t.rowSize,color:t.brand,textDecorationLine:'underline'},
  blockedLinks:{flexDirection:'row',gap:18},
  row:{marginTop:t.rowTop,flexDirection:'row',alignItems:'center'},
  rowNext:{marginTop:t.rowGap},
  rowLabel:{flex:1,fontFamily:font.appBody,fontSize:t.rowSize,color:t.inkMuted},
  rowValue:{fontFamily:font.appSemi,fontSize:t.rowSize,color:t.ink},
  totalRow:{marginTop:t.totalTop,flexDirection:'row',alignItems:'center'},
  totalLabel:{flex:1,fontFamily:font.appSemi,fontSize:t.totalLabelSize,color:t.ink},
  totalValue:{fontFamily:font.appHeading,fontSize:t.totalValueSize,color:t.ink},
  note:{marginTop:t.noteTop,textAlign:'right',fontFamily:font.appBody,fontSize:t.noteSize,color:t.inkMuted},
  methodHead:{marginTop:t.methodTop,marginHorizontal:t.padX,flexDirection:'row',alignItems:'center'},
  methodLabel:{flex:1,fontFamily:font.appSemi,fontSize:t.methodLabelSize,letterSpacing:t.methodLabelSpacing,color:t.inkMuted},
  methods:{marginHorizontal:t.padX},
  secure:{marginTop:t.secureTop,marginHorizontal:t.padX,flexDirection:'row',justifyContent:'center'},
  secureText:{flex:1,marginLeft:t.secureGap,textAlign:'center',fontFamily:font.appBody,fontSize:t.secureSize,lineHeight:t.secureLine,color:t.inkMuted},
  test:{marginTop:10},
  scroll:{flex:1},
  bar:{backgroundColor:'#FFFFFE',paddingTop:t.barPadTop,paddingHorizontal:t.padX,borderTopWidth:1,borderTopColor:t.divider},
  failure:{marginBottom:10,borderRadius:10,backgroundColor:firInk.dangerSoft,padding:10},
  failureTitle:{fontFamily:font.appSemi,fontSize:12.5,lineHeight:18,color:firInk.danger},
  failureDetail:{marginTop:2,fontFamily:font.appBody,fontSize:12,lineHeight:17,color:firInk.danger},
  barRow:{flexDirection:'row',alignItems:'center'},
  barLabel:{flex:1,fontFamily:font.appBody,fontSize:t.barLabelSize,color:t.inkMuted},
  barAmount:{fontFamily:font.appHeading,fontSize:t.barAmountSize,color:t.ink},
  pay:{marginTop:t.payTop,height:t.payH,borderRadius:t.payRadius,backgroundColor:t.payBg,flexDirection:'row',alignItems:'center',justifyContent:'center'},
  payDisabled:{opacity:0.6},
  payText:{marginRight:t.payIconGap,fontFamily:font.appHeading,fontSize:t.paySize,color:ink.onBrand},
  payBusy:{marginLeft:10,marginRight:0},
});

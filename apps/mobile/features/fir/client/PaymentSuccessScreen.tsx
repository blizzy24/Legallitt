// C8b Payment Successful (design/client/fir-draft/F5-payment-success.png). The real
// FIR reference and amount; "Your FIR draft request has been submitted." (the
// design's "forensic analysis" is a copy slip). Start Tracking → C9. Home (Q3) and
// Back → Home, never back into payment. Nothing advances on a timer.
import {router,useLocalSearchParams} from 'expo-router';
import {Check,ChevronRight,Copy,FileText} from 'lucide-react-native';
import {Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import PayHeader from '../../../components/PayHeader';
import {colors,font,ink,paySuccess as s,scanPay,status} from '../../../constants/theme';
import {firHref} from '../flow';
import {useCaseRecord} from './api';
import {goHome,hashRef,money} from './format';
import {LoadingState,StatePanel,TestPaymentLabel,useCopy} from './ui';

const UNPAID=new Set(['draft','submitted','payment_pending']);

export default function FirPaymentSuccessScreen(){
  const {caseId}=useLocalSearchParams<{caseId?:string}>();
  const c=useCaseRecord(caseId),record=c.record;
  const clip=useCopy();
  const header=<PayHeader padX={scanPay.padX} title="Scan & Pay" subtitle="UPI Dynamic QR" intro="Scan the QR code using any UPI app to complete your payment." onBack={goHome}/>;

  if(c.loading&&!record)return <View style={styles.screen}>{header}<LoadingState label="Confirming your payment…"/></View>;
  if(!record)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    <StatePanel tone="error" title="We couldn’t load your payment" body={c.error||'Something went wrong loading your request.'}
      actions={[...(caseId?[{label:'Try again',onPress:c.reload,primary:true}]:[]),{label:'Go to Home',onPress:goHome}]}/>
  </ScrollView></View>;
  if(UNPAID.has(record.status)||record.status==='cancelled')return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    {record.status==='cancelled'
      ?<StatePanel title="This request was cancelled" body={`Request ${hashRef(record.reference)} was cancelled.`} actions={[{label:'Go to Home',onPress:goHome,primary:true}]}/>
      :<StatePanel title="We haven’t received this payment" body={`Request ${hashRef(record.reference)} is still waiting for payment. You haven’t been charged.`}
        actions={[{label:'Back to payment',onPress:()=>router.replace(firHref('payment',record.id)),primary:true},{label:'Go to Home',onPress:goHome}]}/>}
  </ScrollView></View>;

  const total=record.client_fees?.total_paise;
  return <View style={styles.screen}>
    {header}
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.idCard}>
        <FileText size={s.idIcon} color={colors.brand} strokeWidth={1.5}/>
        <View style={styles.idText}>
          <Text style={styles.idLabel}>Request ID</Text>
          <Text style={styles.idValue} selectable>{hashRef(record.reference)}</Text>
        </View>
        {clip.state!=='idle'&&<Text accessibilityLiveRegion="polite" style={[styles.copied,clip.state==='failed'&&styles.copyFailed]}>{clip.label}</Text>}
        <Pressable onPress={()=>void clip.copy(record.reference)} accessibilityRole="button" accessibilityLabel="Copy request ID" hitSlop={10}>
          <Copy size={s.copyIcon} color={colors.brand}/>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.headRow}>
          <View style={styles.disc}><Check size={s.discIcon} color={ink.onBrand} strokeWidth={3}/></View>
          <View style={styles.headText}>
            <Text style={styles.title}>Payment Successful</Text>
            <Text style={styles.sub}>{total?`Your payment of ${money(total)} has been received.`:'Your payment has been received.'}</Text>
          </View>
        </View>
        <Text style={styles.note}>Your FIR draft request has been submitted.</Text>
        {record.client_fees?.simulated&&<TestPaymentLabel text="Test payment, no money was charged" style={styles.test}/>}
        <Pressable accessibilityRole="button" onPress={()=>router.replace(firHref('submitted',record.id))} style={({pressed})=>[styles.button,pressed&&styles.pressed]}>
          <Text style={styles.buttonText}>Start Tracking</Text>
          <ChevronRight size={s.buttonIcon} color={ink.onBrand}/>
        </Pressable>
        {/* Q3: the screen stays until the client taps; Home sits under Start Tracking. */}
        <Pressable accessibilityRole="button" onPress={goHome} style={({pressed})=>[styles.button,styles.homeButton,pressed&&styles.pressed]}>
          <Text style={[styles.buttonText,styles.homeButtonText]}>Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  </View>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.appBg},
  content:{paddingHorizontal:scanPay.padX,paddingTop:s.idGap,paddingBottom:40},
  idCard:{height:s.idH,borderRadius:s.idRadius,backgroundColor:colors.card,borderWidth:1,borderColor:colors.borderMuted,paddingHorizontal:s.idPadX,flexDirection:'row',alignItems:'center'},
  idText:{flex:1,minWidth:0,marginLeft:s.idTextGap},
  idLabel:{fontFamily:font.appBody,fontSize:s.idLabelSize,color:s.idLabel},
  idValue:{marginTop:s.idLineGap,fontFamily:font.appHeading,fontSize:s.idValueSize,color:colors.textPrimary},
  copied:{marginRight:8,fontFamily:font.appSemi,fontSize:11.5,color:colors.textBody},
  copyFailed:{color:'#9C2929'},
  card:{marginTop:s.cardGap,borderRadius:s.cardRadius,backgroundColor:s.cardBg,borderWidth:1,borderColor:s.cardBorder,padding:s.cardPad,paddingBottom:s.cardPadBottom},
  headRow:{flexDirection:'row',alignItems:'center'},
  disc:{width:s.disc,height:s.disc,borderRadius:s.disc/2,backgroundColor:status.active,alignItems:'center',justifyContent:'center',marginRight:s.discTextGap},
  headText:{flex:1,minWidth:0},
  title:{fontFamily:font.appHeading,fontSize:s.titleSize,color:colors.textPrimary},
  sub:{marginTop:s.lineGap,fontFamily:font.appBody,fontSize:s.subSize,color:colors.textBody},
  note:{marginTop:s.noteGap,fontFamily:font.appBody,fontSize:s.noteSize,color:s.note},
  test:{marginTop:10,alignSelf:'flex-start'},
  button:{marginTop:s.buttonGap,alignSelf:'center',height:s.buttonH,borderRadius:s.buttonRadius,paddingHorizontal:s.buttonPadX,backgroundColor:colors.brand,flexDirection:'row',alignItems:'center',gap:s.buttonIconGap},
  pressed:{opacity:0.85},
  buttonText:{fontFamily:font.appSemi,fontSize:s.buttonTextSize,color:ink.onBrand},
  homeButton:{marginTop:8,backgroundColor:'transparent',borderWidth:1,borderColor:colors.brand},
  homeButtonText:{color:colors.textPrimary},
});

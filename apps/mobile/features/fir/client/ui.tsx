// Shared state views for the client FIR screens (C8–C14): loading, error, empty and
// "not at this step" panels, honest Copy feedback, and the test-payment label.
import {useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
import {Pressable,StyleSheet,Text,View,type StyleProp,type ViewStyle} from 'react-native';
import {AlertCircle,FlaskConical,Info} from 'lucide-react-native';
import Spinner from '../../../components/Spinner';
import {colors,firResult as t,font,ink} from '../../../constants/theme';
import {copyText} from '../flow';
import {firInk,firTestLabel} from './tokens';

export type CopyState='idle'|'copied'|'failed';
/** Copy with a truthful result: "Copied" only when the clipboard accepted it. */
export function useCopy(){
  const [state,setState]=useState<CopyState>('idle');
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  const copy=useCallback(async(text:string)=>{
    const ok=await copyText(text);
    setState(ok?'copied':'failed');
    if(timer.current)clearTimeout(timer.current);
    // Only the feedback label resets; nothing navigates.
    timer.current=setTimeout(()=>setState('idle'),2500);
  },[]);
  return {state,copy,label:state==='copied'?'Copied':state==='failed'?'Couldn’t copy':'Copy'};
}

export function LoadingState({label='Loading your FIR request…',style}:{label?:string;style?:StyleProp<ViewStyle>}){
  return <View style={[styles.loading,style]} accessibilityRole="progressbar" accessibilityLabel={label}>
    <Spinner/><Text role="status" style={styles.loadingText}>{label}</Text>
  </View>;
}

type Action={label:string;onPress():void;primary?:boolean;disabled?:boolean};
/** A card that says what is (or isn't) here and what the person can do next. */
export function StatePanel({tone='info',title,body,actions=[],children,style}:{tone?:'info'|'error';title:string;body?:string;actions?:Action[];children?:ReactNode;style?:StyleProp<ViewStyle>}){
  const Icon=tone==='error'?AlertCircle:Info;
  return <View style={[styles.panel,style]} accessibilityRole={tone==='error'?'alert':undefined}>
    <View style={styles.panelHead}>
      <Icon size={18} color={tone==='error'?firInk.danger:colors.textBody}/>
      <Text style={styles.panelTitle}>{title}</Text>
    </View>
    {!!body&&<Text style={styles.panelBody}>{body}</Text>}
    {children}
    {actions.map(a=><Pressable key={a.label} accessibilityRole="button" disabled={a.disabled} accessibilityState={{disabled:!!a.disabled}} onPress={a.onPress}
      style={({pressed})=>[styles.panelButton,a.primary?styles.panelPrimary:styles.panelSecondary,a.disabled&&styles.disabled,pressed&&styles.pressed]}>
      <Text style={[styles.panelButtonText,a.primary&&styles.panelPrimaryText]}>{a.label}</Text>
    </Pressable>)}
  </View>;
}

/** An error next to the thing that failed, with an optional retry. */
export function InlineError({message,retryLabel='Try again',onRetry,style}:{message:string;retryLabel?:string;onRetry?:()=>void;style?:StyleProp<ViewStyle>}){
  if(!message)return null;
  return <View style={[styles.inline,style]} accessibilityRole="alert">
    <AlertCircle size={15} color={firInk.danger} style={styles.inlineIcon}/>
    <Text style={styles.inlineText}>{message}{onRetry&&<Text accessibilityRole="button" onPress={onRetry} style={styles.inlineRetry}>{`  ${retryLabel}`}</Text>}</Text>
  </View>;
}

/** §2.11: payments are simulated until Razorpay is connected. */
export function TestPaymentLabel({text='Test payment, no money is charged',style}:{text?:string;style?:StyleProp<ViewStyle>}){
  return <View style={[styles.test,style]}>
    <FlaskConical size={12} color={firTestLabel.text}/>
    <Text style={styles.testText}>{text}</Text>
  </View>;
}

const styles=StyleSheet.create({
  loading:{paddingVertical:40,alignItems:'center',justifyContent:'center',gap:12},
  loadingText:{fontFamily:font.appBody,fontSize:14,color:colors.textBody,textAlign:'center'},
  panel:{marginTop:t.cardGap,borderRadius:t.cardRadius,backgroundColor:colors.card,padding:t.cardPad,borderWidth:1,borderColor:firInk.border},
  panelHead:{flexDirection:'row',alignItems:'center',gap:8},
  panelTitle:{flex:1,minWidth:0,fontFamily:font.appHeading,fontSize:16,color:colors.textPrimary},
  panelBody:{marginTop:8,fontFamily:font.appBody,fontSize:13.5,lineHeight:20,color:colors.textBody},
  panelButton:{marginTop:12,minHeight:44,borderRadius:10,alignItems:'center',justifyContent:'center',paddingHorizontal:14},
  panelPrimary:{backgroundColor:colors.brand},
  panelSecondary:{backgroundColor:t.buttonLightBg},
  panelButtonText:{fontFamily:font.appSemi,fontSize:14,color:colors.textPrimary},
  panelPrimaryText:{color:ink.onBrand},
  disabled:{opacity:0.5},
  pressed:{opacity:0.85},
  inline:{flexDirection:'row',alignItems:'flex-start',borderRadius:10,backgroundColor:firInk.dangerSoft,padding:10},
  inlineIcon:{marginTop:2},
  inlineText:{flex:1,minWidth:0,marginLeft:8,fontFamily:font.appBody,fontSize:12.5,lineHeight:18,color:firInk.danger},
  inlineRetry:{fontFamily:font.appSemi,textDecorationLine:'underline'},
  test:{alignSelf:'center',flexDirection:'row',alignItems:'center',gap:6,minHeight:firTestLabel.height,borderRadius:firTestLabel.radius,paddingHorizontal:firTestLabel.padX,
    backgroundColor:firTestLabel.bg,borderWidth:1,borderColor:firTestLabel.border},
  testText:{fontFamily:font.appSemi,fontSize:firTestLabel.size,color:firTestLabel.text},
});

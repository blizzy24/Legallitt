import {useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import PaymentMethods,{DEFAULT_PAYMENT_SELECTION,type PaymentSelection} from '../../components/PaymentMethods';
import {TestPaymentLabel} from '../fir/client/ui';
import {colors,font} from '../../constants/theme';

/** Shared method selection and payment action; callers own their quote and capture API. */
export function CheckoutControls({amount,busy=false,disabled=false,onPay,value,onChange,simulated=true}:{amount:string;busy?:boolean;disabled?:boolean;onPay(selection:PaymentSelection):void;value?:PaymentSelection;onChange?(value:PaymentSelection):void;simulated?:boolean}){
 const [local,setLocal]=useState<PaymentSelection>(DEFAULT_PAYMENT_SELECTION),selection=value??local;
 return <View style={{gap:18}}><Text style={styles.label}>Select payment method</Text><PaymentMethods value={selection} onChange={onChange??setLocal} disabled={busy}/>{simulated&&<TestPaymentLabel text="Test payment only. No money will be charged."/>}<View style={styles.row}><Text style={styles.label}>Amount to pay</Text><Text style={styles.label}>{amount}</Text></View><Pressable accessibilityRole="button" disabled={disabled||busy} accessibilityState={{disabled:disabled||busy}} onPress={()=>onPay(selection)} style={[styles.button,(disabled||busy)&&{opacity:.45}]}><Text style={styles.buttonText}>{busy?'Processing payment…':'Pay →'}</Text></Pressable></View>;
}
const styles=StyleSheet.create({label:{fontFamily:font.appSemi,fontSize:16,color:colors.textPrimary},row:{flexDirection:'row',justifyContent:'space-between',gap:12},button:{backgroundColor:colors.brand,padding:16,borderRadius:14,alignItems:'center'},buttonText:{fontFamily:font.appSemi,fontSize:16,color:'#fff'}});

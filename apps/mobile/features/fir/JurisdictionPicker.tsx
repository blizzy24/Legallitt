import {useState} from 'react';
import {Modal,Pressable,ScrollView,Text,TextInput,View} from 'react-native';
import {ChevronDown} from 'lucide-react-native';
import {colors,firStep,font} from '../../constants/theme';
import {s} from './shared';
export function JurisdictionPicker({label,value,options,onChange,disabled=false}:{label:string;value:string;options:{code:string;name:string}[];onChange(code:string):void;disabled?:boolean}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const found=options.filter(o=>o.name.toLowerCase().includes(query.trim().toLowerCase()));
 return <><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={()=>{setQuery('');setOpen(true);}} style={{height:firStep.fieldHeight,borderRadius:firStep.fieldRadius,backgroundColor:firStep.fieldBg,paddingHorizontal:firStep.fieldPadX,flexDirection:'row',alignItems:'center',opacity:disabled?0.6:1}}><Text style={{flex:1,fontFamily:font.appBody,fontSize:firStep.selectSize,color:value?firStep.fieldText:firStep.placeholder}}>{value||`[ Select ${label.toLowerCase()} ]`}</Text><ChevronDown size={18} color={colors.textBody}/></Pressable>
 {disabled&&<Text style={s.muted}>Choose a state first.</Text>}
 <Modal visible={open} transparent animationType="slide" onRequestClose={()=>setOpen(false)}><View style={{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.35)'}}><View style={{backgroundColor:colors.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:22,maxHeight:'80%',gap:12}}><Text style={s.heading}>Select {label.toLowerCase()}</Text><TextInput accessibilityLabel={`Search ${label.toLowerCase()}`} placeholder={`Search ${label.toLowerCase()}`} value={query} onChangeText={setQuery} style={s.input}/><ScrollView keyboardShouldPersistTaps="handled">{found.map(o=><Pressable key={o.code} accessibilityRole="button" accessibilityLabel={o.name} onPress={()=>{onChange(o.code);setOpen(false);}} style={{paddingVertical:16}}><Text style={s.body}>{o.name}</Text></Pressable>)}{!found.length&&<Text style={s.body}>No matching {label.toLowerCase()}. Try another search.</Text>}</ScrollView><Pressable accessibilityRole="button" onPress={()=>setOpen(false)}><Text style={s.label}>Close</Text></Pressable></View></View></Modal></>;
}

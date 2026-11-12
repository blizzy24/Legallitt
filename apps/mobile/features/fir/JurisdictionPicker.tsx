import {useState} from 'react';
import {Modal,Pressable,ScrollView,Text,TextInput,View} from 'react-native';
import {ChevronDown} from 'lucide-react-native';
import {colors,firStep,font} from '../../constants/theme';
import {s} from './shared';

type Option={code:string;name:string;hint?:string};

/**
 * Searchable dropdown in the FIR field style (design 42 / F0b). Also used by the
 * report and consultation intakes, so every addition is optional.
 */
export function JurisdictionPicker({label,value,options,onChange,disabled=false,disabledHint,placeholder,allowCustom,onCustom,invalid=false}:{
 label:string;value:string;options:Option[];onChange(code:string):void;disabled?:boolean;
 /** Shown under a disabled picker; defaults to "Choose a state first." */
 disabledHint?:string;
 /** Replaces "[ Select <label> ]". */
 placeholder?:string;
 /** Offers "Use “<typed text>”" when the search has no exact match (e.g. a city that isn't listed). */
 allowCustom?:boolean;onCustom?(text:string):void;
 /** Red outline after a failed Continue. */
 invalid?:boolean;
}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const q=query.trim().toLowerCase();
 const found=(q?options.filter(o=>o.name.toLowerCase().includes(q)||o.hint?.toLowerCase().includes(q)):options).slice(0,300);
 const custom=allowCustom&&onCustom&&query.trim()&&!options.some(o=>o.name.toLowerCase()===q);
 return <><Pressable accessibilityRole="button" accessibilityLabel={value?`${label}: ${value}`:label} accessibilityState={{disabled}} disabled={disabled} onPress={()=>{setQuery('');setOpen(true);}} style={{height:firStep.fieldHeight,borderRadius:firStep.fieldRadius,backgroundColor:firStep.fieldBg,paddingHorizontal:firStep.fieldPadX,flexDirection:'row',alignItems:'center',opacity:disabled?0.6:1,borderWidth:invalid?1:0,borderColor:'#B3261E'}}><Text numberOfLines={1} style={{flex:1,fontFamily:font.appBody,fontSize:firStep.selectSize,color:value?firStep.fieldText:firStep.placeholder}}>{value||placeholder||`[ Select ${label.toLowerCase()} ]`}</Text><ChevronDown size={18} color={colors.textBody}/></Pressable>
 {disabled&&<Text style={[s.muted,{marginTop:6}]}>{disabledHint??'Choose a state first.'}</Text>}
 <Modal visible={open} transparent animationType="slide" onRequestClose={()=>setOpen(false)}><View style={{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.35)'}}><View style={{backgroundColor:colors.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:22,maxHeight:'80%',gap:12}}><Text style={s.heading}>Select {label.toLowerCase()}</Text><TextInput accessibilityLabel={`Search ${label.toLowerCase()}`} placeholder={`Search ${label.toLowerCase()}`} value={query} onChangeText={setQuery} style={s.input}/><ScrollView keyboardShouldPersistTaps="handled">
  {custom&&<Pressable accessibilityRole="button" accessibilityLabel={`Use ${query.trim()}`} onPress={()=>{onCustom!(query.trim());setOpen(false);}} style={{paddingVertical:16}}><Text style={[s.body,{color:colors.textPrimary}]}>Use “{query.trim()}”</Text></Pressable>}
  {found.map(o=><Pressable key={o.code} accessibilityRole="button" accessibilityLabel={o.hint?`${o.name}, ${o.hint}`:o.name} onPress={()=>{onChange(o.code);setOpen(false);}} style={{paddingVertical:14}}><Text style={s.body}>{o.name}{o.hint?<Text style={s.muted}>{'  '}{o.hint}</Text>:null}</Text></Pressable>)}
  {!found.length&&!custom&&<Text style={s.body}>No matching {label.toLowerCase()}. Try another search.</Text>}
  {!q&&options.length>found.length&&<Text style={s.muted}>Type to search all {options.length} options.</Text>}
 </ScrollView><Pressable accessibilityRole="button" onPress={()=>setOpen(false)} style={{paddingVertical:8}}><Text style={s.label}>Close</Text></Pressable></View></View></Modal></>;
}

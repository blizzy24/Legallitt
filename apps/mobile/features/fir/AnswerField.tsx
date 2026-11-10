import {useEffect,useRef,useState} from 'react';
import {Pressable,Text,TextInput,View} from 'react-native';
import type {Answer} from '@legalitt/shared';
import {s} from './shared';

export function AnswerField({label,value,onChange,numeric=false,disabled=false}:{label:string;value:Answer<string|number>|null|undefined;onChange(value:Answer<string|number>|null):void;numeric?:boolean;disabled?:boolean}){
 const [raw,setRaw]=useState(value?.status==='provided'?String(value.value):''),[invalid,setInvalid]=useState(false);
 const invalidInput=useRef(false);
 useEffect(()=>{if(invalidInput.current&&value===null)return;setRaw(value?.status==='provided'?String(value.value):'');setInvalid(false);},[value]);
 const select=(answer:Answer<string|number>|null)=>{invalidInput.current=false;setInvalid(false);setRaw('');onChange(answer);};
 const change=(input:string)=>{
  setRaw(input);
  if(!input.trim()){invalidInput.current=false;setInvalid(false);onChange(null);return;}
  if(numeric&&(!/^\d+$/.test(input)||Number(input)>130)){invalidInput.current=true;setInvalid(true);onChange(null);return;}
  invalidInput.current=false;setInvalid(false);onChange({status:'provided',value:numeric?Number(input):input});
 };
 return <View style={{gap:7,marginVertical:8}}><Text style={s.label}>{label}</Text>
  <TextInput accessibilityLabel={label} value={raw} editable={!disabled} onChangeText={change} keyboardType={numeric?'number-pad':'default'} style={s.input}/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{(['unknown','not_applicable']as const).map(status=><Pressable key={status} accessibilityRole="radio" accessibilityLabel={`${label}: ${status==='unknown'?'Unknown':'Not applicable'}`} accessibilityState={{checked:value?.status===status,disabled}} disabled={disabled} onPress={()=>select({status})}><Text style={s.body}>{value?.status===status?'◉':'○'} {status==='unknown'?'Unknown':'Not applicable'}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel={`Clear ${label}`} disabled={disabled} onPress={()=>select(null)}><Text style={s.muted}>Clear answer</Text></Pressable></View>
  {invalid&&<Text role="alert" style={s.error}>Enter a whole age from 0 to 130.</Text>}
  {!value&&!invalid&&<Text style={s.muted}>Not answered yet.</Text>}
 </View>;
}

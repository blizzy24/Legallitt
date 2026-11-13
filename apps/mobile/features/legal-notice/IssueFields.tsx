import {useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View,type TextInputProps} from 'react-native';
import {Calendar} from 'lucide-react-native';
import {noticeCalendarDate} from '@legalitt/shared';
import DatePickerSheet from '../../components/DatePickerSheet';
import {colors,font} from '../../constants/theme';

export function IssueField({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}){
  return <View style={s.field}><Text style={s.label}>{label}{required?' *':''}</Text>{children}</View>;
}
export function IssueText({label,required,...props}:TextInputProps&{label:string;required?:boolean}){
  return <IssueField label={label} required={required}><TextInput {...props} accessibilityLabel={label} style={[s.input,props.multiline&&{height:140,textAlignVertical:'top'}]}/></IssueField>;
}
export function IssueAmount({label,value,onChange,editable,required}:{label:string;value?:string;onChange(value?:string):void;editable:boolean;required?:boolean}){
  const [editing,setEditing]=useState(false),[text,setText]=useState('');
  const display=value===undefined?'':(Number(value)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
  return <IssueField label={label} required={required}><View style={s.amount}><Text style={s.label}>₹</Text><TextInput accessibilityLabel={label} editable={editable} keyboardType="decimal-pad" value={editing?text:display} style={[s.input,{flex:1,paddingLeft:6}]} onFocus={()=>{setText(value===undefined?'':String(Number(value)/100));setEditing(true);}} onBlur={()=>setEditing(false)} onChangeText={next=>{
    const clean=next.replace(/[₹,\s]/g,'');
    if(!/^\d*(\.\d{0,2})?$/.test(clean))return;
    setText(clean);onChange(clean&&clean!=='.'?String(Math.round(Number(clean)*100)):undefined);
  }}/></View></IssueField>;
}
export function IssueDate({label,value,onChange,editable,required}:{label:string;value?:string;onChange(value:string):void;editable:boolean;required?:boolean}){
  const [open,setOpen]=useState(false);
  const date=value&&/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(Number(value.slice(0,4)),Number(value.slice(5,7))-1,Number(value.slice(8,10))):undefined;
  return <IssueField label={label} required={required}><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled:!editable}} disabled={!editable} onPress={()=>setOpen(true)} style={s.date}><Calendar color={colors.brand} size={20}/><Text style={s.label}>{noticeCalendarDate(value)||'Choose date'}</Text></Pressable>{open&&<DatePickerSheet visible value={date} onClose={()=>setOpen(false)} onPick={picked=>onChange(`${picked.getFullYear()}-${String(picked.getMonth()+1).padStart(2,'0')}-${String(picked.getDate()).padStart(2,'0')}`)}/>}</IssueField>;
}
const s=StyleSheet.create({field:{gap:7},label:{fontFamily:font.appBody,fontSize:14,color:colors.textPrimary},input:{backgroundColor:'#F4F1EB',borderRadius:10,padding:12,fontFamily:font.appBody,fontSize:15,color:colors.textPrimary,minHeight:44},amount:{flexDirection:'row',alignItems:'center',backgroundColor:'#F4F1EB',borderRadius:10,paddingLeft:12},date:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#F4F1EB',borderRadius:10,padding:12,minHeight:44}});

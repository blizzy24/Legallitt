import {useEffect,useState} from 'react';
import {Text} from 'react-native';
import {backend} from '../../lib/auth';
import {DateField,Choice,Row,s} from '../court/ui';
export function RequestedTime({value,onChange}:{value:string;onChange(value:string):void}){
 const [day,setDay]=useState(new Date(Date.now()+86400000).toISOString().slice(0,10)),[slots,setSlots]=useState<string[]>(),[error,setError]=useState('');
 useEffect(()=>{let alive=true;setSlots(undefined);setError('');void backend.request<{items:{scheduled_at:string}[]}>(`/consultations/legal-advice/slots?date=${day}`).then(r=>{if(alive)setSlots(r.items.map(i=>i.scheduled_at));}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[day]);
 return <><DateField label="Proposed consultation date" value={day} onChange={v=>{if(v){setDay(v);onChange('');}}} editable/>{error&&<Text accessibilityRole="alert" style={s.body}>{error}</Text>}{!slots&&!error&&<Text style={s.body}>Loading requested times…</Text>}{slots?.length===0&&<Text style={s.body}>No requested times on this date. Choose another working day.</Text>}<Row>{slots?.map(at=><Choice key={at} label={new Date(at).toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'numeric',minute:'2-digit'})} selected={value===at} onPress={()=>onChange(at)}/>)}</Row></>;
}

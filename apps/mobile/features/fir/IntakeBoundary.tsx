import {useState,type ReactNode} from 'react';
import {router,useLocalSearchParams} from 'expo-router';
import {Pressable,Text,View} from 'react-native';
import {useFir} from '../../context/fir';
import {DATA_SOURCE} from '../../lib/data-source';
import FirShell from '../../components/FirShell';
import FirClient from './FirClient';
import {s,Button} from './shared';
export function IntakeBoundary({step,title,children}:{step:number;title:string;children:ReactNode}) {
 const m=useFir(),{caseId}=useLocalSearchParams<{caseId?:string}>();
 if(DATA_SOURCE!=='api')return children;
 if(m.loading||caseId&&m.record?.id!==caseId&&!m.error)return <FirShell step={step} title={title}><Text role="status" style={s.body}>Loading saved FIR intake…</Text></FirShell>;
 if(!m.record||!caseId)return <FirShell step={step} title={title}>{m.error?<><Text role="alert" style={s.error}>{m.error}</Text><Button title="Retry loading intake" onPress={m.retry}/></>:<><Text style={s.body}>Start a FIR request to save your intake.</Text><Button title="Start FIR Request" disabled={m.busy} onPress={()=>void m.start()}/></>}<Button title="My Cases" onPress={()=>router.push('/cases')}/></FirShell>;
 if(m.record.status!=='draft')return <FirClient/>;
 return children;
}
export function IntakeStatus(){
 const m=useFir(),[confirm,setConfirm]=useState(false);
 return <View style={{gap:8,marginBottom:12}}>
  <Text role="status" style={s.muted}>{DATA_SOURCE==='api'?`${m.record?.reference??''} · ${m.saveState}`:'Preview — entries are not saved to a case.'}</Text>
  {m.error&&<View><Text accessibilityRole="alert" style={s.error}>{m.error}</Text>{!m.conflict&&m.saveState==='Not saved'&&<Button title="Retry save" disabled={m.busy} onPress={m.retry}/>}</View>}
  {m.conflict&&(!confirm?<Button title="Reload saved intake…" onPress={()=>setConfirm(true)}/>:<><Text style={s.error}>Reloading replaces the unsaved entries shown here with the saved case. Copy any entries you want to retain first.</Text><Button title="Reload and replace unsaved entries" onPress={()=>{setConfirm(false);void m.reload();}}/><Button title="Keep my entries on screen" onPress={()=>setConfirm(false)}/></>)}
  {Object.values(m.errors).map((error,i)=><Text key={i} accessibilityRole="alert" style={s.error}>{error}</Text>)}
 </View>;
}
export function IntakeError({field}:{field:string}){const {errors}=useFir();return errors[field]?<Text accessibilityRole="alert" style={s.error}>{errors[field]}</Text>:null;}

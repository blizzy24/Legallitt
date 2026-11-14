import {useEffect,useState,type ReactNode} from 'react';
import {Text} from 'react-native';
import {backend} from '../../lib/auth';
import {Screen,Card,Button,Link,s} from '../court/ui';
import {router} from 'expo-router';
import {AdviceBookingStart,AdviceClient} from './Client';
import {AdviceAdvocate} from './Advocate';
/** Legacy paid cases retain their existing renderer and handlers. New bookings
 * are identified by their own table; a transient error never selects fixtures. */
export function AdviceGate({id,step='index',advocate=false,legacy,query}:{id?:string;step?:string;advocate?:boolean;legacy?:ReactNode;query?:Readonly<Record<string,unknown>>}){
 const [generation,setGeneration]=useState<'loading'|'new'|'legacy'>(id?'loading':'new');
 useEffect(()=>{let alive=true;if(!id){setGeneration('new');return;}setGeneration('loading');void backend.request(`/legal-advice/${id}`).then(()=>{if(alive)setGeneration('new');}).catch(e=>{if(alive)setGeneration(e?.status===404?'legacy':'new');});return()=>{alive=false;};},[id]);
 if(generation==='loading')return <Screen title="Legal Advice"><Text style={s.body}>Loading your saved consultation…</Text></Screen>;
 if(generation==='legacy'&&legacy)return <>{legacy}</>;
 if(advocate&&id)return <AdviceAdvocate caseId={id} step={step}/>;
 if(!id&&!['index','info','advocates','experience','choose'].includes(step))return <Screen title="Legal Advice"><Card title="No consultation selected"><Text style={s.body}>Start a new request or resume a saved consultation from My Cases.</Text><Button onPress={()=>router.push('/legal-advice')}>Start a consultation request</Button><Link onPress={()=>router.navigate('/cases')}>My Cases</Link></Card></Screen>;
 return id?<AdviceClient caseId={id} step={step} query={query}/>:<AdviceBookingStart step={step} query={query}/>;
}

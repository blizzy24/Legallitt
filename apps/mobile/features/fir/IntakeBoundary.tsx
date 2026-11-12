import {useState,type ReactNode} from 'react';
import {router,useLocalSearchParams,type Href} from 'expo-router';
import {StyleSheet,Text,View} from 'react-native';
import {useFir} from '../../context/fir';
import {DATA_SOURCE} from '../../lib/data-source';
import FirShell from '../../components/FirShell';
import {colors,font} from '../../constants/theme';
import {FIR_STEP_NAMES,firErrorStep} from './intake/draft';
import {InlineError,LoadingPanel,NoticePanel} from './intake/ui';

/**
 * Loading, error and "already submitted" states around each FIR step. The step
 * itself renders only once its saved request is loaded and still a draft.
 */
export function IntakeBoundary({step,title,children}:{step:number;title:string;children:ReactNode}) {
 const m=useFir(),{caseId}=useLocalSearchParams<{caseId?:string}>();
 if(DATA_SOURCE!=='api')return children;
 if(m.loading||caseId&&m.record?.id!==caseId&&!m.error)return <FirShell step={step} title={title}><LoadingPanel label="Loading your saved request…"/></FirShell>;
 if(!caseId)return <FirShell step={step} title={title}>
  <NoticePanel title="Start your FIR Draft request" body="Your answers are saved to a request as you go, so you can leave and continue later. Open your request to begin."
   actions={[{label:m.busy?'Opening your request…':'Open My Request',primary:true,disabled:m.busy,onPress:()=>void m.start()},{label:'Back to FIR Draft Service',onPress:()=>router.replace('/fir')}]}/>
  <InlineError text={m.error}/>
 </FirShell>;
 if(!m.record)return <FirShell step={step} title={title}>
  <NoticePanel tone="error" title="Your request couldn’t be loaded" body={m.error||'Check your connection and try again.'}
   actions={[{label:'Try Again',primary:true,onPress:m.retry},{label:'My Requests',onPress:()=>router.push('/cases')}]}/>
 </FirShell>;
 if(m.record.status!=='draft'){
  const unpaid=['submitted','payment_pending'].includes(m.record.status);
  return <FirShell step={step} title={title}>
   <NoticePanel title="This request has been submitted" body={`${m.record.reference} can no longer be edited here.${unpaid?' Complete the payment to send it to the drafting team.':' You can follow its progress on the status screen.'}`}
    actions={[unpaid?{label:'Complete Payment',primary:true,onPress:()=>router.replace(`/fir/payment?caseId=${encodeURIComponent(m.record!.id)}` as Href)}:{label:'Track Request',primary:true,onPress:()=>router.replace(`/fir/status?caseId=${encodeURIComponent(m.record!.id)}` as Href)},{label:'My Requests',onPress:()=>router.push('/cases')}]}/>
  </FirShell>;
 }
 return children;
}

/**
 * Save state for the request (reference · Saved / Saving… / Not saved), save
 * errors with Retry, the 409 reload choice, and a pointer to any earlier step
 * whose answers still need attention.
 */
export function IntakeStatus({step}:{step?:number}){
 const m=useFir(),[confirm,setConfirm]=useState(false);
 const earlier=step?[...new Set(Object.keys(m.errors).map(firErrorStep).filter(n=>n<step))].sort():[];
 if(DATA_SOURCE!=='api')return <Text role="status" style={styles.muted}>Preview — entries are not saved to a request.</Text>;
 return <View style={styles.wrap}>
  <Text role="status" style={styles.muted}>{[m.record?.reference,m.saveState].filter(Boolean).join(' · ')}</Text>
  {m.error&&m.saveState==='Not saved'&&!m.conflict?<NoticePanel tone="error" body={`Your latest changes aren’t saved yet. ${m.error}`} actions={[{label:'Retry Saving',primary:true,disabled:m.busy,onPress:m.retry}]}/>:null}
  {m.conflict?(!confirm
   ?<NoticePanel tone="error" body="This request was changed somewhere else, so your latest changes weren’t saved." actions={[{label:'Reload Saved Request…',onPress:()=>setConfirm(true)}]}/>
   :<NoticePanel tone="error" body="Reloading replaces the unsaved entries on this screen with the saved request. Copy anything you want to keep first."
     actions={[{label:'Reload and Replace',primary:true,onPress:()=>{setConfirm(false);void m.reload();}},{label:'Keep My Entries on Screen',onPress:()=>setConfirm(false)}]}/>):null}
  {earlier.map(n=><NoticePanel key={n} tone="error" body={`Some answers in Step ${n} (${FIR_STEP_NAMES[n-1]}) need attention before you can continue.`} actions={[{label:`Go to Step ${n}`,onPress:()=>void m.go(n,step===5||m.returnTo?{returnTo:'review'}:{})}]}/>)}
 </View>;
}
export function IntakeError({field}:{field:string}){const {errors}=useFir();return <InlineError text={errors[field]}/>;}

const styles=StyleSheet.create({
 wrap:{marginBottom:12},
 muted:{fontFamily:font.appBody,fontSize:12,lineHeight:18,color:colors.textBody,marginBottom:4},
});

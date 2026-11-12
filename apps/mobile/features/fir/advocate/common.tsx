// Shared pieces for the advocate FIR screens A2–A7 (docs/flows/FIR-DRAFT-FLOW.md §2).
// Every screen reads real data: GET /fir/:id/flow (useFirFlow), GET /cases/:id for the
// client's filing and documents, and GET /fir/:id/draft-context for the editor.
import {useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
import {ActivityIndicator,KeyboardAvoidingView,Linking,Modal,Platform,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {router,useLocalSearchParams,type Href} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import {advocateFirPath,DOCUMENT_MAX_BYTES,FIR_UPLOAD_SLOTS,FirIntakeSchema,maskedIdentity,type ApiCase,type ApiDocument,type FirAdvocateScreen,type FirIntake,type FirStageView} from '@legalitt/shared';
import {backend} from '../../../lib/auth';
import {colors,font,ink,status} from '../../../constants/theme';
import {formatDate,formatTime,formatSize} from '../flow';

/** Documents carry the FIR slot label and the identity's last four digits (flow C6). */
export type FirDoc = ApiDocument & {identity_last4?: string | null; slot_label?: string | null};
export type FirRecord = Omit<ApiCase,'documents'> & {documents?: FirDoc[]};

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** The case ID from ?caseId=, or from /advocate/fir/<uuid>. */
export function useAdvocateCaseId(){
  const p=useLocalSearchParams<{caseId?:string;id?:string}>();
  const raw=typeof p.caseId==='string'&&p.caseId?p.caseId:typeof p.id==='string'&&UUID.test(p.id)?p.id:undefined;
  return raw;
}
export const firRoute=(caseId:string,screen:FirAdvocateScreen)=>advocateFirPath(caseId,screen) as Href;
export const compactReviewRoute=(caseId:string)=>`/advocate/fir/review-compact?caseId=${encodeURIComponent(caseId)}` as Href;
/** A1. Returns to the cases list if it is in the history, otherwise opens it. */
export const toCases=()=>router.dismissTo('/matters' as Href);

/** GET /cases/:id without polling. A failed reload keeps the last good record on screen. */
export function useFirRecord(caseId?:string){
  const [record,setRecord]=useState<FirRecord|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(!!caseId),[revision,setRevision]=useState(0);
  const reload=useCallback(()=>setRevision(n=>n+1),[]);
  useEffect(()=>{let alive=true;if(!caseId){setLoading(false);return;}
    setLoading(true);
    backend.request<FirRecord>(`/cases/${encodeURIComponent(caseId)}`).then(r=>{if(!alive)return;if(r.service_code!=='fir_draft')throw new Error('This is not an FIR request.');setRecord(r);setError('');})
      .catch(e=>{if(alive)setError(e instanceof Error?e.message:'Couldn’t load the client’s filing.');}).finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};},[caseId,revision]);
  return {record,setRecord,error,loading,reload};
}
export function intakeOf(record:FirRecord|null):FirIntake|null{
  if(!record)return null;const parsed=FirIntakeSchema.safeParse(record.details);return parsed.success?parsed.data:null;
}

// ── formatting ───────────────────────────────────────────────────────────────
const istDay=(ms:number)=>new Date(ms+330*60000).toISOString().slice(0,10);
/** "Today, 10:14 AM" / "Yesterday, 04:18 PM" / "18 Oct 2026, 10:14 AM" in IST. */
export function dayTime(iso:string|null|undefined,separator=', '){
  if(!iso)return '';const at=Date.parse(iso);if(Number.isNaN(at))return '';
  const day=istDay(at),label=day===istDay(Date.now())?'Today':day===istDay(Date.now()-86400000)?'Yesterday':formatDate(iso);
  return `${label}${separator}${formatTime(iso)}`;
}
/** The client's incident date (YYYY-MM-DD or DD/MM/YYYY) as "18 Oct 2026"; anything else verbatim. */
export function incidentDate(value:string|undefined){
  const v=value?.trim()??'';const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v),local=/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(v);
  if(!iso&&!local)return v;
  const [y,m,d]=iso?[+iso[1],+iso[2],+iso[3]]:[+local![3],+local![2],+local![1]];
  return new Date(Date.UTC(y,m-1,d)).toLocaleDateString('en-IN',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'});
}
/** "21:30" as "09:30 PM"; a 12-hour time is kept, upper-cased. */
export function incidentTime(value:string|undefined){
  const v=value?.trim()??'';const h24=/^([01]?\d|2[0-3]):([0-5]\d)$/.exec(v);
  if(!h24)return v.toUpperCase();
  const h=+h24[1];return `${String(h%12||12).padStart(2,'0')}:${h24[2]} ${h<12?'AM':'PM'}`;
}
export const incidentWhen=(i:FirIntake['incident']|undefined)=>[incidentDate(i?.date),incidentTime(i?.time)].filter(Boolean).join(', ');
export const docType=(mime:string)=>mime==='application/pdf'?'PDF':mime.startsWith('image/')?'Image':mime.startsWith('video/')?'Video':mime.startsWith('audio/')?'Audio':'File';
export const isIdentity=(d:FirDoc)=>d.kind==='id_proof';
/** The ID is never named by its file: "Identity Proof (masked) XXXX-XXXX-1234". */
export const docName=(d:FirDoc)=>isIdentity(d)?['Identity Proof (masked)',maskedIdentity(d.identity_last4)].filter(Boolean).join(' '):d.filename;
const SLOT_TITLES:Record<string,string>={...Object.fromEntries(FIR_UPLOAD_SLOTS.map(s=>[s.kind,s.title])),id_proof:'Identity Proof',supporting_document:'Added by you',fir_change_attachment:'Client’s change request'};
export const docSlot=(d:FirDoc)=>d.kind==='fir_custom'?d.slot_label?.trim()||'Other':SLOT_TITLES[d.kind]??'';
/** Pages are counted for PDFs only; a photo, clip or recording shows its size alone. */
export const docPages=(d:FirDoc)=>d.mime_type==='application/pdf'&&d.page_count?`${d.page_count} ${d.page_count===1?'Page':'Pages'}`:'';
export const joinDot=(...parts:(string|null|undefined|false)[])=>parts.filter(Boolean).join(' • ');
export {formatSize};
/** The client's own uploads, in upload order (not drafts, receipts or advocate uploads). */
export const clientDocuments=(r:FirRecord|null)=>(r?.documents??[]).filter(d=>d.status==='uploaded'&&d.owner_id===r!.client_id&&!['fir_draft','fir_police_receipt','fir_change_attachment'].includes(d.kind));

/** A3: "Rahul Sharma (Complainant), Vikram Singh & 2 others (Accused)". */
export function peopleSummary(intake:FirIntake|null){
  if(!intake)return '';
  const name=(p:FirIntake['people'][number])=>p.unknown||!p.name.trim()?'Unknown person':p.name.trim();
  const group=(kind:'complainant'|'accused'|'witness',one:string,many:string)=>{
    const people=intake.people.filter(p=>p.kind===kind).sort((a,b)=>Number(!!b.primary)-Number(!!a.primary));
    if(!people.length)return null;const rest=people.length-1;
    return `${name(people[0])}${rest?` & ${rest} ${rest===1?'other':'others'}`:''} (${people.length>1?many:one})`;
  };
  return [group('complainant','Complainant','Complainants'),group('accused','Accused','Accused'),group('witness','Witness','Witnesses')].filter(Boolean).join(', ');
}

// ── files ────────────────────────────────────────────────────────────────────
const PICKABLE=['application/pdf','image/png','image/jpeg'] as const;
const safeName=(name:string)=>{const clean=name.replace(/[\x00-\x1f\x7f/\\]/g,'_').replaceAll('..','.').replaceAll('${','$').trim()||'Document';return clean.length>120?clean.slice(0,60)+'…'+clean.slice(-50):clean;};
/** Picks one PDF/JPEG/PNG and uploads it to the case. Null when the person cancels. */
export async function pickAndUpload(caseId:string,kind:string):Promise<FirDoc|null>{
  const picked=await DocumentPicker.getDocumentAsync({type:[...PICKABLE],copyToCacheDirectory:true,multiple:false});
  if(picked.canceled)return null;
  const file=picked.assets[0];const mime=file.mimeType??'application/pdf';
  if(!(PICKABLE as readonly string[]).includes(mime))throw new Error('Upload a PDF, JPEG or PNG file.');
  if(file.size&&file.size>DOCUMENT_MAX_BYTES)throw new Error('This file is larger than 25 MB. Upload a smaller copy.');
  const ticket=await backend.presign({case_id:caseId,kind,filename:safeName(file.name),mime:mime as typeof PICKABLE[number]});
  return await backend.upload(ticket,Platform.OS==='web'?await(await fetch(file.uri)).blob():{uri:file.uri,name:ticket.document.filename,type:mime}) as FirDoc;
}
/** Opens a generated PDF preview: a new tab on web, the system viewer elsewhere. */
export async function openPdf(filename:string,base64:string){
  if(Platform.OS==='web'){
    const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
    const opened=globalThis.open?.(url,'_blank');
    if(!opened){const a=document.createElement('a');a.href=url;a.download=filename;a.click();}
    setTimeout(()=>URL.revokeObjectURL(url),120000);return;
  }
  await Linking.openURL(`data:application/pdf;base64,${base64}`);
}
/** "just now", "3 min ago", "2 h ago", or the date. Re-renders every 30 s. */
export function useAgo(iso:string|null){
  const [,tick]=useState(0);
  useEffect(()=>{if(!iso)return;const t=setInterval(()=>tick(n=>n+1),30000);return()=>clearInterval(t);},[iso]);
  if(!iso)return '';const mins=Math.floor((Date.now()-Date.parse(iso))/60000);
  return mins<1?'just now':mins<60?`${mins} min ago`:mins<24*60?`${Math.floor(mins/60)} h ago`:dayTime(iso);
}
/** Serialises taps: one action at a time, its error kept next to it. */
export function useAction(){
  const lock=useRef(false);const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const run=useCallback(async<T,>(fn:()=>Promise<T>):Promise<T|undefined>=>{
    if(lock.current)return undefined;lock.current=true;setBusy(true);setError('');
    try{return await fn();}catch(e){setError(e instanceof Error?e.message:'That didn’t work. Please try again.');return undefined;}
    finally{lock.current=false;setBusy(false);}
  },[]);
  return {busy,error,setError,run};
}

// ── states ───────────────────────────────────────────────────────────────────
/** Loading, error and "moved on" panels, styled as the screens' cards. */
export function StateCard({loading,title,body,error,actionLabel,onAction,secondaryLabel,onSecondary}:{loading?:boolean;title?:string;body?:string;error?:string;actionLabel?:string;onAction?():void;secondaryLabel?:string;onSecondary?():void}){
  return <View style={s.card} accessibilityLiveRegion="polite">
    {loading&&<View style={s.loadingRow}><ActivityIndicator color={colors.brandDark}/><Text style={s.cardBody} role="status">{title}</Text></View>}
    {!loading&&!!title&&<Text style={s.cardTitle}>{title}</Text>}
    {!!body&&<Text style={s.cardBody}>{body}</Text>}
    {!!error&&<Text style={s.error} accessibilityRole="alert">{error}</Text>}
    {!!actionLabel&&onAction&&<SheetButton label={actionLabel} onPress={onAction}/>}
    {!!secondaryLabel&&onSecondary&&<SheetButton label={secondaryLabel} tone="neutral" onPress={onSecondary}/>}
  </View>;
}
/** Shown when a screen is opened in a state it doesn't serve: the current state and its own action. */
export function MovedOn({caseId,stage}:{caseId:string;stage:FirStageView}){
  const {action,screen,chip}=stage.advocate;
  return <StateCard title="This request is at another step" body={`Current status: ${chip}.`}
    actionLabel={action&&screen?action:'Back to Cases'} onAction={()=>action&&screen?router.replace(firRoute(caseId,screen)):toCases()}
    secondaryLabel={action&&screen?'Back to Cases':undefined} onSecondary={toCases}/>;
}
export function InlineError({error,onRetry,retryLabel='Retry'}:{error:string;onRetry?():void;retryLabel?:string}){
  if(!error)return null;
  return <View style={s.inlineError}><Text style={s.error} accessibilityRole="alert">{error}</Text>{onRetry&&<Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}><Text style={s.retry}>{retryLabel}</Text></Pressable>}</View>;
}

// ── sheets ───────────────────────────────────────────────────────────────────
export function Sheet({visible,title,body,onClose,children}:{visible:boolean;title:string;body?:string;onClose():void;children?:ReactNode}){
  const insets=useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.sheetWrap}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Dismiss" onPress={onClose}/>
      <View style={[s.sheet,{paddingBottom:insets.bottom+20}]} accessibilityViewIsModal>
        <View style={s.grabber}/>
        <Text style={s.sheetTitle} accessibilityRole="header">{title}</Text>
        {!!body&&<Text style={s.sheetBody}>{body}</Text>}
        <ScrollView style={s.sheetScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
export function SheetButton({label,onPress,tone='primary',disabled=false}:{label:string;onPress():void;tone?:'primary'|'danger'|'neutral';disabled?:boolean}){
  return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress}
    style={({pressed})=>[s.button,tone==='primary'?s.primary:tone==='danger'?s.danger:s.neutral,disabled&&s.disabled,pressed&&s.pressed]}>
    <Text style={[s.buttonText,tone==='primary'&&s.primaryText,tone==='danger'&&s.dangerText]}>{label}</Text>
  </Pressable>;
}

export const PRIMARY='#6C5C45';
export const s=StyleSheet.create({
  card:{marginTop:16,borderRadius:16,backgroundColor:'#FFFFFF',padding:16,gap:10},
  loadingRow:{flexDirection:'row',alignItems:'center',gap:10},
  cardTitle:{fontFamily:font.appHeading,fontSize:17,color:colors.textPrimary},
  cardBody:{flexShrink:1,fontFamily:font.appBody,fontSize:14,lineHeight:21,color:colors.textBody},
  error:{flexShrink:1,fontFamily:font.appBody,fontSize:13.5,lineHeight:20,color:status.onRedContainer},
  inlineError:{marginTop:10,borderRadius:12,backgroundColor:status.redContainer,padding:12,flexDirection:'row',alignItems:'flex-start',gap:12},
  retry:{fontFamily:font.appSemi,fontSize:13.5,color:status.onRedContainer,textDecorationLine:'underline'},
  sheetWrap:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(28, 24, 20, 0.45)'},
  sheet:{maxHeight:'92%',borderTopLeftRadius:22,borderTopRightRadius:22,backgroundColor:'#FFFFFF',paddingHorizontal:20,paddingTop:10},
  sheetScroll:{flexGrow:0},
  grabber:{alignSelf:'center',width:40,height:4,borderRadius:2,backgroundColor:'#E3DDD6',marginBottom:14},
  sheetTitle:{fontFamily:font.appHeading,fontSize:19,color:colors.textPrimary},
  sheetBody:{marginTop:8,fontFamily:font.appBody,fontSize:14,lineHeight:21,color:colors.textBody},
  button:{marginTop:12,minHeight:50,borderRadius:12,alignItems:'center',justifyContent:'center',paddingHorizontal:16},
  primary:{backgroundColor:PRIMARY},
  danger:{backgroundColor:status.redContainer},
  neutral:{backgroundColor:'#F5F1ED'},
  disabled:{opacity:0.5},
  pressed:{opacity:0.85},
  buttonText:{fontFamily:font.appHeading,fontSize:15.5,color:colors.textPrimary},
  primaryText:{color:ink.onBrand},
  dangerText:{color:status.onRedContainer},
  label:{marginTop:16,fontFamily:font.appSemi,fontSize:13,color:colors.textPrimary},
  input:{marginTop:8,borderRadius:12,borderWidth:1,borderColor:'#E6E0D9',backgroundColor:'#FCFBFA',paddingHorizontal:14,paddingVertical:12,fontFamily:font.appBody,fontSize:14.5,lineHeight:21,color:colors.textPrimary},
  hint:{marginTop:6,fontFamily:font.appBody,fontSize:12.5,lineHeight:18,color:colors.textBody},
});

import {noticeDocumentLabel,reportFileLabel,isFlowReportService} from '@legalitt/shared';
import {useCallback,useEffect,useState} from 'react';
import {Image,Linking,Platform,Pressable,ScrollView,StyleSheet,Text,TextInput,View,useWindowDimensions} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {ChevronLeft,ChevronRight,Download,FileWarning,Folder,Lock,Maximize,MoreHorizontal,Share2,ZoomIn,ZoomOut} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {backend} from '../../lib/auth';
import {colors,font} from '../../constants/theme';
import PdfSurface from './PdfSurface';

type FileView={url:string;document:{id:string;kind?:string;slot_label?:string|null;filename:string;mime_type:string;page_count:number|null;size_bytes:string};case:{id:string;reference:string;service_code:string;client_name:string}|null};
export default function DocumentViewer(){
  const {documentId,reportCaseId,draftId,reportOnly,fileIndex}=useLocalSearchParams<{documentId?:string;reportCaseId?:string;draftId?:string;reportOnly?:string;fileIndex?:string}>(),insets=useSafeAreaInsets(),size=useWindowDimensions();
  const [file,setFile]=useState<FileView|null>(null),[bytes,setBytes]=useState<Uint8Array|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
  const [page,setPage]=useState(1),[pages,setPages]=useState(0),[scale,setScale]=useState(1),[retry,setRetry]=useState(0),[more,setMore]=useState(false),[report,setReport]=useState(false),[problem,setProblem]=useState(''),[message,setMessage]=useState(''),[sending,setSending]=useState(false);
  const back=()=>router.canGoBack()?router.back():router.replace('/documents');
  useEffect(()=>{
    let alive=true;setFile(null);setBytes(null);setError('');setPages(0);setPage(1);setScale(1);
    if(!documentId&&!(reportCaseId&&draftId)){setLoading(false);return;}setLoading(true);
    void(async()=>{
      if(reportCaseId&&draftId){
        const result=await backend.request<{files:{filename:string;pdf_base64:string}[]}>(`/service-reports/${reportCaseId}/drafts/${draftId}/preview`,{report_only:reportOnly==='true'});
        const preview=result.files[Number(fileIndex)||0];if(!preview)throw new Error('This preview is unavailable. Return to the report and generate it again.');
        const data=Uint8Array.from(atob(preview.pdf_base64),v=>v.charCodeAt(0));
        if(alive){setBytes(data);setFile({url:'',document:{id:'',filename:preview.filename.includes('Affidavit')?'Affidavit preview':'Report preview',mime_type:'application/pdf',page_count:null,size_bytes:String(data.length)},case:null});}return;
      }
      let info=await backend.request<FileView>(`/documents/${documentId}/view`);
      if(alive)setFile(info);
      let response=await fetch(info.url);
      if(response.status===401||response.status===403){info=await backend.request<FileView>(`/documents/${documentId}/view`);response=await fetch(info.url);}
      if(!response.ok)throw new Error('Unable to load document. Retry or download it instead.');
      const data=new Uint8Array(await response.arrayBuffer());
      if(alive){setFile(info);setBytes(data);if(info.document.mime_type!=='application/pdf')setPages(1);}
    })().catch(e=>{if(alive)setError(e instanceof Error?e.message:'Unable to load document. Please retry.');}).finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[documentId,reportCaseId,draftId,reportOnly,fileIndex,retry]);
  const download=async()=>{setMessage('');try{if(!documentId&&bytes&&file&&Platform.OS==='web'){const url=URL.createObjectURL(new Blob([bytes.slice().buffer],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download=file.document.filename+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);return;}if(!documentId)return;await Linking.openURL((await backend.documentUrl(documentId)).url);}catch(e){setMessage(e instanceof Error?e.message:'Download failed. Please retry.');}};
  const share=async()=>{setMessage('');try{
    if(Platform.OS==='web'&&file&&bytes){const upload=new File([bytes.slice().buffer],(file.case?.service_code==='legal_notice'?noticeDocumentLabel(file.document):isFlowReportService(file.case?.service_code??'')?reportFileLabel(file.document):file.document.filename),{type:file.document.mime_type});if(navigator.canShare?.({files:[upload]})){await navigator.share({files:[upload],title:(file.case?.service_code==='legal_notice'?noticeDocumentLabel(file.document):isFlowReportService(file.case?.service_code??'')?reportFileLabel(file.document):file.document.filename)});return;}}
    setMessage('File sharing is unavailable here. Download the file, then share it from your device.');
  }catch(e){if(!(e instanceof Error&&e.name==='AbortError'))setMessage('Couldn’t share the file. Download it and share from your device.');}};
  const sendProblem=async()=>{if(sending||!problem.trim()||!file)return;setSending(true);setMessage('');try{
    await backend.createSupportTicket({subject:'Document viewer problem',related_to:file.case?.service_code??'document',case_id:file.case?.id,contact_method:'chat',description:`Source: Document Viewer\nDocument: ${file.document.id}\n${problem.trim()}`});
    setMessage('Your report was sent to Support.');setReport(false);setProblem('');
  }catch(e){setMessage(e instanceof Error?e.message:'Report failed. Keep your description and retry.');}finally{setSending(false);}};
  const renderError=useCallback((value:string)=>setError(value),[]);
  const tools=[{name:'Zoom Out',Icon:ZoomOut,action:()=>setScale(n=>Math.max(.5,n-.25)),disabled:scale<=.5},{name:'Zoom In',Icon:ZoomIn,action:()=>setScale(n=>Math.min(3,n+.25)),disabled:scale>=3},{name:'Fit to Screen',Icon:Maximize,action:()=>setScale(1)},{name:'Download',Icon:Download,action:download},{name:'Share',Icon:Share2,action:share},{name:'More',Icon:MoreHorizontal,action:()=>setMore(n=>!n)}];
  return <View style={s.screen}>
    <View style={[s.header,{paddingTop:insets.top+12}]}><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back}><ChevronLeft size={26}/></Pressable><Text style={s.title}>Document Viewer</Text><Pressable accessibilityRole="button" accessibilityLabel="Document options" onPress={()=>setMore(n=>!n)}><MoreHorizontal size={24}/></Pressable></View>
    <ScrollView contentContainerStyle={s.content}>
      {file&&<View style={s.file}><View style={{flex:1,gap:7}}><Text style={s.heading}>{(file.case?.service_code==='legal_notice'?noticeDocumentLabel(file.document):isFlowReportService(file.case?.service_code??'')?reportFileLabel(file.document):file.document.filename)}</Text>{file.case?.client_name&&<Text style={s.body}>Client: {file.case.client_name}</Text>}{file.case?.reference&&<Text style={s.body}>Case: {file.case.reference}</Text>}</View><Lock size={20} color="#8C7050"/></View>}
      <View style={s.document}>
        {loading?<View style={s.blank}><Text accessibilityLiveRegion="polite" style={s.body}>Loading document…</Text></View>:!documentId&&!reportCaseId?<View style={s.blank}><Folder size={48} color="#A98A68"/><Text style={s.heading}>No document available</Text><Text style={s.center}>There is no document selected for this case yet.</Text><Action label="Back to Case" onPress={back}/></View>:error?<View style={s.blank}><FileWarning size={48} color="#A98A68"/><Text style={s.heading}>Unable to load document</Text><Text accessibilityRole="alert" style={s.center}>{error}</Text><Action label="Retry" onPress={()=>setRetry(n=>n+1)}/><Action label="Download instead" onPress={download}/></View>:bytes&&file?<ScrollView horizontal contentContainerStyle={{flexGrow:1,justifyContent:scale<=1?'center':'flex-start'}}>
          {file.document.mime_type==='application/pdf'?<PdfSurface bytes={bytes} page={page} scale={scale} width={Math.min(size.width,900)-72} onPages={setPages} onError={renderError}/>:<Image accessibilityLabel={(file.case?.service_code==='legal_notice'?noticeDocumentLabel(file.document):isFlowReportService(file.case?.service_code??'')?reportFileLabel(file.document):file.document.filename)} source={{uri:file.url}} resizeMode="contain" style={{width:(Math.min(size.width,900)-72)*scale,height:500*scale}} onError={()=>setError('This image could not be displayed. Retry or download it instead.')}/>}
        </ScrollView>:null}
        {!!pages&&!error&&!loading&&<View style={s.pager}><Pressable accessibilityRole="button" accessibilityLabel="Previous page" disabled={page===1} onPress={()=>setPage(p=>p-1)} style={{opacity:page===1?.35:1}}><ChevronLeft color="#8C7050"/></Pressable><Text style={s.body}>{file?.document.mime_type==='application/pdf'?`Page ${page} of ${pages}`:`${pages} ${pages===1?'image':'images'}`}</Text><Pressable accessibilityRole="button" accessibilityLabel="Next page" disabled={page===pages} onPress={()=>setPage(p=>p+1)} style={{opacity:page===pages?.35:1}}><ChevronRight color="#8C7050"/></Pressable></View>}
        {file&&!loading&&<View style={s.tools}>{tools.map(({name,Icon,action,disabled})=><Pressable key={name} accessibilityRole="button" accessibilityLabel={name} disabled={disabled} onPress={action} style={[s.tool,disabled&&{opacity:.35}]}><View style={s.circle}><Icon size={20} color="#8C7050"/></View><Text style={s.toolLabel}>{name}</Text></Pressable>)}</View>}
      </View>
      {more&&documentId&&<View style={s.file}><View style={{flex:1}}><Action label="Open in new tab" onPress={download}/><Action label="Report a problem" onPress={()=>{setReport(true);setMore(false);}}/></View></View>}
      {report&&<View style={s.file}><View style={{flex:1,gap:12}}><Text style={s.heading}>Report a problem</Text><Text style={s.body}>Tell Support what went wrong. Don’t include identity numbers.</Text><TextInput accessibilityLabel="Problem description" multiline maxLength={2000} value={problem} onChangeText={setProblem} style={s.input}/><Action label={sending?'Sending…':'Send report'} disabled={sending||!problem.trim()} onPress={sendProblem}/><Action label="Cancel" onPress={()=>setReport(false)}/></View></View>}
      {!!message&&<Text accessibilityLiveRegion="polite" style={s.center}>{message}</Text>}
    </ScrollView>
  </View>;
}
function Action({label,onPress,disabled=false}:{label:string;onPress():void;disabled?:boolean}){return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.button,disabled&&{opacity:.4}]}><Text style={{color:'#806646',fontFamily:font.appSemi}}>{label}</Text></Pressable>;}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:'#FAF9F7'},header:{flexDirection:'row',alignItems:'center',padding:20,backgroundColor:'#fff'},title:{flex:1,textAlign:'center',fontFamily:font.appHeading,fontSize:20},content:{padding:18,gap:18,maxWidth:900,width:'100%',alignSelf:'center',paddingBottom:40},file:{backgroundColor:'#fff',borderRadius:15,padding:18,flexDirection:'row',gap:12},heading:{fontFamily:font.appHeading,fontSize:17,color:'#28241E'},body:{fontFamily:font.appBody,fontSize:14,color:colors.textBody,lineHeight:22},center:{fontFamily:font.appBody,textAlign:'center',lineHeight:22,color:colors.textBody},document:{backgroundColor:'#F3EEE6',padding:18,borderRadius:18},blank:{alignItems:'center',justifyContent:'center',minHeight:360,gap:18},pager:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:28,marginTop:22},tools:{flexDirection:'row',justifyContent:'space-between',gap:5,marginTop:26},tool:{alignItems:'center',flex:1,gap:7},circle:{borderWidth:1,borderColor:'#C6B9A6',borderRadius:30,padding:10},toolLabel:{fontFamily:font.appSemi,fontSize:10,textAlign:'center',color:'#4D463D'},button:{padding:13,backgroundColor:'transparent',borderWidth:1,borderColor:'#C6B9A6',borderRadius:24,alignItems:'center',marginVertical:4},input:{minHeight:100,padding:12,borderWidth:1,borderColor:'#C6B9A6',borderRadius:10,fontFamily:font.appBody}});

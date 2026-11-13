import {Linking,Platform} from 'react-native';
import {backend} from '../../lib/auth';
async function bytes(id:string,blob?:Blob|null){if(blob)return blob;const ticket=await backend.documentUrl(id),response=await fetch(ticket.url);if(!response.ok)throw Error('Unable to load the report. Please try again.');return response.blob();}
export async function downloadReportFile(id:string,name:string,blob?:Blob|null){
 if(Platform.OS!=='web'){await Linking.openURL((await backend.documentUrl(id)).url);return;}
 const url=URL.createObjectURL(await bytes(id,blob)),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
export async function shareReportFile(id:string,name:string,blob?:Blob|null){
 if(Platform.OS==='web'){
  const file=new File([blob??await bytes(id)],name,{type:'application/pdf'});
  if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:name.replace(/\.pdf$/i,'')});return;}catch(e){if(e instanceof Error&&e.name==='AbortError')return;}}
  await downloadReportFile(id,name,file);return;
 }
 const Sharing=await import('expo-sharing');
 if(!await Sharing.isAvailableAsync()){await downloadReportFile(id,name);return;}
 const {File:NativeFile,Directory,Paths}=await import('expo-file-system');
 const directory=new Directory(Paths.cache,'report-shares',id);directory.create({intermediates:true,idempotent:true});
 const file=await NativeFile.downloadFileAsync((await backend.documentUrl(id)).url,new NativeFile(directory,name),{idempotent:true});
 try{await Sharing.shareAsync(file.uri,{mimeType:'application/pdf',UTI:'com.adobe.pdf',dialogTitle:'Share report'});}finally{if(file.exists)file.delete();}
}

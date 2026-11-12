import * as DocumentPicker from 'expo-document-picker';
import {DOCUMENT_MAX_BYTES,DocumentMimeSchema} from '@legalitt/shared';
import {backend} from '../../lib/auth';
export async function uploadNoticeDocument(caseId:string,kind:string){
  const picked=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/jpeg','image/png'],copyToCacheDirectory:true});if(picked.canceled)return null;
  const file=picked.assets[0];if((file.size??0)>DOCUMENT_MAX_BYTES)throw new Error('Use a PDF, JPEG or PNG up to 25 MB.');const mime=DocumentMimeSchema.parse(file.mimeType);
  const ticket=await backend.presign({case_id:caseId,kind,filename:file.name,mime});
  return backend.upload(ticket,file.file??{uri:file.uri,name:ticket.document.filename,type:mime});
}

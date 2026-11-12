import {useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {backend} from '../../lib/auth';
import PdfSurface from './PdfSurface';
/** Small first-page preview of the same authorized file shown by the viewer. */
export default function DocumentThumbnail({documentId}:{documentId:string}){
  const [bytes,setBytes]=useState<Uint8Array|null>(null),[error,setError]=useState('');
  useEffect(()=>{let alive=true;void(async()=>{const ticket=await backend.documentUrl(documentId);const result=await fetch(ticket.url);if(!result.ok)throw new Error();const data=new Uint8Array(await result.arrayBuffer());if(alive)setBytes(data);})().catch(()=>{if(alive)setError('Preview unavailable. Open View to retry or download.');});return()=>{alive=false;};},[documentId]);
  return <View style={{maxHeight:230,overflow:'hidden',alignItems:'center'}}>{error?<Text>{error}</Text>:bytes?<PdfSurface bytes={bytes} width={150} page={1} scale={1} onPages={()=>{}} onError={setError}/>:<Text>Loading preview…</Text>}</View>;
}

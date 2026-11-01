import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError, DOCUMENT_MAX_BYTES, DocumentMimeSchema, type AdminCaseDetail, type ApiDocument } from '@legalitt/shared';
import { api } from './session';
const localNow = () => {const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60_000).toISOString().slice(0,16);};
export function ConfirmDelivery({record,close,confirmed}: {record:AdminCaseDetail;close():void;confirmed():void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const [receiver,setReceiver]=useState(''),[time,setTime]=useState(localNow),[file,setFile]=useState<File|null>(null);
 const [proof,setProof]=useState<ApiDocument|null>(null),[uploading,setUploading]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[stale,setStale]=useState(false);
 const busy=uploading||saving;
 useEffect(()=>{const el=dialog.current;el?.showModal();return()=>el?.close();},[]);
 const upload=async (selected:File)=>{
  setFile(selected);setProof(null);setError('');
  if(!DocumentMimeSchema.safeParse(selected.type).success){setError('Choose a PDF, JPEG or PNG file.');return;}
  if(selected.size===0||selected.size>DOCUMENT_MAX_BYTES){setError('Choose a file between 1 byte and 25 MB.');return;}
  setUploading(true);
  try {
   const ticket=await api.presign({case_id:record.id,kind:'proof_of_delivery',filename:selected.name,mime:selected.type as 'application/pdf'|'image/jpeg'|'image/png'});
   await api.upload(ticket,selected);
   const doc=await api.completeDocument(ticket.document.id);
   setProof(doc);
  }catch(e){setError(e instanceof Error?e.message:'Unable to upload proof of delivery');}
  finally{setUploading(false);}
 };
 const submit=async(e:FormEvent)=>{
  e.preventDefault();if(busy||!proof)return;setSaving(true);setError('');
  try{await api.deliver(record.id,proof.id,{received_by:receiver.trim()||null,delivered_at:new Date(time).toISOString()});confirmed();}
  catch(e){setStale(e instanceof ApiError&&e.status===409);setError(e instanceof Error?e.message:'Unable to confirm delivery');}
  finally{setSaving(false);}
 };
 const shipment=record.shipments.find(s=>s.direction==='to_recipient');
 return <dialog className="assign-dialog delivery-dialog" ref={dialog} onCancel={e=>{e.preventDefault();if(!busy)close();}} aria-labelledby="delivery-title">
  <div className="dialog-heading"><div><p className="eyebrow">{record.reference}</p><h2 id="delivery-title">Confirm delivery</h2><p>Record the delivery and close this case.</p></div><button disabled={busy} onClick={close} aria-label="Close delivery confirmation">×</button></div>
  {shipment&&(shipment.carrier||shipment.waybill)&&<div className="delivery-shipment">{shipment.carrier&&<strong>{shipment.carrier}</strong>}{shipment.waybill&&<span>{shipment.waybill}</span>}</div>}
  <form onSubmit={e=>void submit(e)}>
   <label>Proof of delivery<input type="file" name="proof" accept="application/pdf,image/jpeg,image/png" disabled={busy||stale} onChange={e=>{const selected=e.target.files?.[0];if(selected)void upload(selected);}}/></label>
   <p className="upload-help">PDF, JPEG or PNG · up to 25 MB</p>
   {uploading&&<p className="upload-status" role="status">Uploading and validating {file?.name}…</p>}
   {proof&&<p className="upload-status uploaded" role="status">✓ {proof.filename} · uploaded and validated</p>}
   {file&&!proof&&!busy&&error&&<button type="button" onClick={()=>void upload(file)}>Retry upload</button>}
   <label>Received by <small>Optional</small><input name="received_by" value={receiver} onChange={e=>setReceiver(e.target.value)} maxLength={200} disabled={saving||stale} autoComplete="off"/></label>
   <label>Delivered at<input type="datetime-local" name="delivered_at" required value={time} onChange={e=>setTime(e.target.value)} disabled={saving||stale}/></label>
   <p className="upload-help">Local time · {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
   {error&&<div className="error" role="alert">{error}</div>}
   {stale?<button type="button" onClick={confirmed}>Reload case</button>:<button className="primary" type="submit" disabled={busy||!proof||!time}>{saving?'Confirming…':'Confirm delivery'}</button>}
  </form>
 </dialog>;
}

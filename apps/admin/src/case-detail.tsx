import {reportPhone,useReportRefresh} from './report-presentation';
import {reportFileLabel,isFlowReportService,noticeDate,noticeDocumentLabel,noticeMethodLabel,noticeStage} from '@legalitt/shared';
import { ConfirmDelivery } from './confirm-delivery';
import {NoticeFlowPanel} from './notice-flow-panel';
import {FirApprovalPanel} from './fir-approval';
import {FirFlowPanel} from './fir-flow-panel';
import {CourtIntakeSummary} from './court-intake';
import {CourtPanel} from './court-panel';
import {ConsultationPanel} from './consultation-panel';
import {isConsultationService,isReportService} from '@legalitt/shared';
import {ReportIntake} from './report-intake';
import {ReportPanel} from './report-panel';
import {CaseRefunds} from './cancellations';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError, adminBucketFor, adminCaseListPath, SERVICE_NAMES, ServiceCodeSchema, type AdminCaseDetail } from '@legalitt/shared';
import { api, useSession } from './session';
import { AssignAdvocate } from './assign-advocate';
const label = (s: string) => s.replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('_', ' ').replace(/^./, c => c.toUpperCase());
const money = (v: string) => '₹' + (BigInt(v) / 100n).toLocaleString('en-IN') + '.' + (BigInt(v) % 100n).toString().padStart(2, '0');
const date = noticeDate;
const eventTitle = (e: AdminCaseDetail['events'][number]) => e.type === 'shipment_status_changed' && typeof e.payload.to === 'string' ? label(e.payload.to) : e.type === 'status_changed' && e.to_status ? label(e.to_status) : label(e.type);
const present = (v: unknown): boolean => v !== null && v !== undefined && v !== '' && (typeof v !== 'object' || Object.values(v).some(present));
function Demo({show}: {show: boolean}) {return show ? <small className="demo">demo</small> : null;}
function Field({name, value}: {name: string; value: ReactNode}) {return value !== null && value !== undefined && value !== '' ? <div className="detail-field"><dt>{name}</dt><dd>{value}</dd></div> : null;}
function reportValue(key:string,value:unknown):string{if(typeof value==='boolean')return value?'Yes':'No';if(key.endsWith('_at')&&typeof value==='string')return date(value)??'';const values:Record<string,string>={likely_genuine:'Likely genuine',likely_not_genuine:'Likely not genuine',inconclusive:'Inconclusive',low:'Low',medium:'Medium',high:'High',ordinary:'Ordinary',urgent:'Urgent',property:'Property report editor',forensic:'Forensic report and affidavit',upload:'Uploaded final PDF'};return ['overall_status','risk_level','tier','production'].includes(key)?values[String(value)]??label(String(value)):String(value);}
function Values({value,notice=false,report=false}: {value: Record<string, unknown>;notice?:boolean;report?:boolean}) {
  if(report&&Array.isArray(value))return <ol>{value.filter(present).map((v,i)=><li key={i}>{typeof v==='object'?<Values report value={v as Record<string,unknown>}/>:String(v)}</li>)}</ol>;
  return <dl className="event-values">{Object.entries(value).filter(([k,v])=>present(v)&&(!(notice||report)||!/(?:^id$|_id$|_ids$|filename|s3_key)/.test(k))).map(([k,v])=><Field key={k} name={label(k)} value={typeof v === 'object' ? <Values notice={notice} report={report} value={v as Record<string,unknown>}/> : report?reportValue(k,v):notice&&['courier','email','whatsapp'].includes(String(v))?noticeMethodLabel(String(v)):String(v)}/>)}</dl>;
}
function Preview({doc, close, notice=false, report=false}: {notice?:boolean;report?:boolean;doc: AdminCaseDetail['documents'][number]; close(): void}) {
 const ref=useRef<HTMLDialogElement>(null); const [url,setUrl]=useState(''),[error,setError]=useState('');
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
 useEffect(()=>{let alive=true;api.adminDocumentPreview(doc.id).then(r=>{if(alive)setUrl(r.url);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[doc.id]);
 return <dialog ref={ref} className="document-dialog" onCancel={e=>{e.preventDefault();close();}} aria-label={notice?noticeDocumentLabel(doc):report?reportFileLabel(doc):doc.filename}>
  <div className="dialog-heading"><div><h2>{notice?noticeDocumentLabel(doc):report?reportFileLabel(doc):doc.filename}<Demo show={doc.simulated}/></h2><p>{label(doc.kind)}</p></div><button onClick={close} aria-label="Close document">×</button></div>
  {error ? <div role="alert" className="error">{error}</div> : !url ? <p role="status">Opening document…</p> : <><a href={url} target="_blank" rel="noreferrer">Open in new tab ↗</a>{doc.mime_type.startsWith('image/') ? <img src={url} alt={notice?noticeDocumentLabel(doc):report?reportFileLabel(doc):doc.filename}/> : doc.mime_type === 'application/pdf' ? <iframe title={notice?noticeDocumentLabel(doc):report?reportFileLabel(doc):doc.filename} src={url}/> : null}</>}
 </dialog>;
}
export function CaseDetail() {
 const {id}=useParams(),{refuse}=useSession(); const [data,setData]=useState<AdminCaseDetail|null>(null),[error,setError]=useState('');
 const [reload,setReload]=useState(0),[assign,setAssign]=useState(false),[delivering,setDelivering]=useState(false),[preview,setPreview]=useState<AdminCaseDetail['documents'][number]|null>(null);
 useEffect(()=>{let alive=true;setData(null);setError('');api.adminCase(id!).then(r=>{if(alive)setData(r);}).catch(e=>{
  if(!alive)return;if(e instanceof ApiError && [401,403].includes(e.status))refuse('Admin access required. Sign in again.');else setError(e.message);
 });return()=>{alive=false;};},[id,reload]);
 const routeService = ServiceCodeSchema.safeParse(useParams().service);
 const service = data?.service_code ?? (routeService.success ? routeService.data : 'legal_notice');
 useReportRefresh(isFlowReportService(service),()=>setReload(n=>n+1));
 const heading = service === 'legal_notice' ? 'Legal Notices' : SERVICE_NAMES[service];
 const backPath = adminCaseListPath(service);
 if(!data)return <main className="case-detail"><Link className="back-link" to={backPath}>← {heading}</Link>{error?<div className="error" role="alert">{error} <button onClick={()=>setReload(n=>n+1)}>Retry</button></div>:<p role="status">Loading case…</p>}</main>;
 const charged=data.payments.find(p=>p.purpose==='service_fee'&&p.status==='captured');
 const additional=charged&&data.pricing?BigInt(charged.base_amount_paise)-BigInt(data.pricing.base_amount_paise):null;
 const d=data, bucket=adminBucketFor(d.status,d.service_code,d.sub_status), canAssign=!isConsultationService(service)&&(!d.advocate_id||['property_search','document_forensic'].includes(service)&&d.status==='advocate_declined') && ['paid','assigning','advocate_declined'].includes(d.status);
 const task=canAssign?'Assign an advocate':d.status==='advocate_declined'?'Advocate declined · assignment needs review':service==='legal_notice'&&d.status==='dispatched'?'Delivery confirmation awaits admin':null;
 const document=(doc: AdminCaseDetail['documents'][number])=><div className="document-row" key={doc.id}>
  <span className="file-symbol">{doc.mime_type==='application/pdf'?'PDF':'FILE'}</span><div className="file-description">
  {doc.status==='uploaded'?<button className="text-button" onClick={()=>setPreview(doc)}>{service==='legal_notice'?noticeDocumentLabel(doc):isFlowReportService(service)?reportFileLabel(doc):doc.filename} ↗</button>:<strong>{service==='legal_notice'?noticeDocumentLabel(doc):isFlowReportService(service)?reportFileLabel(doc):doc.filename}</strong>}
  <p>{doc.final?(service==='legal_notice'?'Final notice':'Final document'):doc.draft_version!==null?`Draft · v${doc.draft_version}`:label(doc.kind)}<Demo show={doc.simulated}/></p>
  {doc.identity_evidence&&<p>Declared type: {label(doc.identity_evidence.document_type)}{doc.identity_evidence.masked_copy?' · Masked copy declared by uploader':''}. Uploaded evidence, not identity verification.</p>}
  <p>{doc.owner}{doc.page_count!==null?` · ${doc.page_count} ${doc.page_count===1?'page':'pages'}`:''}{doc.status!=='uploaded'?` · ${label(doc.status)}`:''}</p></div></div>;
 const relatedDoc=(docId:string|null)=>{const doc=d.documents.find(v=>v.id===docId);return doc?<button className="text-button" onClick={()=>setPreview(doc)}>{service==='legal_notice'?noticeDocumentLabel(doc):isFlowReportService(service)?reportFileLabel(doc):doc.filename} ↗<Demo show={doc.simulated}/></button>:null;};
 return <main className="case-detail">
  <Link className="back-link" to={backPath}>← {heading}</Link>
  <section className="case-overview"><div className="case-heading"><div><p className="eyebrow">{SERVICE_NAMES[service].toUpperCase()}</p><h1>{d.reference}<Demo show={d.simulated}/></h1><p>{d.contacts.find(c=>c.role==='client')?.name}</p></div><span className={'status '+(bucket??'')}>{service==='legal_notice'?noticeStage(d).admin:label(d.status)}</span></div>
   <dl className="summary-fields"><Field name="Matter" value={d.matter_type?label(d.matter_type):null}/><Field name="Intake issue" value={!d.matter_type&&typeof d.intake.issueType==='string'?label(d.intake.issueType.replaceAll('-','_')):null}/><Field name="Tier" value={d.tier?label(d.tier):null}/>
    <Field name="Service fee" value={d.pricing?<>{money(d.pricing.base_amount_paise)}{!d.pricing.confirmed&&<small className="unconfirmed">Unconfirmed price</small>}</>:null}/>
    <Field name="Additional fees" value={additional!==null&&additional>0n?money(additional.toString()):null}/>
    <Field name="Charged before GST" value={charged?money(charged.base_amount_paise):null}/>
    <Field name="GST paid" value={charged?money(charged.gst_paise):null}/>
    <Field name="Total paid" value={charged?money(charged.total_paise):null}/>
    <Field name="GST rate" value={d.pricing?`${d.pricing.gst_bps/100}% exclusive`:null}/><Field name="Created" value={date(d.created_at)}/><Field name="Sub-status" value={service!=='legal_notice'&&d.sub_status?label(d.sub_status):null}/></dl>
   {task&&<div className="admin-attention"><span className="attention-dot"/><div><small>NEEDS ADMIN</small><strong>{task}</strong></div>{canAssign&&<button className="assign" onClick={()=>setAssign(true)}>+ Assign</button>}{d.status==='dispatched'&&service!=='legal_notice'&&<button className="assign" onClick={()=>setDelivering(true)}>Confirm delivery</button>}</div>}
  </section>
  {d.intake.intake_version!==3&&<CaseRefunds key={d.id+':'+d.status} caseId={d.id}/>}
  {service==='fir_draft'&&<FirFlowPanel caseId={d.id} status={d.status+':'+(d.sub_status??'')}/>}
  {service==='legal_notice'&&<NoticeFlowPanel caseId={d.id} status={d.status+':'+(d.sub_status??'')} changed={()=>setReload(n=>n+1)}/>}
  {service==='fir_draft'&&<FirApprovalPanel record={d} reload={()=>setReload(n=>n+1)}/>}
  {isReportService(service)&&<><ReportPanel record={d} reload={()=>setReload(n=>n+1)}/>{isFlowReportService(service)?<ReportIntake record={d}/>:<section className="detail-panel"><div className="section-title"><h2>Original client intake</h2></div>{Object.values(d.intake).some(present)?<Values value={d.intake}/>:<p>No intake saved yet.</p>}</section>}</>}
  {isConsultationService(service)&&<>{d.intake.intake_version===3&&(service==='district_court'||service==='high_court')?<CourtPanel record={d} reload={()=>setReload(n=>n+1)}/>:<ConsultationPanel record={d} reload={()=>setReload(n=>n+1)}/>}<section className="detail-panel"><div className="section-title"><h2>Original client intake</h2></div>{d.intake.intake_version===3?<CourtIntakeSummary value={d.intake}/>:Object.values(d.intake).some(present)?<Values value={d.intake}/>:<p>No intake saved yet.</p>}</section></>}
  {service==='fir_draft'&&<section className="detail-panel fir-intake"><div className="section-title"><h2>Original intake</h2></div>{Object.values(d.intake).some(present)?<Values value={d.intake}/>:<p>No intake was recorded for this case.</p>}</section>}
  <section className="people-section"><h2>People</h2><div className="people-grid">{d.contacts.map((c,i)=><article className="person" key={i}><p className="eyebrow">{c.role==='sender'?'SENDER · INTAKE':label(c.role)}</p>{c.name&&<h3>{c.name}</h3>}<dl><Field name="Title" value={c.salutation}/><Field name="Age" value={c.age}/><Field name="Relation" value={c.relation}/><Field name="Father’s or husband’s name" value={c.relative_name}/><Field name="Email" value={c.email}/><Field name="Phone" value={isFlowReportService(service)?reportPhone(c.phone):c.phone}/><Field name="Address" value={c.address}/><Field name="Relationship" value={c.relationship}/></dl></article>)}</div></section>
  <nav className="case-sections" aria-label="Case sections">
   {d.events.length>0&&<a href="#timeline">Timeline <span>{d.events.length}</span></a>}
   {d.drafts.length>0&&<a href="#drafts">Drafts <span>{d.drafts.length}</span></a>}
   {d.documents.length>0&&<a href="#documents">Documents <span>{d.documents.length}</span></a>}
   {d.payments.length>0&&<a href="#payments">Payments <span>{d.payments.length}</span></a>}
   {d.shipments.length>0&&<a href="#shipments">Shipments <span>{d.shipments.length}</span></a>}
  </nav>
  <div className="case-columns"><div className="case-spine">{d.events.length>0&&<section id="timeline" className="detail-panel timeline-panel"><div className="section-title"><h2>Case timeline</h2><span>{d.events.length} {d.events.length===1?'event':'events'} · newest first</span></div>
   <ol className="case-timeline">{d.events.map(e=><li key={e.id}><div className="event-heading"><strong>{eventTitle(e)}</strong><Demo show={e.source==='simulated'}/><time dateTime={e.created_at}>{date(e.created_at)}</time></div>
    {(e.actor||e.from_status)&&<p>{e.actor?.name}{e.actor?.role?` · ${label(e.actor.role)}`:''}{e.from_status && e.from_status!==e.to_status?<span className="event-transition">{label(e.from_status)} → {e.to_status?label(e.to_status):label(e.type)}</span>:null}</p>}
    {Object.values(e.payload).some(present)&&<details><summary>Event details</summary><Values notice={service==='legal_notice'} report={isFlowReportService(service)} value={e.payload}/></details>}
   </li>)}</ol>
  </section>}  {d.drafts.length>0&&<section id="drafts" className="detail-panel drafts-panel"><div className="section-title"><h2>Drafts</h2><span>Latest first</span></div>{d.drafts.map((draft,i)=><details key={draft.id} open={i===0}><summary>{i===0?'Current draft':'Draft'} · v{draft.version}<span>{draft.author} · {date(draft.created_at)}</span></summary>{draft.document_id&&relatedDoc(draft.document_id)}<dl className="draft-content">{Object.entries(draft.content).filter(([key,v])=>present(v)&&(service!=='fir_draft'||key!=='document_ids')).map(([key,v])=><Field key={key} name={label(key)} value={isReportService(service)&&['report_document_id','document_ids'].includes(key)?'See the case documents.':isReportService(service)&&key==='signature'?'Drawn signature recorded with this version; see the PDF.':typeof v==='string'?(isFlowReportService(service)?reportValue(key,v):v):(service==='fir_draft'||isReportService(service))&&typeof v==='object'?<Values report={isFlowReportService(service)} value={v as Record<string,unknown>}/>:JSON.stringify(v)}/>)}</dl></details>)}</section>}</div><div className="case-evidence">
   {d.documents.length>0&&<section id="documents" className="detail-panel"><div className="section-title"><h2>Documents</h2><span>{d.documents.length} {d.documents.length===1?'file':'files'}</span></div>{(['client','advocate','admin','generated'] as const).map(origin=>{const docs=d.documents.filter(x=>x.origin===origin);return docs.length?<div className="document-group" key={origin}><h3>{label(origin)} <span>{docs.length}</span></h3>{docs.map(document)}</div>:null;})}</section>}
   {d.payments.length>0&&<section id="payments" className="detail-panel"><div className="section-title"><h2>Payments</h2><span>{d.payments.length} {d.payments.length===1?'record':'records'}</span></div>{d.payments.map(p=><article className="payment-row" key={p.id}><div><strong>{label(p.purpose)}<Demo show={p.simulated}/></strong><b>{money(p.total_paise)}</b></div><p>{p.payer.name} · {label(p.payer.role)}</p><p className="payment-state">{label(p.status)} · {date(p.captured_at??p.created_at)}</p><details><summary>Amount breakdown</summary><dl><Field name="Base" value={money(p.base_amount_paise)}/><Field name="GST" value={money(p.gst_paise)}/></dl></details></article>)}</section>}
   {d.shipments.map((s,i)=><section id={i===0?"shipments":undefined} className="detail-panel" key={s.id}><div className="section-title"><h2>Shipment<Demo show={s.simulated}/></h2><span>{label(s.status)}</span></div><dl className="shipment-fields">
    <Field name="Direction" value={label(s.direction)}/><Field name="Carrier" value={s.carrier}/><Field name="Waybill" value={s.waybill}/><Field name="Dispatch date" value={s.dispatch_date}/><Field name="Booked" value={s.booked_at?date(s.booked_at):null}/><Field name="Dispatched" value={s.dispatched_at?date(s.dispatched_at):null}/><Field name="Expected delivery" value={s.expected_delivery}/><Field name="Received by" value={s.received_by}/><Field name="Delivered" value={s.delivered_at?date(s.delivered_at):null}/><Field name="Courier office" value={s.courier_office}/><Field name="Courier phone" value={s.courier_phone}/><Field name="Tracking URL" value={s.tracking_url}/><Field name="Receipt" value={relatedDoc(s.receipt_document_id)}/><Field name="Proof of delivery" value={relatedDoc(s.pod_document_id)}/>
   </dl>{d.events.some(e=>e.payload.shipment_id===s.id)&&<ol className="shipment-milestones">{d.events.filter(e=>e.payload.shipment_id===s.id).slice().reverse().map(e=><li key={e.id}><strong>{e.type === 'status_changed' && e.to_status === 'completed' ? 'Delivered' : eventTitle(e)}<Demo show={e.source==='simulated'}/></strong><time>{date(e.created_at)}</time></li>)}</ol>}</section>)}
  </div></div>

  {assign&&<AssignAdvocate caseId={d.id} reference={d.reference} service={service} close={()=>setAssign(false)} assigned={()=>{setAssign(false);setReload(n=>n+1);}}/>}
  {delivering&&<ConfirmDelivery record={d} close={()=>setDelivering(false)} confirmed={()=>{setDelivering(false);setReload(n=>n+1);}}/>}
  {preview&&<Preview report={isFlowReportService(service)} notice={service==='legal_notice'} doc={preview} close={()=>setPreview(null)}/>}
 </main>;
}

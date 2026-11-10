import { AssignAdvocate } from './assign-advocate';
import {WaitingAge,Turnaround} from './fir-approval';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ADMIN_CASE_BUCKETS, ADMIN_CASE_BUCKET_LABELS, ApiError, SERVICE_NAMES, adminCasePath, type ServiceCode, type AdminCaseBucket, type AdminCasePage } from '@legalitt/shared';
import { api, useSession } from './session';
import {isConsultationService,isReportService,PROPERTY_TYPES,FORENSIC_DOCUMENT_TYPES} from '@legalitt/shared';

const matterLabels: Record<string, string> = {
  ...Object.fromEntries([...PROPERTY_TYPES,...FORENSIC_DOCUMENT_TYPES].map(v=>[v.code,v.label])),
  property_dispute: 'Property Dispute', money_recovery: 'Money Recovery', tenant_issue: 'Tenant Issue',
  family_dispute: 'Family Dispute', cheque_bounce: 'Cheque Bounce', consumer_complaint: 'Consumer Complaint',
};
const partyLabels: Record<string, string> = {sender: 'Sender', noticee: 'Noticee', opposing: 'Opposing party', accused: 'Accused', witness: 'Witness'};
const rupees = (value: string) => '₹' + (BigInt(value) / 100n).toLocaleString('en-IN') + '.' + (BigInt(value) % 100n).toString().padStart(2, '0');
export function Notices({service = 'legal_notice'}: {service?: ServiceCode}) {
  const noun = service === 'legal_notice' ? 'notices' : 'cases';
  const heading = service === 'legal_notice' ? 'Legal Notices' : SERVICE_NAMES[service];
  const {refuse} = useSession();
  const [assigning, setAssigning] = useState<{id: string; reference: string} | null>(null);
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  const queue = (service==='fir_draft'||isConsultationService(service)||isReportService(service))&&params.get('queue')==='approval'?'approval':undefined;
  const selected = params.get('bucket');
  const bucket = ADMIN_CASE_BUCKETS.find(b => b === selected);
  const [input, setInput] = useState(search);
  const [data, setData] = useState<AdminCasePage | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]), [page, setPage] = useState(0), [reload, setReload] = useState(0);
  useEffect(() => {setInput(search); setCursors([undefined]); setPage(0);}, [search, bucket, service, queue]);
  const cursor = cursors[page];
  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    api.adminCases({service, bucket, search, cursor, limit: 20, queue}).then(result => {
      if (alive) setData(result);
    }).catch(e => {
      if (!alive) return;
      setData(null);
      if (e instanceof ApiError && [401, 403].includes(e.status)) refuse(e.status === 403 ? 'Admin access required. Sign in with an admin account.' : 'Your session has expired. Sign in again.');
      else setError(e instanceof Error ? e.message : `Unable to load ${noun}`);
    }).finally(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, [bucket, search, cursor, reload, service, queue]);
  function filter(nextBucket: AdminCaseBucket | undefined, nextSearch = search) {
    setCursors([undefined]); setPage(0);
    setParams({...nextBucket ? {bucket: nextBucket} : {}, ...nextSearch ? {search: nextSearch} : {}});
  }
  return <main className="notices"><div className="page-title"><div><h1>{heading}</h1><p>{data ? `${data.total} total ${noun}` : loading ? `Loading ${noun}…` : ''}</p></div></div>
    {service==='fir_draft'&&<section className="fir-stall" aria-label="Approval queue"><strong>{data?.approval_waiting??'—'} FIR drafts awaiting admin approval</strong><p>Review drafts and identity replacements, return corrections, and monitor the promised turnaround from payment.</p><button onClick={()=>{setCursors([undefined]);setPage(0);setParams({queue:'approval'});}}>Review waiting drafts · oldest first</button><button onClick={()=>setReload(n=>n+1)}>Refresh queue</button></section>}
    {isConsultationService(service)&&<section className="fir-stall" aria-label="Consultation review queue"><strong>{data?.approval_waiting??'—'} reports awaiting admin approval</strong><p>Confirm booked advocates, watch appointments that have not started, and review submitted reports.</p><button onClick={()=>{setCursors([undefined]);setPage(0);setParams({queue:'approval'});}}>Review waiting reports · oldest first</button><button onClick={()=>setReload(n=>n+1)}>Refresh queue</button></section>}
    {isReportService(service)&&service!=='property_search'&&<section className="fir-stall" aria-label="Report review queue"><strong>{data?.approval_waiting??'—'} reports awaiting admin approval</strong><p>Review submitted files or return required corrections to the advocate. Clients receive only approved versions.</p><button onClick={()=>{setCursors([undefined]);setPage(0);setParams({queue:'approval'});}}>Review waiting reports · oldest first</button><button onClick={()=>setReload(n=>n+1)}>Refresh queue</button></section>}
    <div className="counters" aria-label="Notice status filters">{ADMIN_CASE_BUCKETS.map(b => <button key={b} className={'counter ' + (bucket === b ? 'selected' : '')} aria-pressed={bucket === b} onClick={() => filter(bucket === b ? undefined : b)}>
      <span className={'counter-dot ' + b}/><span>{ADMIN_CASE_BUCKET_LABELS[b]}</span><strong>{data?.counts[b] ?? '—'}</strong>
    </button>)}</div>
    <section className="table-panel"><div className="toolbar"><button className={!bucket ? 'all selected' : 'all'} onClick={() => filter(undefined)}>All {noun}</button>
      <form role="search" onSubmit={e => {e.preventDefault(); filter(bucket, input.trim());}}><input aria-label={`Search ${noun}`} placeholder="Search by client, case #, or matter…" value={input} onChange={e => setInput(e.target.value)}/><button type="submit">Search</button></form>
    </div>
    {error && <div role="alert" className="error">{error} <button onClick={() => setReload(n => n + 1)}>Retry</button></div>}
    <div className="table-scroll" aria-busy={loading}><table><thead><tr>{['CASE #','CLIENT','MATTER','ADVOCATE','DOCUMENTS','STATUS','AMOUNT','CREATED','ACTIONS'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={9} className="empty" role="status">Loading {noun}…</td></tr> : data?.items.map(row => <tr key={row.id}>
        <td className="reference"><Link className="case-reference-link" to={adminCasePath(row.service_code ?? service,row.id)}>{row.reference}</Link>{row.simulated && <small className="demo" title="This case has simulated events">demo</small>}</td><td className="client">{row.client.name}</td>
        <td className="matter">{row.matter_type && matterLabels[row.matter_type] && <strong>{matterLabels[row.matter_type]}</strong>}{row.parties.map((party, i) => <div className="party" key={i}>{partyLabels[party.kind] && <span>{partyLabels[party.kind]}: </span>}{party.name}</div>)}</td>
        <td>{row.advocate ? row.advocate.name : row.bucket === 'open' ? isConsultationService(service)?<Link to={adminCasePath(service,row.id)}>Confirm booked advocate</Link>:<button className="assign" onClick={() => setAssigning({id: row.id, reference: row.reference})}>+ Assign</button> : null}{row.consultation&&<small>{new Date(row.consultation.scheduled_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST · {row.consultation.status}</small>}{row.consultation?.status==='scheduled'&&new Date(row.consultation.scheduled_at).getTime()<Date.now()&&<strong className="error">Appointment passed — not started</strong>}</td>
        <td className="documents">{(['client', 'advocate', 'admin', 'generated'] as const).map(origin => row.documents[origin] > 0 && <span key={origin}>{row.documents[origin]} {origin} {row.documents[origin] === 1 ? 'doc' : 'docs'}{row.simulated_documents[origin] > 0 && <small className="demo" title={`${row.simulated_documents[origin]} of ${row.documents[origin]} documents are simulated`}>{row.simulated_documents[origin] === row.documents[origin] ? 'demo' : `${row.simulated_documents[origin]} demo`}</small>}</span>)}</td>
        <td><span className={'status ' + row.bucket}>{row.sub_status==='awaiting_admin_approval'?'Awaiting admin approval':(row.service_code==='fir_draft'||isConsultationService(service)||isReportService(service))&&row.sub_status?row.sub_status.replaceAll('_',' '):ADMIN_CASE_BUCKET_LABELS[row.bucket]}</span>{row.turnaround&&<Turnaround value={row.turnaround}/>} {row.sub_status==='awaiting_admin_approval'&&<div className="waiting-age">{row.review_submitted_at?<WaitingAge since={row.review_submitted_at}/>:row.approval?<WaitingAge since={row.approval.submitted_at}/>:<strong>Submission time unavailable · open case to investigate</strong>}<small>Review the current submission or return it for correction.</small></div>}</td>
        <td className="amount">{row.amount_paise !== null && rupees(row.amount_paise)}</td>
        <td className="date">{new Date(row.created_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</td><td>{row.sub_status==='awaiting_admin_approval'&&<Link to={adminCasePath(service,row.id)}>Review draft</Link>}</td>
      </tr>)}
      {!loading && !error && !data?.items.length && <tr><td colSpan={9} className="empty">No {noun} found</td></tr>}
    </tbody></table></div>
    <div className="pagination"><span>{data && !loading ? `${data.filtered_total} ${noun}` : ''}</span><button disabled={loading || page === 0} onClick={() => setPage(n => n - 1)}>Previous</button><span>Page {page + 1}</span><button disabled={loading || !data?.next_cursor} onClick={() => {if (data?.next_cursor) {setCursors(old => [...old.slice(0, page + 1), data.next_cursor!]); setPage(n => n + 1);}}}>Next</button></div>
    </section>
    {assigning && <AssignAdvocate caseId={assigning.id} reference={assigning.reference} service={service} close={() => setAssigning(null)} assigned={() => {
      setAssigning(null); setCursors([undefined]); setPage(0); setReload(n => n + 1);
    }}/>}
  </main>;
}

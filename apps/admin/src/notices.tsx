import { AssignAdvocate } from './assign-advocate';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ADMIN_CASE_BUCKETS, ADMIN_CASE_BUCKET_LABELS, ApiError, SERVICE_NAMES, adminCasePath, type ServiceCode, type AdminCaseBucket, type AdminCasePage } from '@legalitt/shared';
import { api, useSession } from './session';

const matterLabels: Record<string, string> = {
  property_dispute: 'Property Dispute', money_recovery: 'Money Recovery', tenant_issue: 'Tenant Issue',
  family_dispute: 'Family Dispute', cheque_bounce: 'Cheque Bounce', consumer_complaint: 'Consumer Complaint',
};
const partyLabels: Record<string, string> = {sender: 'Sender', noticee: 'Noticee', opposing: 'Opposing party', accused: 'Accused', witness: 'Witness'};
const rupees = (value: string) => '₹' + ((BigInt(value) + 50n) / 100n).toLocaleString('en-IN');
export function Notices({service = 'legal_notice'}: {service?: ServiceCode}) {
  const noun = service === 'legal_notice' ? 'notices' : 'cases';
  const heading = service === 'legal_notice' ? 'Legal Notices' : SERVICE_NAMES[service];
  const {refuse} = useSession();
  const [assigning, setAssigning] = useState<{id: string; reference: string} | null>(null);
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  const selected = params.get('bucket');
  const bucket = ADMIN_CASE_BUCKETS.find(b => b === selected);
  const [input, setInput] = useState(search);
  const [data, setData] = useState<AdminCasePage | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]), [page, setPage] = useState(0), [reload, setReload] = useState(0);
  useEffect(() => {setInput(search); setCursors([undefined]); setPage(0);}, [search, bucket, service]);
  const cursor = cursors[page];
  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    api.adminCases({service, bucket, search, cursor, limit: 20}).then(result => {
      if (alive) setData(result);
    }).catch(e => {
      if (!alive) return;
      setData(null);
      if (e instanceof ApiError && [401, 403].includes(e.status)) refuse(e.status === 403 ? 'Admin access required. Sign in with an admin account.' : 'Your session has expired. Sign in again.');
      else setError(e instanceof Error ? e.message : `Unable to load ${noun}`);
    }).finally(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, [bucket, search, cursor, reload, service]);
  function filter(nextBucket: AdminCaseBucket | undefined, nextSearch = search) {
    setCursors([undefined]); setPage(0);
    setParams({...nextBucket ? {bucket: nextBucket} : {}, ...nextSearch ? {search: nextSearch} : {}});
  }
  return <main className="notices"><div className="page-title"><div><h1>{heading}</h1><p>{data ? `${data.total} total ${noun}` : loading ? `Loading ${noun}…` : ''}</p></div></div>
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
        <td>{row.advocate ? row.advocate.name : row.bucket === 'open' ? <button className="assign" onClick={() => setAssigning({id: row.id, reference: row.reference})}>+ Assign</button> : null}</td>
        <td className="documents">{(['client', 'advocate', 'admin', 'generated'] as const).map(origin => row.documents[origin] > 0 && <span key={origin}>{row.documents[origin]} {origin} {row.documents[origin] === 1 ? 'doc' : 'docs'}{row.simulated_documents[origin] > 0 && <small className="demo" title={`${row.simulated_documents[origin]} of ${row.documents[origin]} documents are simulated`}>{row.simulated_documents[origin] === row.documents[origin] ? 'demo' : `${row.simulated_documents[origin]} demo`}</small>}</span>)}</td>
        <td><span className={'status ' + row.bucket}>{ADMIN_CASE_BUCKET_LABELS[row.bucket]}</span></td>
        <td className="amount">{row.amount_paise !== null && rupees(row.amount_paise)}</td>
        <td className="date">{new Date(row.created_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</td><td/>
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

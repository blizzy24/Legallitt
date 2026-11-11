import {useEffect, useState} from 'react';
import {Link, useNavigate, useParams, useSearchParams} from 'react-router';
import {ApiError, VERIFICATION_DOCUMENTS, type AdvocateApprovalDetail, type AdvocateApprovalRow} from '@legalitt/shared';
import {api, useSession} from './session';
import {WaitingAge} from './fir-approval';

const ist = (iso: string) => new Date(iso).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) + ' IST';
const label: Record<AdvocateApprovalRow['status'], string> = {not_started: 'Not started', in_review: 'Waiting', approved: 'Approved', needs_update: 'Update requested', rejected: 'Rejected'};
const tone: Record<AdvocateApprovalRow['status'], string> = {not_started: 'closed', in_review: 'open', approved: 'completed', needs_update: 'pending', rejected: 'closed'};
function useRefuse() {
  const {refuse} = useSession();
  return (e: unknown, fallback: string) => {
    if (e instanceof ApiError && [401, 403].includes(e.status)) { refuse(e.status === 403 ? 'Admin access required. Sign in with an admin account.' : 'Your session has expired. Sign in again.'); return ''; }
    return e instanceof Error ? e.message : fallback;
  };
}

/** D-35/D-42 Advocate approvals — built without a design in the panel's existing style. */
export function AdvocateApprovals() {
  const [params, setParams] = useSearchParams(), status = params.get('status') === 'decided' ? 'decided' : 'waiting';
  const [items, setItems] = useState<AdvocateApprovalRow[] | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [reload, setReload] = useState(0), fail = useRefuse();
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    api.adminAdvocateApprovals(status).then(r => alive && setItems(r.items)).catch(e => alive && setError(fail(e, 'Unable to load advocate approvals'))).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status, reload]);
  return <main className="notices"><div className="page-title"><div><h1>Advocate approvals</h1><p>Verification submissions · oldest first · only approved advocates can be assigned or booked</p></div></div>
    <div className="counters" aria-label="Approval filters">{(['waiting', 'decided'] as const).map(s => <button key={s} className={'counter ' + (status === s ? 'selected' : '')} aria-pressed={status === s} onClick={() => setParams(s === 'waiting' ? {} : {status: s})}>
      <span className={'counter-dot ' + (s === 'waiting' ? 'open' : 'completed')}/><span>{s === 'waiting' ? 'Waiting' : 'Decided'}</span><strong>{status === s && items ? items.length : '—'}</strong></button>)}</div>
    <section className="table-panel">
      {error && <div role="alert" className="error">{error} <button onClick={() => setReload(n => n + 1)}>Retry</button></div>}
      <div className="table-scroll" aria-busy={loading}><table><thead><tr>{['ADVOCATE', 'BAR COUNCIL', 'CITY', 'STATUS', status === 'waiting' ? 'WAITING' : 'SUBMITTED', 'ACTIONS'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
        {loading && !items ? <tr><td colSpan={6} className="empty" role="status">Loading advocate approvals…</td></tr> : items?.map(row => <tr key={row.user_id}>
          <td className="reference"><Link className="case-reference-link" to={`/advocate-approvals/${row.user_id}`}>{row.name}</Link>{row.email && <small> · {row.email}</small>}</td>
          <td>{[row.bar_council.state, row.bar_council.number].filter(Boolean).join(' · ')}</td>
          <td>{row.city}</td>
          <td><span className={'status ' + tone[row.status]}>{label[row.status]}</span></td>
          <td>{row.submitted_at ? status === 'waiting' ? <div className="waiting-age"><WaitingAge since={row.submitted_at}/></div> : <span className="date">{ist(row.submitted_at)}</span> : null}</td>
          <td><Link to={`/advocate-approvals/${row.user_id}`}>{status === 'waiting' ? 'Review' : 'View'}</Link></td>
        </tr>)}
        {!loading && !error && !items?.length && <tr><td colSpan={6} className="empty">{status === 'waiting' ? 'No advocates are waiting. Submitted verifications appear here, oldest first.' : 'No decisions recorded yet.'}</td></tr>}
      </tbody></table></div>
    </section>
  </main>;
}

export function AdvocateApprovalDetailPage() {
  const {id = ''} = useParams(), navigate = useNavigate(), fail = useRefuse();
  const [d, setD] = useState<AdvocateApprovalDetail | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [reload, setReload] = useState(0);
  const [reason, setReason] = useState(''), [confirm, setConfirm] = useState<null | 'approved' | 'needs_update' | 'rejected'>(null), [busy, setBusy] = useState(false), [actionError, setActionError] = useState('');
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    api.adminAdvocateApproval(id).then(r => alive && setD(r)).catch(e => alive && setError(fail(e, 'Unable to load this advocate'))).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, reload]);
  const open = async (docId: string) => {
    setActionError('');
    try { const r = await api.adminVerificationDocumentUrl(docId); window.open(r.url, '_blank', 'noopener'); } catch (e) { setActionError(fail(e, 'Could not open the document. Retry.') || 'Could not open the document.'); }
  };
  const decide = async () => {
    if (!confirm) return; setBusy(true); setActionError('');
    try { setD(await api.decideAdvocateApproval(id, {decision: confirm, ...(confirm === 'approved' ? {} : {reason: reason.trim()})})); setConfirm(null); setReason(''); }
    catch (e) { setActionError(fail(e, 'Decision failed') || 'Decision failed'); } finally { setBusy(false); }
  };
  if (loading && !d) return <main className="notices"><p role="status">Loading advocate…</p></main>;
  if (!d) return <main className="notices"><div role="alert" className="error">{error || 'Advocate not found.'} <button onClick={() => setReload(n => n + 1)}>Retry</button> <button onClick={() => navigate('/advocate-approvals')}>Back to approvals</button></div></main>;
  const x = d.details, rows: [string, string | null | undefined][] = [
    ['Full name (as entered)', x.personal.full_name], ['Mobile', x.personal.phone], ['Date of birth', x.personal.date_of_birth || null], ['Gender', x.personal.gender],
    ['Years of practice', x.professional.years_experience == null ? null : String(x.professional.years_experience)], ['Education', x.professional.education],
    ['Courts', x.professional.courts?.join(', ')], ['Languages', x.professional.languages?.join(', ')],
    ['State Bar Council', x.bar_council.state], ['Enrolment number', x.bar_council.number], ['Enrolment year', x.bar_council.enrolment_year == null ? null : String(x.bar_council.enrolment_year)],
    ['Practice areas', x.practice.areas?.join(', ')], ['City', [x.practice.city, x.practice.state].filter(Boolean).join(', ')], ['About', x.practice.bio]];
  return <main className="notices">
    <div className="page-title"><div><p><Link to="/advocate-approvals">← Advocate approvals</Link></p><h1>{d.name}</h1><p>{label[d.status]}{d.submitted_at ? ` · submitted ${ist(d.submitted_at)}` : ''}{d.email ? ` · ${d.email}` : ''}</p></div></div>
    <section className="detail-panel" aria-label="Submitted details"><div className="section-title"><h2>Submitted details</h2></div>
      {rows.filter(([, v]) => v && v.trim()).map(([k, v]) => <p key={k}><strong>{k}:</strong> {v}</p>)}
      {!rows.some(([, v]) => v && v.trim()) && <p>The advocate has not entered any details yet.</p>}
    </section>
    <section className="detail-panel" aria-label="Documents"><div className="section-title"><h2>Documents</h2></div>
      {VERIFICATION_DOCUMENTS.map(k => { const doc = d.documents.find(x => x.kind === k.kind);
        return <p key={k.kind}><strong>{k.label}:</strong> {doc ? <><button onClick={() => void open(doc.id)}>Open {doc.filename} ↗</button> <small>{doc.page_count ? `${doc.page_count} page${doc.page_count > 1 ? 's' : ''} · ` : ''}uploaded {ist(doc.created_at)}</small></> : <span>Not uploaded</span>}</p>; })}
      <p>Review the files yourself. Aadhaar must be masked; never transcribe any identity number. Uploads are not identity verification by themselves.</p>
    </section>
    {d.decision && <section className="detail-panel" aria-label="Last decision"><div className="section-title"><h2>Last decision</h2></div><p>{label[d.decision.decision as AdvocateApprovalRow['status']] ?? d.decision.decision} · {ist(d.decision.decided_at)}</p>{d.decision.reason && <p>Reason shown to the advocate: {d.decision.reason}</p>}</section>}
    {d.status === 'in_review' && <section className="detail-panel" aria-label="Decision"><div className="section-title"><h2>Decision</h2></div>
      {actionError && <div role="alert" className="error">{actionError}</div>}
      {!confirm ? <p><button className="primary" disabled={busy} onClick={() => setConfirm('approved')}>Approve advocate</button> <button disabled={busy} onClick={() => setConfirm('needs_update')}>Request update</button> <button disabled={busy} onClick={() => setConfirm('rejected')}>Reject</button></p> : <div role="alert">
        {confirm === 'approved' ? <p>Approve {d.name}? Their details become their public profile and they can be assigned cases and booked for consultations.</p>
          : <><p>{confirm === 'needs_update' ? 'Ask the advocate to update their submission.' : `Reject ${d.name}'s verification? They will not be assignable or bookable.`} The reason below is shown to the advocate.</p>
            <label>Reason shown to the advocate<textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={1000} rows={3} style={{width: '100%'}}/></label></>}
        <button className="primary" disabled={busy || (confirm !== 'approved' && !reason.trim())} onClick={() => void decide()}>{busy ? 'Recording…' : confirm === 'approved' ? 'Yes, approve' : confirm === 'needs_update' ? 'Send update request' : 'Yes, reject'}</button> <button disabled={busy} onClick={() => { setConfirm(null); setReason(''); }}>Cancel</button>
        {confirm !== 'approved' && !reason.trim() && <p>Enter a reason to continue.</p>}
      </div>}
    </section>}
    {d.status !== 'in_review' && <p>No decision is needed: {d.status === 'approved' ? 'this advocate is approved.' : d.status === 'not_started' ? 'the advocate has not submitted yet.' : 'waiting for the advocate to resubmit.'}</p>}
  </main>;
}

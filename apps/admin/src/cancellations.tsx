import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {ApiError, CANCELLATION_REASONS, SERVICE_NAMES, adminCasePath, formatPaise, type AdminCancellationRow, type CaseCancellation, type ServiceCode} from '@legalitt/shared';
import {WaitingAge} from './fir-approval';
import {api, useSession} from './session';

// D-12/D-13/D-42 — Cancellations & refunds queue. Built without a design, from
// the panel's existing table, stall banner and detail-panel components.
const reasonLabel = (code: string | null) => CANCELLATION_REASONS.find(r => r.code === code)?.label ?? null;
const toPaise = (rupees: string) => {
  const m = rupees.trim().match(/^(\d{1,12})(?:\.(\d{1,2}))?$/);
  return m ? (BigInt(m[1]) * 100n + BigInt((m[2] ?? '').padEnd(2, '0'))).toString() : null;
};

export function Cancellations() {
  const {refuse} = useSession();
  const [tab, setTab] = useState<'pending' | 'decided'>('pending');
  const [rows, setRows] = useState<AdminCancellationRow[] | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0), [open, setOpen] = useState<AdminCancellationRow | null>(null);
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    api.adminCancellations(tab).then(r => {if (alive) setRows(r.items);}).catch(e => {
      if (!alive) return; setRows(null);
      if (e instanceof ApiError && [401, 403].includes(e.status)) refuse(e.status === 403 ? 'Admin access required. Sign in with an admin account.' : 'Your session has expired. Sign in again.');
      else setError(e instanceof Error ? e.message : 'Unable to load cancellations');
    }).finally(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, [tab, reload]);
  return <main className="notices"><div className="page-title"><div><h1>Cancellations &amp; refunds</h1>
    <p>{loading ? 'Loading…' : rows ? `${rows.length} ${tab === 'pending' ? 'waiting for a decision' : 'recorded'}` : ''}</p></div></div>
    <section className="fir-stall" aria-label="About refunds"><strong>Simulated refunds — no money moved</strong>
      <p>Payments in this environment are simulated. Recording a refund writes a refund record against the original payment and closes the case; nothing is sent to a bank. Clients see the amount and your reason.</p></section>
    <div className="counters" role="tablist">{(['pending', 'decided'] as const).map(t => <button key={t} role="tab" aria-selected={tab === t} className={'counter ' + (tab === t ? 'selected' : '')} onClick={() => {setTab(t); setOpen(null);}}>
      <span className={'counter-dot ' + (t === 'pending' ? 'open' : 'completed')}/><span>{t === 'pending' ? 'Waiting · oldest first' : 'Recorded'}</span></button>)}</div>
    {error && <div role="alert" className="error">{error} <button onClick={() => setReload(n => n + 1)}>Retry</button></div>}
    {open && <Decide row={open} close={() => setOpen(null)} done={() => {setOpen(null); setReload(n => n + 1);}}/>}
    <section className="table-panel"><div className="table-scroll" aria-busy={loading}><table><thead><tr>
      {['CASE #', 'SERVICE', 'CLIENT', 'ADVOCATE', 'REASON', tab === 'pending' ? 'WAITING' : 'DECIDED', 'PAID / REFUND', 'ACTIONS'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={8} className="empty" role="status">Loading cancellations…</td></tr>
      : !rows?.length ? <tr><td colSpan={8} className="empty">{tab === 'pending' ? 'No cancellation requests are waiting. Requests appear here when a client asks to cancel after an advocate has accepted.' : 'No refunds recorded yet. Self-serve cancellations and your decisions appear here.'}</td></tr>
      : rows.map(r => <tr key={r.id}>
        <td className="reference"><Link className="case-reference-link" to={adminCasePath(r.service_code as ServiceCode, r.case_id)}>{r.reference}</Link></td>
        <td>{SERVICE_NAMES[r.service_code as ServiceCode] ?? r.service_code}</td><td className="client">{r.client.name}</td>
        <td>{r.advocate?.name ?? <span className="muted">Not assigned</span>}</td>
        <td>{reasonLabel(r.reason) ?? <span className="muted">No reason given</span>}{r.note && <small className="block">{r.note}</small>}</td>
        <td>{tab === 'pending' ? <div className="waiting-age"><WaitingAge since={r.requested_at}/></div>
          : <>{r.status === 'completed' ? 'Self-serve' : r.status === 'approved' ? 'Approved' : 'Declined'}{r.decided_at && <small className="block">{new Date(r.decided_at).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} IST</small>}</>}</td>
        <td>{formatPaise(r.refundable_paise)}{r.refund_amount_paise !== null && <small className="block">Refund {formatPaise(r.refund_amount_paise)}{r.refunds.length ? ' · simulated' : ''}</small>}</td>
        <td>{tab === 'pending' ? <button onClick={() => setOpen(r)}>Review</button> : r.decision_reason && <small>{r.decision_reason}</small>}</td>
      </tr>)}
    </tbody></table></div></section>
  </main>;
}

function Decide({row, close, done}: {row: AdminCancellationRow; close(): void; done(): void}) {
  const [decision, setDecision] = useState<'approve' | 'decline'>('approve');
  const [amount, setAmount] = useState(formatPaise(row.refundable_paise).replace(/[₹,]/g, ''));
  const [reason, setReason] = useState(''), [confirming, setConfirming] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const paise = toPaise(amount);
  const invalid = decision === 'approve' && (paise === null ? 'Enter an amount in rupees, e.g. 1250.50 (0 for no refund).' : BigInt(paise) > BigInt(row.refundable_paise) ? `The refund cannot exceed ${formatPaise(row.refundable_paise)} paid.` : '')
    || (reason.trim().length < 3 ? 'Enter the reason the client will see.' : '');
  const submit = async () => {
    setBusy(true); setError('');
    try {await api.decideCancellation(row.id, decision === 'approve' ? {decision, refund_amount_paise: paise!, reason: reason.trim()} : {decision, reason: reason.trim()}); done();}
    catch (e) {setError(e instanceof Error ? e.message : 'Could not record the decision'); setConfirming(false);}
    finally {setBusy(false);}
  };
  return <section className="detail-panel" aria-label={`Cancellation for ${row.reference}`}>
    <div className="section-title"><h2>Cancellation request · {row.reference}</h2><button onClick={close}>Close</button></div>
    <div className="fir-review-body">
    <p><strong>{row.client.name}</strong> asked to cancel {SERVICE_NAMES[row.service_code as ServiceCode] ?? row.service_code} while it was <strong>{row.status_at_request.replaceAll('_', ' ')}</strong>
      {row.advocate ? <> with Adv {row.advocate.name}</> : null}. Requested {new Date(row.requested_at).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} IST.</p>
    <p>Reason: {reasonLabel(row.reason) ?? 'None given'}{row.note ? ` — “${row.note}”` : ''}</p>
    <p>Captured client payments still refundable: <strong>{formatPaise(row.refundable_paise)}</strong> (simulated).</p>
    <fieldset><legend>Decision</legend>
      <label><input type="radio" checked={decision === 'approve'} onChange={() => setDecision('approve')}/> Cancel the case and refund</label>
      <label><input type="radio" checked={decision === 'decline'} onChange={() => setDecision('decline')}/> Decline — the case continues</label></fieldset>
    {decision === 'approve' && <label>Refund amount (₹)<input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}/>
      <small>Full: {formatPaise(row.refundable_paise)}. A partial refund leaves the case cancelled with no advocate entitlement (D-14).</small></label>}
    <label>Reason shown to the client<textarea rows={3} value={reason} maxLength={1000} onChange={e => setReason(e.target.value)}/></label>
    {invalid && <p className="muted">{invalid}</p>}
    {error && <div className="error" role="alert">{error}</div>}
    {!confirming ? <button className="primary" disabled={!!invalid || busy} onClick={() => setConfirming(true)}>{decision === 'approve' ? 'Record decision…' : 'Decline request…'}</button>
    : <div className="error" role="alertdialog" aria-label="Confirm decision">
        <p>{decision === 'approve' ? `This cancels ${row.reference}, releases the advocate and records a simulated refund of ${formatPaise(paise ?? '0')}. It cannot be undone.` : `This declines the request. ${row.client.name} sees your reason and the case continues. It cannot be undone.`}</p>
        <button className="primary" disabled={busy} onClick={submit}>{busy ? 'Recording…' : 'Confirm'}</button> <button disabled={busy} onClick={() => setConfirming(false)}>Go back</button></div>}
    </div>
  </section>;
}

/** Refunds on the admin case detail (D-13). Renders nothing for unpaid, never-cancelled cases. */
export function CaseRefunds({caseId}: {caseId: string}) {
  const [data, setData] = useState<CaseCancellation | null>(null), [error, setError] = useState(''), [attempt, setAttempt] = useState(0);
  useEffect(() => {let alive = true; setError(''); api.caseCancellation(caseId).then(r => {if (alive) setData(r);}).catch(e => {if (alive) setError(e instanceof Error ? e.message : 'Unable to load refunds');}); return () => {alive = false;};}, [caseId, attempt]);
  if (error) return <section className="detail-panel"><div className="section-title"><h2>Cancellation &amp; refunds</h2></div><div className="fir-review-body error" role="alert">{error} <button onClick={() => setAttempt(n => n + 1)}>Retry</button></div></section>;
  if (!data || (!data.request && !data.refunds.length)) return null;
  return <section className="detail-panel" aria-label="Cancellation and refunds"><div className="section-title"><h2>Cancellation &amp; refunds</h2></div><div className="fir-review-body">
    {data.request && <p>{data.request.mode === 'self_serve' ? 'Client cancelled before an advocate accepted.' : `Client requested cancellation · ${data.request.status}`}
      {data.request.decision_reason ? ` — ${data.request.decision_reason}` : ''} {data.request.status === 'pending' && <Link to="/cancellations">Open queue</Link>}</p>}
    {data.refunds.map(r => <p key={r.id}>Refund {formatPaise(r.amount_paise)} · {new Date(r.created_at).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} IST · {r.simulated ? 'Simulated refund — no money moved' : 'Recorded'}</p>)}
  </div></section>;
}

import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {ApiError, SERVICE_NAMES, adminCasePath, type AdminDeletionRow, type ServiceCode} from '@legalitt/shared';
import {WaitingAge} from './fir-approval';
import {api, useSession} from './session';

// D-24 / D-42 / D-85 — Account deletion requests. Built without a design from the
// panel's existing counters, table, stall banner and detail panel. Completing a
// request keeps the account deactivated; no data is erased in this build.
export function AccountDeletions() {
  const {refuse} = useSession();
  const [tab, setTab] = useState<'pending' | 'decided'>('pending');
  const [rows, setRows] = useState<AdminDeletionRow[] | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0), [open, setOpen] = useState<AdminDeletionRow | null>(null);
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    api.adminAccountDeletions(tab).then(r => {if (alive) setRows(r.items);}).catch(e => {
      if (!alive) return; setRows(null);
      if (e instanceof ApiError && [401, 403].includes(e.status)) refuse(e.status === 403 ? 'Admin access required. Sign in with an admin account.' : 'Your session has expired. Sign in again.');
      else setError(e instanceof Error ? e.message : 'Unable to load deletion requests');
    }).finally(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, [tab, reload]);
  return <main className="notices"><div className="page-title"><div><h1>Account deletion requests</h1>
    <p>{loading ? 'Loading…' : rows ? `${rows.length} ${tab === 'pending' ? 'waiting for a decision' : 'decided'}` : ''}</p></div></div>
    <section className="fir-stall" aria-label="About deletion requests"><strong>Accounts are deactivated, not erased</strong>
      <p>The client's account was deactivated when they asked for deletion. Completing a request records your decision and keeps the account deactivated. Erasing personal data waits for Legalitt's data-retention policy; nothing is deleted from this screen.</p></section>
    <div className="counters" role="tablist">{(['pending', 'decided'] as const).map(t => <button key={t} role="tab" aria-selected={tab === t} className={'counter ' + (tab === t ? 'selected' : '')} onClick={() => {setTab(t); setOpen(null);}}>
      <span className={'counter-dot ' + (t === 'pending' ? 'open' : 'completed')}/><span>{t === 'pending' ? 'Waiting · oldest first' : 'Decided'}</span></button>)}</div>
    {error && <div role="alert" className="error">{error} <button onClick={() => setReload(n => n + 1)}>Retry</button></div>}
    {open && <Decide row={open} close={() => setOpen(null)} done={() => {setOpen(null); setReload(n => n + 1);}}/>}
    <section className="table-panel"><div className="table-scroll" aria-busy={loading}><table><thead><tr>
      {['ACCOUNT', 'ROLE', 'REASON', 'CASES', tab === 'pending' ? 'WAITING' : 'DECISION', 'ACTIONS'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={6} className="empty" role="status">Loading deletion requests…</td></tr>
      : !rows?.length ? <tr><td colSpan={6} className="empty">{tab === 'pending' ? 'No deletion requests are waiting. A request appears here when a client asks to delete their account from Data & Documents.' : 'No requests decided yet.'}</td></tr>
      : rows.map(r => <tr key={r.id}>
        <td className="client">{r.user.name}{(r.user.email || r.user.phone) && <small className="block">{r.user.email ?? r.user.phone}</small>}</td>
        <td>{r.user.role ?? '—'}</td>
        <td>{r.reason ?? <span className="muted">No reason given</span>}</td>
        <td>{r.cases.length}{r.blockers.length > 0 && <small className="block">{r.blockers.length} paid in progress</small>}</td>
        <td>{tab === 'pending' ? <div className="waiting-age"><WaitingAge since={r.requested_at}/></div>
          : <>{r.status === 'completed' ? 'Completed · account stays deactivated' : 'Reactivated'}{r.decided_at && <small className="block">{new Date(r.decided_at).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} IST</small>}</>}</td>
        <td>{tab === 'pending' ? <button onClick={() => setOpen(r)}>Review</button> : r.decision_note && <small>{r.decision_note}</small>}</td>
      </tr>)}
    </tbody></table></div></section>
  </main>;
}

function Decide({row, close, done}: {row: AdminDeletionRow; close(): void; done(): void}) {
  const [decision, setDecision] = useState<'complete' | 'reactivate'>('complete');
  const [note, setNote] = useState(''), [confirming, setConfirming] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const blocked = decision === 'complete' && row.blockers.length > 0;
  const invalid = blocked ? 'This client has a paid case in progress. Resolve or cancel it before completing the deletion.' : note.trim().length < 3 ? 'Enter a note for the record.' : '';
  const submit = async () => {
    setBusy(true); setError('');
    try {await api.decideAccountDeletion(row.id, {decision, note: note.trim()}); done();}
    catch (e) {setError(e instanceof Error ? e.message : 'Could not record the decision'); setConfirming(false);}
    finally {setBusy(false);}
  };
  return <section className="detail-panel" aria-label={`Deletion request for ${row.user.name}`}>
    <div className="section-title"><h2>Deletion request · {row.user.name}</h2><button onClick={close}>Close</button></div>
    <div className="fir-review-body">
      <p>Requested {new Date(row.requested_at).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} IST · account is <strong>{row.user.account_status ?? 'unknown'}</strong>.</p>
      {[row.user.email, row.user.phone].filter(Boolean).map(v => <p key={v!}>{v}</p>)}
      <p>Reason: {row.reason ?? 'None given'}</p>
      {row.cases.length ? <><p>Cases ({row.cases.length}):</p><ul>{row.cases.map(c => <li key={c.id}><Link to={adminCasePath(c.service_code as ServiceCode, c.id)}>{c.reference}</Link> · {SERVICE_NAMES[c.service_code as ServiceCode] ?? c.service_code} · {c.status.replaceAll('_', ' ')}</li>)}</ul></> : <p>No cases.</p>}
      <fieldset><legend>Decision</legend>
        <label><input type="radio" checked={decision === 'complete'} onChange={() => setDecision('complete')}/> Complete — keep the account deactivated</label>
        <label><input type="radio" checked={decision === 'reactivate'} onChange={() => setDecision('reactivate')}/> Reactivate — the client can sign in again</label></fieldset>
      <label>Note for the record{decision === 'reactivate' ? ' (sent to the client)' : ''}<textarea rows={3} value={note} maxLength={1000} onChange={e => setNote(e.target.value)}/></label>
      {invalid && <p className="muted">{invalid}</p>}
      {error && <div className="error" role="alert">{error}</div>}
      {!confirming ? <button className="primary" disabled={!!invalid || busy} onClick={() => setConfirming(true)}>{decision === 'complete' ? 'Complete request…' : 'Reactivate account…'}</button>
      : <div className="error" role="alertdialog" aria-label="Confirm decision">
          <p>{decision === 'complete' ? `This closes the request and keeps ${row.user.name}'s account deactivated. No data is erased. It cannot be undone from this screen.` : `This reactivates ${row.user.name}'s account so they can sign in again, and closes the request. It cannot be undone.`}</p>
          <button className="primary" disabled={busy} onClick={submit}>{busy ? 'Recording…' : 'Confirm'}</button> <button disabled={busy} onClick={() => setConfirming(false)}>Go back</button></div>}
    </div>
  </section>;
}

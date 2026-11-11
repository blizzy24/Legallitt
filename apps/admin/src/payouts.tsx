import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router';
import {ApiError, formatPaise, type AdminPayoutRow} from '@legalitt/shared';
import {api, useSession} from './session';
import {WaitingAge} from './fir-approval';

const ist = (iso: string) => new Date(iso).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) + ' IST';

/** D-36/D-42 Payouts queue — built without a design in the panel's existing style.
 *  No money moves through Legalitt: the admin pays outside the app and records the UTR. */
export function Payouts() {
  const [params, setParams] = useSearchParams(), status = params.get('status') === 'paid' ? 'paid' : 'pending';
  const [data, setData] = useState<{items: AdminPayoutRow[]; counts: {pending: number; paid: number}} | null>(null);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true), [reload, setReload] = useState(0);
  const [open, setOpen] = useState<AdminPayoutRow | null>(null);
  const {refuse} = useSession();
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    api.adminPayouts(status).then(r => alive && setData(r)).catch(e => {
      if (!alive) return;
      if (e instanceof ApiError && [401, 403].includes(e.status)) refuse(e.status === 403 ? 'Admin access required. Sign in with an admin account.' : 'Your session has expired. Sign in again.');
      else setError(e instanceof Error ? e.message : 'Unable to load payouts');
    }).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status, reload]);
  return <main className="notices"><div className="page-title"><div><h1>Payouts</h1><p>Advocate withdrawal requests · oldest first · paid outside Legalitt, recorded here with the bank UTR</p></div></div>
    <div className="counters" aria-label="Payout status filters">{(['pending', 'paid'] as const).map(s => <button key={s} className={'counter ' + (status === s ? 'selected' : '')} aria-pressed={status === s} onClick={() => setParams(s === 'pending' ? {} : {status: s})}>
      <span className={'counter-dot ' + (s === 'pending' ? 'open' : 'completed')}/><span>{s === 'pending' ? 'To pay' : 'Paid'}</span><strong>{data?.counts[s] ?? '—'}</strong></button>)}</div>
    <section className="table-panel">
      {error && <div role="alert" className="error">{error} <button onClick={() => setReload(n => n + 1)}>Retry</button></div>}
      <div className="table-scroll" aria-busy={loading}><table><thead><tr>{['ADVOCATE', 'AMOUNT', 'BANK ACCOUNT', status === 'pending' ? 'WAITING' : 'UTR', status === 'pending' ? 'REQUESTED' : 'PAID', 'ACTIONS'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
        {loading && !data ? <tr><td colSpan={6} className="empty" role="status">Loading payouts…</td></tr>
          : !data?.items.length ? <tr><td colSpan={6} className="empty">{status === 'pending' ? 'No withdrawal requests are waiting. Requests appear here when an advocate withdraws from their wallet.' : 'No payouts have been recorded yet.'}</td></tr>
          : data.items.map(row => <tr key={row.id}>
            <td className="client">{row.advocate.name}{row.advocate.email && <small> · {row.advocate.email}</small>}</td>
            <td className="amount">{formatPaise(row.amount_paise)}</td>
            <td className="matter">{row.bank.bank_name} ••••{row.bank.account_number.slice(-4)}<small className="demo">unverified</small></td>
            <td>{status === 'pending' ? <div className="waiting-age"><WaitingAge since={row.requested_at}/></div> : row.utr}</td>
            <td className="date">{ist(status === 'pending' ? row.requested_at : row.paid_at ?? row.requested_at)}</td>
            <td><button onClick={() => setOpen(row)}>{status === 'pending' ? 'Record payment' : 'View'}</button></td>
          </tr>)}
      </tbody></table></div>
    </section>
    {open && <PayoutPanel row={open} close={() => setOpen(null)} done={() => { setOpen(null); setReload(n => n + 1); }}/>}
  </main>;
}

function PayoutPanel({row, close, done}: {row: AdminPayoutRow; close(): void; done(): void}) {
  const [utr, setUtr] = useState(''), [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10)), [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const valid = /^[A-Za-z0-9]{6,30}$/.test(utr.trim());
  const record = async () => {
    setBusy(true); setError('');
    try { await api.markPayoutPaid(row.id, utr.trim(), paidOn); done(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to record the payment'); setConfirm(false); }
    finally { setBusy(false); }
  };
  return <section className="detail-panel" aria-label="Payout request"><div className="fir-review-body">
      <div className="section-title"><h2>{row.status === 'pending' ? 'Record payment' : 'Payout recorded'}</h2><button onClick={close}>Close</button></div>
      <p><strong>{formatPaise(row.amount_paise)}</strong> to {row.advocate.name}</p>
      <dl>
        <dt>Account holder</dt><dd>{row.bank.holder_name}</dd>
        <dt>Bank</dt><dd>{row.bank.bank_name}</dd>
        <dt>IFSC</dt><dd>{row.bank.ifsc}</dd>
        <dt>Account number</dt><dd>{row.bank.account_number}</dd>
        {row.bank.account_type && <><dt>Account type</dt><dd>{row.bank.account_type}</dd></>}
        <dt>Verification</dt><dd>Unverified — penny-drop verification is not built. Confirm the details with the advocate if unsure.</dd>
        <dt>Requested</dt><dd>{ist(row.requested_at)}</dd>
        {row.utr && <><dt>UTR</dt><dd>{row.utr}</dd></>}
        {row.paid_on && <><dt>Paid on</dt><dd>{row.paid_on}</dd></>}
      </dl>
      {row.status === 'pending' && <>
        <p>Pay this amount from Legalitt's bank account outside the panel, then record the bank's UTR. Nothing here moves money.</p>
        <label>UTR<input value={utr} onChange={e => setUtr(e.target.value)} placeholder="As shown by the bank" maxLength={30}/></label>
        {utr && !valid && <p className="error">Enter 6–30 letters or digits, exactly as the bank shows it.</p>}
        <label>Paid on<input type="date" value={paidOn} onChange={e => setPaidOn(e.target.value)}/></label>
        {error && <div role="alert" className="error">{error}</div>}
        {!confirm ? <button className="primary" disabled={!valid || !paidOn || busy} onClick={() => setConfirm(true)}>Record as paid</button>
          : <div className="fir-stall"><p>Record {formatPaise(row.amount_paise)} as paid to {row.advocate.name} with UTR {utr.trim()}? The advocate is notified and this cannot be undone.</p>
            <button onClick={() => setConfirm(false)} disabled={busy}>Cancel</button> <button className="primary" disabled={busy} onClick={record}>{busy ? 'Recording…' : 'Yes, record payment'}</button></div>}
      </>}
    </div></section>;
}
